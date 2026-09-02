import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_ADMIN_IMAGE_ENRICHMENT_FORM,
  adminImageEnrichmentCanCancel,
  adminImageEnrichmentCanPause,
  adminImageEnrichmentCanResume,
  adminImageEnrichmentPollingInterval,
  adminImageEnrichmentStatusesForFilter,
  buildAdminImageEnrichmentRequest,
  describeAdminImageEnrichmentError,
  parseAdminImageEnrichmentErpIds,
  validateAdminImageEnrichmentReviewSelection,
} from "./admin-image-enrichment-flow.ts";
import { AdminImageEnrichmentApiError } from "./api/admin-image-enrichment.ts";

test("defaults to 100 products, without image and safe auto-import", () => {
  assert.equal(DEFAULT_ADMIN_IMAGE_ENRICHMENT_FORM.maxProducts, 100);
  assert.equal(DEFAULT_ADMIN_IMAGE_ENRICHMENT_FORM.onlyWithoutImage, true);
  assert.equal(DEFAULT_ADMIN_IMAGE_ENRICHMENT_FORM.autoImport, true);
});

test("builds dry-run and auto-import payloads without inventing fields", () => {
  const dryRun = buildAdminImageEnrichmentRequest({
    ...DEFAULT_ADMIN_IMAGE_ENRICHMENT_FORM,
    autoImport: false,
    manufacturer: " Schneider ",
    erpIdsText: "001, A-2\n001",
  });
  assert.deepEqual(dryRun, {
    scope: { onlyWithoutImage: true, erpIds: ["001", "A-2"], manufacturer: "Schneider" },
    maxProducts: 100,
    autoImport: false,
  });
  assert.equal(
    buildAdminImageEnrichmentRequest(DEFAULT_ADMIN_IMAGE_ENRICHMENT_FORM).autoImport,
    true,
  );
});

test("enforces UI maximum and bounded scope", () => {
  assert.throws(() =>
    buildAdminImageEnrichmentRequest({ ...DEFAULT_ADMIN_IMAGE_ENRICHMENT_FORM, maxProducts: 101 }),
  );
  assert.throws(() =>
    buildAdminImageEnrichmentRequest({
      ...DEFAULT_ADMIN_IMAGE_ENRICHMENT_FORM,
      maxProducts: 1,
      erpIdsText: "1\n2",
    }),
  );
  assert.throws(() =>
    buildAdminImageEnrichmentRequest({
      ...DEFAULT_ADMIN_IMAGE_ENRICHMENT_FORM,
      onlyWithoutImage: false,
    }),
  );
});

test("keeps ERP IDs opaque and normalized only by trim/deduplication", () => {
  assert.deepEqual(parseAdminImageEnrichmentErpIds("00118A; 0007\n00118A"), ["00118A", "0007"]);
});

test("polls only pending/running and never restarts terminal jobs", () => {
  assert.equal(adminImageEnrichmentPollingInterval("PENDING"), 3000);
  assert.equal(adminImageEnrichmentPollingInterval("RUNNING"), 3000);
  for (const status of ["PAUSED", "COMPLETED", "FAILED", "CANCELLED"] as const) {
    assert.equal(adminImageEnrichmentPollingInterval(status), false);
  }
});

test("allows pause, resume and cancel only in real backend states", () => {
  assert.equal(adminImageEnrichmentCanPause("RUNNING"), true);
  assert.equal(adminImageEnrichmentCanResume("PAUSED"), true);
  assert.equal(adminImageEnrichmentCanResume("CANCELLED"), false);
  assert.equal(adminImageEnrichmentCanCancel("COMPLETED"), false);
});

test("maps visual filters to paginated server statuses", () => {
  assert.deepEqual(adminImageEnrichmentStatusesForFilter("REVIEW"), [
    "REVIEW_REQUIRED",
    "REVIEW_PROCESSING",
  ]);
  assert.ok(adminImageEnrichmentStatusesForFilter("SKIPPED").includes("REJECTED_BY_ADMIN"));
  assert.deepEqual(adminImageEnrichmentStatusesForFilter("ALL"), []);
});

test("limits batch review to 25 server item IDs", () => {
  assert.deepEqual(validateAdminImageEnrichmentReviewSelection([3, 3, 4]), [3, 4]);
  assert.throws(() => validateAdminImageEnrichmentReviewSelection([]));
  assert.throws(() =>
    validateAdminImageEnrichmentReviewSelection(Array.from({ length: 26 }, (_, i) => i + 1)),
  );
});

test("maps quota and HTTP errors to safe friendly messages", () => {
  assert.match(
    describeAdminImageEnrichmentError(new AdminImageEnrichmentApiError(429, "QUOTA")),
    /provedor/i,
  );
  assert.match(
    describeAdminImageEnrichmentError(new AdminImageEnrichmentApiError(401, "UNAUTHORIZED")),
    /sessão/i,
  );
  assert.match(
    describeAdminImageEnrichmentError(new AdminImageEnrichmentApiError(500, "INTERNAL")),
    /servidor/i,
  );
});
