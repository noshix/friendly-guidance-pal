import assert from "node:assert/strict";
import test from "node:test";

import {
  AdminImageCandidateApiError,
  buildAdminImageCandidateImportUrl,
  buildAdminImageCandidatesUrl,
  getAdminImageCandidates,
  importAdminImageCandidate,
  isAdminImageCandidatesUnauthorizedError,
  mapAdminImageCandidateResponse,
} from "./admin-image-candidates.ts";
import type { AdminCsrfResponse } from "./admin-auth.ts";

const CSRF: AdminCsrfResponse = {
  token: "csrf-real",
  headerName: "X-CSRF-TOKEN",
  parameterName: "_csrf",
};

const importedImagePayload = {
  id: 9,
  url: "https://media.example.test/products/100018/imported.png",
  altText: "Protetor Wi-Fi Lukma",
  position: 0,
  primary: true,
  contentType: "image/png",
};

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

test("POST importa token opaco com credentials include, CSRF e body mínimo", async () => {
  let requestedUrl = "";
  let requestedInit: RequestInit | undefined;
  const result = await importAdminImageCandidate(
    " 00ERP/A ",
    " opaque/token+value ",
    { altText: " Protetor Wi-Fi Lukma ", primary: true },
    CSRF,
    async (input, init) => {
      requestedUrl = String(input);
      requestedInit = init;
      return Response.json(importedImagePayload, { status: 201 });
    },
  );

  assert.equal(
    buildAdminImageCandidateImportUrl("00ERP/A", "opaque/token+value"),
    "/api/admin/products/00ERP%2FA/image-candidates/opaque%2Ftoken%2Bvalue/import",
  );
  assert.equal(requestedUrl, buildAdminImageCandidateImportUrl("00ERP/A", "opaque/token+value"));
  assert.equal(requestedInit?.method, "POST");
  assert.equal(requestedInit?.credentials, "include");
  const headers = new Headers(requestedInit?.headers);
  assert.equal(headers.get("X-CSRF-TOKEN"), "csrf-real");
  assert.equal(headers.get("Content-Type"), "application/json");
  const body = JSON.parse(String(requestedInit?.body)) as Record<string, unknown>;
  assert.deepEqual(body, { altText: "Protetor Wi-Fi Lukma", primary: true });
  assert.equal("imageUrl" in body, false);
  assert.equal("sourcePageUrl" in body, false);
  assert.equal("provider" in body, false);
  assert.deepEqual(result, importedImagePayload);
});

test("importação omite alt text vazio e preserva primary false", async () => {
  let body: unknown;
  await importAdminImageCandidate(
    "100018",
    "opaque",
    { altText: "   ", primary: false },
    CSRF,
    async (_input, init) => {
      body = JSON.parse(String(init?.body)) as unknown;
      return Response.json({ ...importedImagePayload, altText: null, primary: false });
    },
  );
  assert.deepEqual(body, { primary: false });
});

test("token vazio e primary inválido são rejeitados antes do fetch", async () => {
  let calls = 0;
  const fetchMock = async () => {
    calls += 1;
    return Response.json(importedImagePayload);
  };
  await assert.rejects(
    () => importAdminImageCandidate("100018", " ", { primary: true }, CSRF, fetchMock),
    (error: unknown) =>
      error instanceof AdminImageCandidateApiError && error.code === "INVALID_CANDIDATE_TOKEN",
  );
  await assert.rejects(
    () =>
      importAdminImageCandidate(
        "100018",
        "opaque",
        { primary: null as unknown as boolean },
        CSRF,
        fetchMock,
      ),
    (error: unknown) =>
      error instanceof AdminImageCandidateApiError && error.code === "INVALID_PRIMARY",
  );
  assert.equal(calls, 0);
});

test("erros reais da importação permanecem tipados e sem corpo técnico", async () => {
  for (const status of [400, 401, 403, 404, 409, 410, 413, 422, 500, 503]) {
    await assert.rejects(
      () =>
        importAdminImageCandidate("100018", "opaque", { primary: true }, CSRF, async () =>
          Response.json({ code: `ERROR_${status}`, message: "stack trace interno" }, { status }),
        ),
      (error: unknown) => {
        assert.ok(error instanceof AdminImageCandidateApiError);
        assert.equal(error.status, status);
        assert.equal(error.message.includes("stack trace"), false);
        return true;
      },
    );
  }
});
