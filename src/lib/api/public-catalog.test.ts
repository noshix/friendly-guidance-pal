import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  PublicCatalogApiError,
  apiPageToUiPage,
  buildCategoryProductsParams,
  buildHomeProductsParams,
  buildManufacturerProductsParams,
  buildPublicCategoryDetailUrl,
  buildPublicManufacturerDetailUrl,
  buildPublicProductDetailUrl,
  buildPublicProductsUrl,
  fetchPublicProductDetail,
  fetchPublicProducts,
  formatAvailability,
  formatPublicPrice,
  getCategories,
  getCategoryBySlug,
  getManufacturerBySlug,
  getManufacturers,
  mapPublicCategory,
  mapPublicManufacturer,
  mapPublicProductSummary,
  selectHomeCategories,
  toCategoryFilterOption,
  toCartItem,
  toManufacturerFilterOption,
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

const categoryPayload = {
  name: "Condutores",
  erpName: "CONDUTOR ERP",
  slug: "condutores",
  productCount: 1234,
};

const manufacturerPayload = {
  name: "Schneider Electric",
  slug: "schneider-electric",
  productCount: 432,
};

test("getCategories mapeia categorias e preserva contagens", async () => {
  let requestedUrl = "";
  const fetchMock = async (input: string | URL | Request) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify([categoryPayload]), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  const categories = await getCategories(fetchMock);

  assert.equal(requestedUrl, "/api/public/categories");
  assert.deepEqual(categories, [categoryPayload]);
  assert.equal(categories[0]?.productCount, 1234);
});

test("getCategoryBySlug codifica slug e resolve o erpName real", async () => {
  let requestedUrl = "";
  const fetchMock = async (input: string | URL | Request) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify(categoryPayload), { status: 200 });
  };

  const category = await getCategoryBySlug("condutores/industrial", fetchMock);

  assert.equal(
    buildPublicCategoryDetailUrl("condutores/industrial"),
    "/api/public/categories/condutores%2Findustrial",
  );
  assert.equal(requestedUrl, "/api/public/categories/condutores%2Findustrial");
  assert.equal(category.erpName, "CONDUTOR ERP");
});

test("getManufacturers mapeia fabricantes e preserva contagens", async () => {
  let requestedUrl = "";
  const fetchMock = async (input: string | URL | Request) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify([manufacturerPayload]), { status: 200 });
  };

  const manufacturers = await getManufacturers(fetchMock);

  assert.equal(requestedUrl, "/api/public/manufacturers");
  assert.deepEqual(manufacturers, [manufacturerPayload]);
  assert.equal(manufacturers[0]?.productCount, 432);
});

test("getManufacturerBySlug codifica slug e preserva o nome usado no filtro", async () => {
  let requestedUrl = "";
  const fetchMock = async (input: string | URL | Request) => {
    requestedUrl = String(input);
    return new Response(JSON.stringify(manufacturerPayload), { status: 200 });
  };

  const manufacturer = await getManufacturerBySlug("schneider/electric", fetchMock);

  assert.equal(
    buildPublicManufacturerDetailUrl("schneider/electric"),
    "/api/public/manufacturers/schneider%2Felectric",
  );
  assert.equal(requestedUrl, "/api/public/manufacturers/schneider%2Felectric");
  assert.equal(manufacturer.name, "Schneider Electric");
});

test("categoria exibe name mas usa erpName como valor do filtro", () => {
  const category = mapPublicCategory(categoryPayload);
  const option = toCategoryFilterOption(category);
  const params = buildCategoryProductsParams(category, 3, " cabo ", " SIL ");

  assert.equal(option.label, "Condutores");
  assert.equal(option.value, "CONDUTOR ERP");
  assert.deepEqual(params, {
    category: "CONDUTOR ERP",
    page: 2,
    size: 24,
    search: "cabo",
    manufacturer: "SIL",
  });
});

test("fabricante exibe e envia o nome real com paginação no backend", () => {
  const manufacturer = mapPublicManufacturer(manufacturerPayload);
  const option = toManufacturerFilterOption(manufacturer);
  const params = buildManufacturerProductsParams(manufacturer, 4, " disjuntor ", " PROTEÇÃO ");

  assert.equal(option.label, "Schneider Electric");
  assert.equal(option.value, "Schneider Electric");
  assert.deepEqual(params, {
    manufacturer: "Schneider Electric",
    page: 3,
    size: 24,
    search: "disjuntor",
    category: "PROTEÇÃO",
  });
});

test("rejeita contagens de taxonomia inválidas", () => {
  assert.throws(
    () => mapPublicCategory({ ...categoryPayload, productCount: -1 }),
    PublicCatalogApiError,
  );
  assert.throws(
    () => mapPublicManufacturer({ ...manufacturerPayload, productCount: 1.5 }),
    PublicCatalogApiError,
  );
});

test("preserva 404 seguro ao resolver slugs inexistentes", async () => {
  const notFoundFetch = async () =>
    new Response(JSON.stringify({ code: "CATEGORY_NOT_FOUND", message: "detalhe interno" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });

  await assert.rejects(
    getCategoryBySlug("inexistente", notFoundFetch),
    (error: unknown) =>
      error instanceof PublicCatalogApiError &&
      error.status === 404 &&
      error.code === "CATEGORY_NOT_FOUND" &&
      !error.message.includes("detalhe interno"),
  );
});

test("seleciona categorias reais da Home por contagem com ordem estável", () => {
  const categories = [
    { name: "Iluminação", erpName: "ILUMINACAO", slug: "iluminacao", productCount: 8 },
    { name: "Condutores", erpName: "CONDUTORES", slug: "condutores", productCount: 12 },
    { name: "Acessórios", erpName: "ACESSORIOS", slug: "acessorios", productCount: 8 },
  ];

  assert.deepEqual(
    selectHomeCategories(categories, 2).map((category) => category.slug),
    ["condutores", "acessorios"],
  );
  assert.deepEqual(
    categories.map((category) => category.slug),
    ["iluminacao", "condutores", "acessorios"],
  );
  assert.deepEqual(selectHomeCategories([], 8), []);
});

test("Home solicita somente a primeira página pública com limite pequeno", () => {
  assert.deepEqual(buildHomeProductsParams(), { page: 0, size: 4 });
  assert.equal(
    buildPublicProductsUrl(buildHomeProductsParams()),
    "/api/public/products?page=0&size=4",
  );
});

test("Home usa API, slugs e ERP IDs reais sem manter mocks comerciais", async () => {
  const homeSource = await readFile(new URL("../../routes/index.tsx", import.meta.url), "utf8");

  assert.match(homeSource, /getCategories/);
  assert.match(homeSource, /getManufacturers/);
  assert.match(homeSource, /fetchPublicProducts/);
  assert.match(homeSource, /params=\{\{ slug: category\.slug \}\}/);
  assert.match(homeSource, /params=\{\{ slug: manufacturer\.slug \}\}/);
  assert.match(homeSource, /params=\{\{ id: product\.erpId \}\}/);
  assert.match(homeSource, /categoriesQuery\.isPending/);
  assert.match(homeSource, /categoriesQuery\.isError/);
  assert.match(homeSource, /productsQuery\.isPending/);
  assert.match(homeSource, /productsQuery\.isError/);
  assert.doesNotMatch(homeSource, /images\.unsplash\.com/);
  assert.doesNotMatch(
    homeSource,
    /Cabos e Condutores|Proteção Elétrica|SIEMENS|Disjuntor Tripolar 32A/,
  );
  assert.doesNotMatch(homeSource, /11\s*mil produtos|11[.]?000 produtos/i);
});

test("rotas integradas não mantêm mocks ou taxonomias hardcoded", async () => {
  const routeUrls = [
    new URL("../../routes/produtos/index.tsx", import.meta.url),
    new URL("../../routes/categorias/index.tsx", import.meta.url),
    new URL("../../routes/categorias/$slug.tsx", import.meta.url),
    new URL("../../routes/marcas/index.tsx", import.meta.url),
    new URL("../../routes/marcas/$slug.tsx", import.meta.url),
  ];
  const sources = await Promise.all(routeUrls.map((url) => readFile(url, "utf8")));
  const integratedRoutes = sources.join("\n");

  assert.doesNotMatch(integratedRoutes, /MOCK_PRODUCTS|CATEGORY_MAP|SUB_GROUPS/);
  assert.doesNotMatch(integratedRoutes, /const (CATEGORIES|MANUFACTURERS|BRANDS)\s*=/);
});
