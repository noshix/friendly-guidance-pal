import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  AdminAuthApiError,
  getAdminCsrf,
  getAdminSession,
  isAdminUnauthorizedError,
  loginAdmin,
  logoutAdmin,
  type AdminCsrfResponse,
} from "./admin-auth.ts";

const CSRF: AdminCsrfResponse = {
  token: "csrf-value",
  headerName: "X-CUSTOM-CSRF",
  parameterName: "_csrf",
};

test("getAdminCsrf usa cookie same-origin e mapeia o contrato do Spring", async () => {
  let requestedUrl = "";
  let requestedInit: RequestInit | undefined;

  const csrf = await getAdminCsrf(async (input, init) => {
    requestedUrl = String(input);
    requestedInit = init;
    return Response.json(CSRF);
  });

  assert.deepEqual(csrf, CSRF);
  assert.equal(requestedUrl, "/api/admin/auth/csrf");
  assert.equal(requestedInit?.credentials, "include");
  assert.equal(requestedInit?.method, "GET");
});

test("getAdminSession representa sessão anônima sem inventar usuário", async () => {
  const session = await getAdminSession(async (_input, init) => {
    assert.equal(init?.credentials, "include");
    return Response.json({ authenticated: false });
  });

  assert.deepEqual(session, { authenticated: false });
  assert.equal("username" in session, false);
});

test("getAdminSession preserva o usuário da sessão autenticada", async () => {
  const session = await getAdminSession(async () =>
    Response.json({ authenticated: true, username: "admin-real" }),
  );

  assert.deepEqual(session, { authenticated: true, username: "admin-real" });
});

test("login usa JSON, credentials include e o header CSRF retornado pelo backend", async () => {
  let requestedUrl = "";
  let requestedInit: RequestInit | undefined;

  const session = await loginAdmin(
    { username: " admin-real ", password: "password-value" },
    CSRF,
    async (input, init) => {
      requestedUrl = String(input);
      requestedInit = init;
      return Response.json({ authenticated: true, username: "admin-real" });
    },
  );

  const headers = new Headers(requestedInit?.headers);
  assert.deepEqual(session, { authenticated: true, username: "admin-real" });
  assert.equal(requestedUrl, "/api/admin/auth/login");
  assert.equal(requestedInit?.method, "POST");
  assert.equal(requestedInit?.credentials, "include");
  assert.equal(headers.get("X-CUSTOM-CSRF"), "csrf-value");
  assert.equal(headers.get("Content-Type"), "application/json");
  assert.deepEqual(JSON.parse(String(requestedInit?.body)), {
    username: "admin-real",
    password: "password-value",
  });
});

test("login 401 produz erro tipado sem expor a mensagem técnica do backend", async () => {
  await assert.rejects(
    () =>
      loginAdmin({ username: "admin", password: "wrong" }, CSRF, async () =>
        Response.json(
          { code: "INVALID_CREDENTIALS", message: "internal-auth-detail" },
          { status: 401 },
        ),
      ),
    (error: unknown) => {
      assert.ok(error instanceof AdminAuthApiError);
      assert.equal(error.status, 401);
      assert.equal(error.code, "INVALID_CREDENTIALS");
      assert.equal(error.message.includes("internal-auth-detail"), false);
      assert.equal(isAdminUnauthorizedError(error), true);
      return true;
    },
  );
});

test("logout usa CSRF dinâmico e deixa a expiração do cookie para o servidor", async () => {
  let requestedInit: RequestInit | undefined;
  const result = await logoutAdmin(CSRF, async (_input, init) => {
    requestedInit = init;
    return Response.json({ authenticated: false });
  });

  const headers = new Headers(requestedInit?.headers);
  assert.deepEqual(result, { authenticated: false });
  assert.equal(requestedInit?.method, "POST");
  assert.equal(requestedInit?.credentials, "include");
  assert.equal(headers.get("X-CUSTOM-CSRF"), "csrf-value");
  assert.equal(requestedInit?.body, undefined);
});

test("resposta de sessão inválida falha de forma segura", async () => {
  await assert.rejects(
    () => getAdminSession(async () => Response.json({ authenticated: true })),
    (error: unknown) =>
      error instanceof AdminAuthApiError && error.code === "INVALID_SESSION_USERNAME_RESPONSE",
  );
});

test("fluxo administrativo não mantém a antiga chave localStorage fake", async () => {
  const srcDirectory = fileURLToPath(new URL("../../", import.meta.url));
  const files = await collectSourceFiles(srcDirectory);
  const removedAuthKey = ["pizzatto", "admin", "session"].join("_");
  const offenders: string[] = [];

  for (const file of files) {
    if ((await readFile(file, "utf8")).includes(removedAuthKey)) offenders.push(file);
  }

  assert.deepEqual(offenders, []);
});

async function collectSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(path)));
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push(path);
    }
  }
  return files;
}
