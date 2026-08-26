import assert from "node:assert/strict";
import test from "node:test";

import type { AdminCsrfResponse } from "./admin-auth.ts";
import {
  ADMIN_PRODUCT_IMAGE_MAX_BYTES,
  AdminProductMediaApiError,
  buildAdminProductImageUrl,
  buildAdminProductImagesUrl,
  deleteProductImage,
  getProductImages,
  isAdminProductMediaUnauthorizedError,
  updateProductImage,
  uploadProductImage,
  validateProductImageFile,
} from "./admin-product-media.ts";

const CSRF: AdminCsrfResponse = {
  token: "csrf-real",
  headerName: "X-CSRF-TOKEN",
  parameterName: "_csrf",
};

const imagePayload = {
  id: 7,
  url: "https://media.example.test/products/1/image.webp",
  altText: "Disjuntor frontal",
  position: 2,
  primary: true,
  contentType: "image/webp",
};

test("GET imagens preserva ERP ID opaco, mapeia resposta e usa credentials include", async () => {
  let requestedUrl = "";
  let requestedInit: RequestInit | undefined;
  const images = await getProductImages(" 00ERP/A ", async (input, init) => {
    requestedUrl = String(input);
    requestedInit = init;
    return Response.json([imagePayload]);
  });

  assert.equal(buildAdminProductImagesUrl("00ERP/A"), "/api/admin/products/00ERP%2FA/images");
  assert.equal(requestedUrl, "/api/admin/products/00ERP%2FA/images");
  assert.equal(requestedInit?.method, "GET");
  assert.equal(requestedInit?.credentials, "include");
  assert.deepEqual(images, [imagePayload]);
});

test("produto sem imagem é representado por lista vazia", async () => {
  const images = await getProductImages("11872", async () => Response.json([]));
  assert.deepEqual(images, []);
});

test("upload multipart envia arquivo, campos e CSRF sem Content-Type manual", async () => {
  let requestedInit: RequestInit | undefined;
  const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], "produto.jpg", {
    type: "image/jpeg",
  });
  const result = await uploadProductImage(
    "11872",
    file,
    CSRF,
    " Frente do produto ",
    true,
    async (_input, init) => {
      requestedInit = init;
      return Response.json({ ...imagePayload, contentType: "image/jpeg" }, { status: 201 });
    },
  );

  const headers = new Headers(requestedInit?.headers);
  const form = requestedInit?.body;
  assert.ok(form instanceof FormData);
  assert.equal(requestedInit?.method, "POST");
  assert.equal(requestedInit?.credentials, "include");
  assert.equal(headers.get("X-CSRF-TOKEN"), "csrf-real");
  assert.equal(headers.get("Content-Type"), null);
  assert.equal((form.get("file") as File).name, "produto.jpg");
  assert.equal(form.get("altText"), "Frente do produto");
  assert.equal(form.get("primary"), "true");
  assert.equal(result.contentType, "image/jpeg");
});

test("UX aceita JPEG, PNG e WEBP", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"]) {
    const file = new File([new Uint8Array([1])], `produto.${type.split("/")[1]}`, { type });
    assert.equal(validateProductImageFile(file), null);
  }
});

test("UX bloqueia arquivo vazio, tipo inválido e imagem acima de 5 MB", () => {
  assert.match(
    validateProductImageFile(new File([], "vazia.png", { type: "image/png" })) ?? "",
    /arquivo de imagem válido/,
  );
  assert.match(
    validateProductImageFile(new File(["x"], "produto.svg", { type: "image/svg+xml" })) ?? "",
    /JPEG, PNG ou WEBP/,
  );
  const oversized = {
    name: "grande.webp",
    type: "image/webp",
    size: ADMIN_PRODUCT_IMAGE_MAX_BYTES + 1,
  } as File;
  assert.match(validateProductImageFile(oversized) ?? "", /no máximo 5 MB/);
});

test("PATCH marca imagem principal usando CSRF", async () => {
  let requestedUrl = "";
  let requestedInit: RequestInit | undefined;
  const image = await updateProductImage(
    "11872",
    7,
    { primary: true },
    CSRF,
    async (input, init) => {
      requestedUrl = String(input);
      requestedInit = init;
      return Response.json(imagePayload);
    },
  );

  assert.equal(buildAdminProductImageUrl("11872", 7), "/api/admin/products/11872/images/7");
  assert.equal(requestedUrl, "/api/admin/products/11872/images/7");
  assert.equal(requestedInit?.method, "PATCH");
  assert.equal(new Headers(requestedInit?.headers).get("X-CSRF-TOKEN"), "csrf-real");
  assert.deepEqual(JSON.parse(String(requestedInit?.body)), { primary: true });
  assert.equal(image.primary, true);
});

test("PATCH permite editar alt text para texto ou null sem inventar conteúdo", async () => {
  const bodies: unknown[] = [];
  const fetchMock = async (_input: string | URL | Request, init?: RequestInit) => {
    bodies.push(JSON.parse(String(init?.body)) as unknown);
    return Response.json({ ...imagePayload, altText: null });
  };

  await updateProductImage("11872", 7, { altText: "  Vista lateral  " }, CSRF, fetchMock);
  await updateProductImage("11872", 7, { altText: null }, CSRF, fetchMock);

  assert.deepEqual(bodies, [{ altText: "Vista lateral" }, { altText: null }]);
});

test("PATCH altera posição e bloqueia posição negativa antes do fetch", async () => {
  let body: unknown;
  await updateProductImage("11872", 7, { position: 4 }, CSRF, async (_input, init) => {
    body = JSON.parse(String(init?.body)) as unknown;
    return Response.json({ ...imagePayload, position: 4 });
  });
  assert.deepEqual(body, { position: 4 });

  let calls = 0;
  await assert.rejects(
    () =>
      updateProductImage("11872", 7, { position: -1 }, CSRF, async () => {
        calls += 1;
        return Response.json(imagePayload);
      }),
    (error: unknown) => error instanceof AdminProductMediaApiError && error.status === 400,
  );
  assert.equal(calls, 0);
});

test("DELETE usa CSRF, credentials include e aceita 204 sem JSON", async () => {
  let requestedInit: RequestInit | undefined;
  await deleteProductImage("11872", 7, CSRF, async (_input, init) => {
    requestedInit = init;
    return new Response(null, { status: 204 });
  });

  assert.equal(requestedInit?.method, "DELETE");
  assert.equal(requestedInit?.credentials, "include");
  assert.equal(new Headers(requestedInit?.headers).get("X-CSRF-TOKEN"), "csrf-real");
});

test("401 permanece tipado como sessão expirada sem vazar detalhes técnicos", async () => {
  await assert.rejects(
    () =>
      getProductImages("11872", async () =>
        Response.json({ code: "UNAUTHORIZED", message: "detalhe interno" }, { status: 401 }),
      ),
    (error: unknown) => {
      assert.ok(error instanceof AdminProductMediaApiError);
      assert.equal(error.status, 401);
      assert.equal(error.code, "UNAUTHORIZED");
      assert.equal(error.message.includes("detalhe interno"), false);
      assert.equal(isAdminProductMediaUnauthorizedError(error), true);
      return true;
    },
  );
});
