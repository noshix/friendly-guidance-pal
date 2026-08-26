import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { QueryClient } from "@tanstack/react-query";

import {
  adminProductImagesQueryKey,
  expireAdminProductMediaSession,
} from "./admin-product-media-query.ts";
import { AdminProductMediaApiError } from "./api/admin-product-media.ts";

test("query de imagens é isolada por ERP ID opaco", () => {
  assert.deepEqual(adminProductImagesQueryKey("00ERP/A"), ["admin-product-images", "00ERP/A"]);
});

test("401 de mídia limpa sessão e redireciona para login", async () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(["admin-session"], { authenticated: true, username: "admin" });
  let redirected = false;

  const expired = await expireAdminProductMediaSession(
    new AdminProductMediaApiError(401, "UNAUTHORIZED"),
    queryClient,
    () => {
      redirected = true;
    },
  );

  assert.equal(expired, true);
  assert.equal(redirected, true);
  assert.equal(queryClient.getQueryData(["admin-session"]), undefined);
});

test("erro comum de mídia não encerra a sessão", async () => {
  const queryClient = new QueryClient();
  let redirected = false;
  const expired = await expireAdminProductMediaSession(
    new AdminProductMediaApiError(422, "INVALID_IMAGE"),
    queryClient,
    () => {
      redirected = true;
    },
  );
  assert.equal(expired, false);
  assert.equal(redirected, false);
});

test("fluxo usa cliente centralizado e não persiste imagem ou autenticação no browser", async () => {
  const [routeSource, componentSource, apiSource] = await Promise.all([
    readFile(new URL("../routes/admin/produtos/$id.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/admin/AdminProductMediaSection.tsx", import.meta.url), "utf8"),
    readFile(new URL("./api/admin-product-media.ts", import.meta.url), "utf8"),
  ]);
  const source = `${routeSource}\n${componentSource}\n${apiSource}`;

  assert.match(routeSource, /AdminProductMediaSection/);
  assert.match(componentSource, /getProductImages/);
  assert.match(componentSource, /uploadProductImage/);
  assert.match(componentSource, /updateProductImage/);
  assert.match(componentSource, /deleteProductImage/);
  assert.match(componentSource, /URL\.createObjectURL/);
  assert.match(componentSource, /URL\.revokeObjectURL/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|readAsDataURL|base64/i);
  assert.doesNotMatch(componentSource, /\bfetch\s*\(/);
  assert.doesNotMatch(componentSource, /alert\s*\(/);
});
