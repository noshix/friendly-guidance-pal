import assert from "node:assert/strict";
import test from "node:test";

import {
  PublicCatalogApiError,
  apiPageToUiPage,
  buildPublicProductDetailUrl,
  buildPublicProductsUrl,
  fetchPublicProductDetail,
  fetchPublicProducts,
  formatAvailability,
  formatPublicPrice,
  mapPublicProductSummary,
  toCartItem,
  uiPageToApiPage,
} from "./public-catalog.ts";

const summaryPayload = {
  erpId: "0003481",
  name: "Disjuntor Tripolar 32A",
  manufacturer: "SIEMENS",
  reference: "5SX2332-7",
  category: "PROTEÇÃO",
  price: 39.98,
  availability: "EM_ESTOQUE",
};

test("mapeia listagem, preço e disponibilidade sem converter erpId", () => {
  const product = mapPublicProductSummary(summaryPayload);

  assert.equal(product.erpId, "0003481");
  assert.equal(formatPublicPrice(product.price), "R$ 39,98");
  assert.equal(formatAvailability(product.availability), "Em estoque");
});

test("mantém price null como Consulte e disponibilidade sem saldo exato", () => {
  const product = mapPublicProductSummary({
    ...summaryPayload,
    price: null,
    availability: "CONSULTE_DISPONIBILIDADE",
  });

  assert.equal(formatPublicPrice(product.price), "Consulte");
  assert.equal(formatAvailability(product.availability), "Consulte disponibilidade");
});

test("constrói parâmetros de busca e filtros com paginação zero-based", () => {
  assert.equal(
    buildPublicProductsUrl({
      search: "  disjuntor  ",
      manufacturer: " SIEMENS ",
      category: " PROTEÇÃO ",
      page: 2,
      size: 24,
    }),
    "/api/public/products?search=disjuntor&manufacturer=SIEMENS&category=PROTE%C3%87%C3%83O&page=2&size=24",
  );
  assert.equal(apiPageToUiPage(0), 1);
  assert.equal(uiPageToApiPage(3), 2);
});

test("limita o tamanho de página ao máximo público", () => {
  assert.equal(buildPublicProductsUrl({ size: 1000 }), "/api/public/products?page=0&size=100");
});

test("codifica ERP ID opaco sem remover zeros à esquerda", () => {
  assert.equal(buildPublicProductDetailUrl("00ERP/A 19"), "/api/public/products/00ERP%2FA%2019");
});

test("mapeia página e detalhe reais", async () => {
  const listFetch = async () =>
    new Response(
      JSON.stringify({
        items: [summaryPayload],
        page: 0,
        size: 24,
        totalElements: 1,
        totalPages: 1,
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  const detailFetch = async () =>
    new Response(
      JSON.stringify({
        ...summaryPayload,
        description: "DISJUNTOR TRIPOLAR 32A",
        partNumber: "5SX2332-7",
        ncm: "85362000",
        unit: "UN",
        subcategory: "DISJUNTORES",
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );

  const page = await fetchPublicProducts({}, listFetch);
  const detail = await fetchPublicProductDetail("0003481", detailFetch);

  assert.equal(page.items[0]?.erpId, "0003481");
  assert.equal(page.totalPages, 1);
  assert.equal(detail.partNumber, "5SX2332-7");
  assert.equal(detail.subcategory, "DISJUNTORES");
});

test("representa 404 e erro de API sem expor corpo técnico", async () => {
  const notFoundFetch = async () =>
    new Response(JSON.stringify({ code: "PRODUCT_NOT_FOUND", message: "detalhe interno" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  const serverErrorFetch = async () => new Response("stack trace", { status: 500 });

  await assert.rejects(
    fetchPublicProductDetail("inexistente", notFoundFetch),
    (error: unknown) =>
      error instanceof PublicCatalogApiError &&
      error.status === 404 &&
      error.code === "PRODUCT_NOT_FOUND" &&
      !error.message.includes("detalhe interno"),
  );
  await assert.rejects(
    fetchPublicProducts({}, serverErrorFetch),
    (error: unknown) => error instanceof PublicCatalogApiError && error.status === 500,
  );
});

test("transforma falha de rede em erro seguro", async () => {
  const networkFailure = async (): Promise<Response> => {
    throw new Error("ECONNREFUSED localhost:8080");
  };

  await assert.rejects(
    fetchPublicProducts({}, networkFailure),
    (error: unknown) =>
      error instanceof PublicCatalogApiError &&
      error.status === 0 &&
      error.code === "NETWORK_ERROR" &&
      !error.message.includes("ECONNREFUSED"),
  );
});

test("orçamento recebe o erpId real como String", () => {
  const item = toCartItem(mapPublicProductSummary(summaryPayload), 2);

  assert.equal(item.id, "0003481");
  assert.equal(typeof item.id, "string");
  assert.equal(item.quantity, 2);
  assert.equal(item.price, "39,98");
});
