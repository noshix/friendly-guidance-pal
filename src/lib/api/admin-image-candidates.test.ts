import assert from "node:assert/strict";
import test from "node:test";

import {
  AdminImageCandidateApiError,
  buildAdminImageCandidatesUrl,
  getAdminImageCandidates,
  isAdminImageCandidatesUnauthorizedError,
  mapAdminImageCandidateResponse,
} from "./admin-image-candidates.ts";

const responsePayload = {
  product: {
    erpId: "00ERP/A",
    erpDescription: "DISJUNTOR BIPOLAR 20A",
    manufacturer: "Schneider Electric",
    reference: "EZ9F33220",
    partNumber: "PN-20A",
    ean: "0789123456789",
  },
  candidates: [
    {
      id: "opaque-candidate",
      imageUrl: "https://cdn.example.com/product.jpg",
      thumbnailUrl: "https://cdn.example.com/product-thumb.jpg",
      sourcePageUrl: "https://manufacturer.example.com/products/disjuntor",
      sourceDomain: "manufacturer.example.com",
      title: "Disjuntor bipolar 20A",
      matchedBy: "EXACT_REFERENCE",
      confidence: "HIGH",
      width: 1200,
      height: 1200,
    },
  ],
};

test("GET preserva ERP ID opaco, limit e credentials include sem CSRF", async () => {
  let requestedUrl = "";
  let requestedInit: RequestInit | undefined;
  const response = await getAdminImageCandidates(" 00ERP/A ", 6, async (input, init) => {
    requestedUrl = String(input);
    requestedInit = init;
    return Response.json(responsePayload);
  });

  assert.equal(
    buildAdminImageCandidatesUrl("00ERP/A", 6),
    "/api/admin/products/00ERP%2FA/image-candidates?limit=6",
  );
  assert.equal(requestedUrl, "/api/admin/products/00ERP%2FA/image-candidates?limit=6");
  assert.equal(requestedInit?.method, "GET");
  assert.equal(requestedInit?.credentials, "include");
  assert.equal(new Headers(requestedInit?.headers).get("Accept"), "application/json");
  assert.equal(new Headers(requestedInit?.headers).has("X-CSRF-TOKEN"), false);
  assert.equal(response.product.erpId, "00ERP/A");
  assert.equal(response.candidates[0]?.matchedBy, "EXACT_REFERENCE");
  assert.equal(response.candidates[0]?.confidence, "HIGH");
});

test("limit opcional não cria query string e lista vazia permanece vazia", async () => {
  assert.equal(
    buildAdminImageCandidatesUrl("100018"),
    "/api/admin/products/100018/image-candidates",
  );
  const response = await getAdminImageCandidates("100018", undefined, async () =>
    Response.json({ ...responsePayload, candidates: [] }),
  );
  assert.deepEqual(response.candidates, []);
});

test("contrato aceita todos matchedBy e confidence reais", () => {
  const matches = [
    "EXACT_REFERENCE",
    "EXACT_PART_NUMBER",
    "EXACT_EAN",
    "MANUFACTURER_AND_NAME",
    "NAME_ONLY",
  ];
  const confidences = ["HIGH", "MEDIUM", "LOW"];
  const candidates = matches.flatMap((matchedBy, index) =>
    confidences.map((confidence) => ({
      ...responsePayload.candidates[0],
      id: `${index}-${confidence}`,
      matchedBy,
      confidence,
    })),
  );
  const response = mapAdminImageCandidateResponse({ ...responsePayload, candidates });
  assert.equal(response.candidates.length, 15);
});

test("401 permanece tipado como sessão expirada sem vazar resposta técnica", async () => {
  await assert.rejects(
    () =>
      getAdminImageCandidates("100018", 6, async () =>
        Response.json({ code: "UNAUTHORIZED", message: "stack trace interno" }, { status: 401 }),
      ),
    (error: unknown) => {
      assert.ok(error instanceof AdminImageCandidateApiError);
      assert.equal(error.status, 401);
      assert.equal(error.code, "UNAUTHORIZED");
      assert.equal(error.message.includes("stack trace"), false);
      assert.equal(isAdminImageCandidatesUnauthorizedError(error), true);
      return true;
    },
  );
});

test("404, rate limit e indisponibilidade permanecem erros tipados", async () => {
  for (const status of [404, 429, 500, 502, 503]) {
    await assert.rejects(
      () =>
        getAdminImageCandidates("100018", 6, async () =>
          Response.json({ code: `ERROR_${status}` }, { status }),
        ),
      (error: unknown) => error instanceof AdminImageCandidateApiError && error.status === status,
    );
  }
});

test("bloqueia limit inválido e URL externa insegura antes de renderizar", async () => {
  await assert.rejects(
    () => getAdminImageCandidates("100018", 11, async () => Response.json(responsePayload)),
    (error: unknown) =>
      error instanceof AdminImageCandidateApiError && error.code === "INVALID_LIMIT",
  );
  assert.throws(
    () =>
      mapAdminImageCandidateResponse({
        ...responsePayload,
        candidates: [
          {
            ...responsePayload.candidates[0],
            imageUrl: "http://127.0.0.1/private.jpg",
            sourcePageUrl: "file:///etc/passwd",
          },
        ],
      }),
    (error: unknown) => error instanceof AdminImageCandidateApiError,
  );
});
