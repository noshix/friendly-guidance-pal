import assert from "node:assert/strict";
import test from "node:test";

import {
  AdminImageEnrichmentApiError,
  createAdminImageEnrichmentJob,
  getAdminImageEnrichmentItems,
  getAdminImageEnrichmentJob,
  getAdminImageEnrichmentJobs,
  mutateAdminImageEnrichmentJob,
  reviewAdminImageEnrichmentItems,
  type AdminImageEnrichmentFetch,
} from "./admin-image-enrichment.ts";

const job = {
  id: 7,
  status: "RUNNING",
  createdBy: "admin",
  autoImport: true,
  maxProducts: 100,
  filterSnapshot: "{}",
  progress: {
    total: 100,
    processed: 20,
    pending: 80,
    autoImported: 8,
    readyForAutoImport: 0,
    reviewRequired: 5,
    noCandidate: 4,
    failed: 1,
    skipped: 2,
    percentage: 20,
  },
  lastErrorCode: null,
  lastErrorMessage: null,
  createdAt: "2026-09-01T12:00:00Z",
  startedAt: "2026-09-01T12:00:01Z",
  finishedAt: null,
  updatedAt: "2026-09-01T12:01:00Z",
};

const item = {
  id: 11,
  erpId: "00118A",
  productName: "Disjuntor bipolar 20A",
  manufacturer: "Schneider",
  reference: "EZ9F33220",
  partNumber: "EZ9F33220",
  status: "REVIEW_REQUIRED",
  attemptCount: 1,
  automationDecision: "REVIEW",
  candidate: {
    imageUrl: "https://images.example/product.png",
    thumbnailUrl: "https://images.example/thumb.png",
    sourcePageUrl: "https://manufacturer.example/product",
    sourceDomain: "manufacturer.example",
    sourceProvider: "serper",
    title: "Disjuntor Schneider",
    matchedBy: "EXACT_REFERENCE",
    confidence: "MEDIUM",
  },
  importedImageId: null,
  errorCode: null,
  errorMessage: null,
  createdAt: "2026-09-01T12:00:00Z",
  startedAt: "2026-09-01T12:00:02Z",
  finishedAt: "2026-09-01T12:00:03Z",
  updatedAt: "2026-09-01T12:00:03Z",
};

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("creates dry-run and auto-import jobs with credentials and CSRF", async () => {
  for (const autoImport of [false, true]) {
    let capturedInput = "";
    let capturedInit: RequestInit | undefined;
    const fetcher: AdminImageEnrichmentFetch = async (input, init) => {
      capturedInput = String(input);
      capturedInit = init;
      return json({ ...job, autoImport }, 201);
    };
    const response = await createAdminImageEnrichmentJob(
      { scope: { onlyWithoutImage: true, erpIds: ["00118A"] }, maxProducts: 100, autoImport },
      { token: "csrf-token", headerName: "X-CSRF-TOKEN", parameterName: "_csrf" },
      fetcher,
    );
    assert.equal(response.autoImport, autoImport);
    assert.equal(capturedInput, "/api/admin/image-enrichment/jobs");
    assert.equal(capturedInit?.credentials, "include");
    assert.equal(new Headers(capturedInit?.headers).get("X-CSRF-TOKEN"), "csrf-token");
  }
});

test("maps job list, detail, product context and stable string ERP ID", async () => {
  const list = await getAdminImageEnrichmentJobs(0, 20, async () =>
    json({ items: [job], page: 0, size: 20, totalElements: 1, totalPages: 1 }),
  );
  const detail = await getAdminImageEnrichmentJob(7, async () => json(job));
  const items = await getAdminImageEnrichmentItems(7, ["REVIEW_REQUIRED"], 0, 20, async () =>
    json({ items: [item], page: 0, size: 20, totalElements: 1, totalPages: 1 }),
  );
  assert.equal(list.items[0]?.progress.autoImported, 8);
  assert.equal(detail.status, "RUNNING");
  assert.equal(items.items[0]?.erpId, "00118A");
  assert.equal(items.items[0]?.manufacturer, "Schneider");
  assert.equal(items.items[0]?.candidate?.sourceDomain, "manufacturer.example");

  const withoutSource = await getAdminImageEnrichmentItems(7, [], 0, 20, async () =>
    json({
      items: [
        {
          ...item,
          candidate: { ...item.candidate, sourceDomain: null, sourcePageUrl: null },
        },
      ],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    }),
  );
  assert.equal(withoutSource.items[0]?.candidate?.sourceDomain, null);
  assert.equal(withoutSource.items[0]?.candidate?.sourcePageUrl, null);
});

test("sends repeated server-side status filters and real pagination", async () => {
  let url = "";
  await getAdminImageEnrichmentItems(
    7,
    ["SKIPPED_ALREADY_HAS_IMAGE", "REJECTED_BY_ADMIN", "CANCELLED"],
    2,
    20,
    async (input) => {
      url = String(input);
      return json({ items: [], page: 2, size: 20, totalElements: 0, totalPages: 0 });
    },
  );
  const parsed = new URL(url, "https://frontend.test");
  assert.deepEqual(parsed.searchParams.getAll("status"), [
    "SKIPPED_ALREADY_HAS_IMAGE",
    "REJECTED_BY_ADMIN",
    "CANCELLED",
  ]);
  assert.equal(parsed.searchParams.get("page"), "2");
});

test("pause, resume and cancel are single CSRF mutations", async () => {
  const calls: string[] = [];
  for (const action of ["pause", "resume", "cancel"] as const) {
    await mutateAdminImageEnrichmentJob(
      7,
      action,
      { token: "csrf", headerName: "X-CSRF-TOKEN", parameterName: "_csrf" },
      async (input, init) => {
        calls.push(`${init?.method} ${String(input)}`);
        return json(job);
      },
    );
  }
  assert.deepEqual(calls, [
    "POST /api/admin/image-enrichment/jobs/7/pause",
    "POST /api/admin/image-enrichment/jobs/7/resume",
    "POST /api/admin/image-enrichment/jobs/7/cancel",
  ]);
});

test("batch review sends only server item IDs and never an arbitrary URL", async () => {
  let body = "";
  const response = await reviewAdminImageEnrichmentItems(
    7,
    "approve",
    [11, 12],
    { token: "csrf", headerName: "X-CSRF-TOKEN", parameterName: "_csrf" },
    async (_input, init) => {
      body = String(init?.body);
      return json({
        requested: 2,
        succeeded: 2,
        failed: 0,
        results: [
          { itemId: 11, status: "AUTO_IMPORTED", errorCode: null, message: null },
          { itemId: 12, status: "AUTO_IMPORTED", errorCode: null, message: null },
        ],
      });
    },
  );
  assert.deepEqual(JSON.parse(body), { itemIds: [11, 12] });
  assert.equal(body.includes("imageUrl"), false);
  assert.equal(body.includes("candidate"), false);
  assert.equal(response.succeeded, 2);
});

test("typed errors do not expose technical response bodies", async () => {
  await assert.rejects(
    () =>
      getAdminImageEnrichmentJob(7, async () =>
        json({ code: "INVALID_STATE", stack: "secret" }, 409),
      ),
    (error: unknown) => {
      assert.ok(error instanceof AdminImageEnrichmentApiError);
      assert.equal(error.status, 409);
      assert.equal(error.code, "INVALID_STATE");
      assert.equal(error.message.includes("secret"), false);
      return true;
    },
  );
});
