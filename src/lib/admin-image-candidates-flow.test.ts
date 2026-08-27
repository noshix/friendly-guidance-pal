import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { QueryClient } from "@tanstack/react-query";

import {
  adminImageCandidateConfidenceLabel,
  adminImageCandidateErrorMessage,
  adminImageCandidateMatchLabel,
  adminImageCandidatePreviewSources,
} from "./admin-image-candidates-flow.ts";
import {
  adminImageCandidatesQueryKey,
  adminImageCandidatesQueryOptions,
  expireAdminImageCandidatesSession,
} from "./admin-image-candidates-query.ts";
import {
  AdminImageCandidateApiError,
  type AdminImageCandidate,
} from "./api/admin-image-candidates.ts";

const candidate: AdminImageCandidate = {
  id: "candidate-1",
  imageUrl: "https://cdn.example.com/product.jpg",
  thumbnailUrl: "https://cdn.example.com/thumb.jpg",
  sourcePageUrl: "https://manufacturer.example.com/product",
  sourceDomain: "manufacturer.example.com",
  title: "Produto real",
  matchedBy: "EXACT_REFERENCE",
  confidence: "HIGH",
  width: 1200,
  height: 1200,
};

test("query inclui ERP ID e limit e permanece desabilitada até ação explícita", () => {
  assert.deepEqual(adminImageCandidatesQueryKey("00ERP/A", 6), [
    "admin-image-candidates",
    "00ERP/A",
    6,
  ]);
  const options = adminImageCandidatesQueryOptions("00ERP/A", 6);
  assert.equal(options.enabled, false);
});

test("401 limpa sessão e redireciona para login", async () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(["admin-session"], { authenticated: true, username: "admin" });
  let redirected = false;
  const expired = await expireAdminImageCandidatesSession(
    new AdminImageCandidateApiError(401, "UNAUTHORIZED"),
    queryClient,
    () => {
      redirected = true;
    },
  );
  assert.equal(expired, true);
  assert.equal(redirected, true);
  assert.equal(queryClient.getQueryData(["admin-session"]), undefined);
});

test("labels de matchedBy e confidence são amigáveis sem afirmar correção", () => {
  assert.equal(adminImageCandidateMatchLabel("EXACT_REFERENCE"), "Referência exata");
  assert.equal(adminImageCandidateMatchLabel("EXACT_PART_NUMBER"), "Part number exato");
  assert.equal(adminImageCandidateMatchLabel("EXACT_EAN"), "EAN exato");
  assert.equal(adminImageCandidateMatchLabel("MANUFACTURER_AND_NAME"), "Fabricante + descrição");
  assert.equal(adminImageCandidateMatchLabel("NAME_ONLY"), "Apenas descrição");
  assert.equal(adminImageCandidateConfidenceLabel("HIGH"), "Alta confiança");
  assert.equal(adminImageCandidateConfidenceLabel("MEDIUM"), "Média confiança");
  assert.equal(adminImageCandidateConfidenceLabel("LOW"), "Baixa confiança");
});

test("thumbnail é preferida e imageUrl é fallback sem base64", () => {
  assert.deepEqual(adminImageCandidatePreviewSources(candidate), [
    "https://cdn.example.com/thumb.jpg",
    "https://cdn.example.com/product.jpg",
  ]);
  assert.deepEqual(adminImageCandidatePreviewSources({ ...candidate, thumbnailUrl: null }), [
    "https://cdn.example.com/product.jpg",
  ]);
});

test("mensagens tratam produto ausente, rate limit e fonte externa indisponível", () => {
  assert.equal(
    adminImageCandidateErrorMessage(new AdminImageCandidateApiError(404, "PRODUCT_NOT_FOUND")),
    "Produto não encontrado.",
  );
  assert.match(
    adminImageCandidateErrorMessage(new AdminImageCandidateApiError(429, "LIMIT")),
    /limite temporário/,
  );
  assert.match(
    adminImageCandidateErrorMessage(new AdminImageCandidateApiError(503, "TEMPORARY")),
    /temporariamente indisponível/,
  );
});

test("UI busca somente por clique, seleciona em memória e não persiste candidato", async () => {
  const [sectionSource, dialogSource, apiSource] = await Promise.all([
    readFile(new URL("../components/admin/AdminProductMediaSection.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/admin/AdminImageCandidateReview.tsx", import.meta.url), "utf8"),
    readFile(new URL("./api/admin-image-candidates.ts", import.meta.url), "utf8"),
  ]);
  const source = `${sectionSource}\n${dialogSource}\n${apiSource}`;
  const candidateSource = `${dialogSource}\n${apiSource}`;

  assert.match(sectionSource, /AdminImageCandidateReview/);
  assert.match(dialogSource, /Buscar imagens/);
  assert.match(dialogSource, /candidatesQuery\.refetch\(\)/);
  assert.match(dialogSource, /useState<string \| null>\(null\)/);
  assert.match(dialogSource, /target="_blank"/);
  assert.match(dialogSource, /rel="noopener noreferrer"/);
  assert.match(dialogSource, /onError={handleImageError}/);
  assert.match(dialogSource, /ref={searchButtonRef}/);
  assert.match(dialogSource, /onCloseAutoFocus/);
  assert.match(dialogSource, /requestAnimationFrame/);
  assert.match(dialogSource, /searchButtonRef\.current\?\.focus\(\)/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|readAsDataURL|base64/i);
  assert.doesNotMatch(dialogSource, /\bfetch\s*\(/);
  assert.doesNotMatch(apiSource, /method:\s*"(?:POST|PATCH|DELETE)"/);
  assert.doesNotMatch(candidateSource, /ProductImage|R2|uploadProductImage/);
});
