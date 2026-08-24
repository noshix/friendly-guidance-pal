import assert from "node:assert/strict";
import test from "node:test";

import { buildSpringApiUrl, proxySpringApiRequest } from "./spring-api-proxy.server.ts";

test("encaminha /api ao origin configurado preservando query, método, headers e body", async () => {
  let forwardedRequest: Request | undefined;
  const fetchStub = async (request: Request) => {
    forwardedRequest = request;
    return new Response("upstream", { status: 201 });
  };
  const request = new Request("https://preview.example.com/api/admin/products?page=2&size=50", {
    method: "POST",
    headers: { "content-type": "application/json", "x-csrf-token": "csrf-value" },
    body: JSON.stringify({ visible: true }),
  });

  const response = await proxySpringApiRequest(
    request,
    { SPRING_API_ORIGIN: "https://spring.example.com" },
    fetchStub,
  );

  assert.equal(response?.status, 201);
  assert.equal(
    forwardedRequest?.url,
    "https://spring.example.com/api/admin/products?page=2&size=50",
  );
  assert.equal(forwardedRequest?.method, "POST");
  assert.equal(forwardedRequest?.headers.get("x-csrf-token"), "csrf-value");
  assert.deepEqual(await forwardedRequest?.json(), { visible: true });
});

test("encaminha listagem pública sem duplicar /api e preserva a query string", async () => {
  let forwardedUrl = "";
  const response = await proxySpringApiRequest(
    new Request("https://preview.example.com/api/public/products?page=0&size=3"),
    { SPRING_API_ORIGIN: "https://spring.example.com/" },
    async (request) => {
      forwardedUrl = request.url;
      return Response.json({ items: [] });
    },
  );

  assert.equal(response?.status, 200);
  assert.equal(forwardedUrl, "https://spring.example.com/api/public/products?page=0&size=3");
});

test("preserva Cookie, Set-Cookie e o status da sessão administrativa", async () => {
  let forwardedCookie = "";
  const response = await proxySpringApiRequest(
    new Request("https://preview.example.com/api/admin/auth/session", {
      headers: { cookie: "JSESSIONID=session-value" },
    }),
    { SPRING_API_ORIGIN: "https://spring.example.com" },
    async (request) => {
      forwardedCookie = request.headers.get("cookie") ?? "";
      return Response.json(
        { authenticated: true, username: "admin" },
        { headers: { "set-cookie": "JSESSIONID=rotated; HttpOnly; Secure; SameSite=Lax" } },
      );
    },
  );

  assert.equal(forwardedCookie, "JSESSIONID=session-value");
  assert.equal(
    response?.headers.get("set-cookie"),
    "JSESSIONID=rotated; HttpOnly; Secure; SameSite=Lax",
  );
  assert.equal(response?.status, 200);
});

test("preserva respostas 401 e 403 do Spring sem convertê-las em HTML", async () => {
  for (const status of [401, 403]) {
    const response = await proxySpringApiRequest(
      new Request("https://preview.example.com/api/admin/protected"),
      { SPRING_API_ORIGIN: "https://spring.example.com" },
      async () =>
        Response.json({ code: status === 401 ? "UNAUTHORIZED" : "FORBIDDEN" }, { status }),
    );

    assert.equal(response?.status, status);
    assert.deepEqual(await response?.json(), {
      code: status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
    });
  }
});

test("não envia uma rota frontend ao Spring", async () => {
  let fetchCalled = false;
  const response = await proxySpringApiRequest(
    new Request("https://preview.example.com/produtos"),
    { SPRING_API_ORIGIN: "https://spring.example.com" },
    async () => {
      fetchCalled = true;
      return new Response();
    },
  );

  assert.equal(response, null);
  assert.equal(fetchCalled, false);
});

test("falha com resposta configuracional segura quando SPRING_API_ORIGIN está ausente", async () => {
  const response = await proxySpringApiRequest(
    new Request("https://preview.example.com/api/public/products"),
    {},
  );

  assert.equal(response?.status, 503);
  assert.deepEqual(await response?.json(), { code: "SPRING_API_ORIGIN_NOT_CONFIGURED" });
});

test("rejeita origin malformado ou com path para evitar URL duplicada", async () => {
  assert.throws(
    () => buildSpringApiUrl("https://preview.example.com/api/public/products", "not-a-url"),
    TypeError,
  );
  assert.throws(
    () =>
      buildSpringApiUrl(
        "https://preview.example.com/api/public/products",
        "https://spring.example.com/api",
      ),
    TypeError,
  );

  const response = await proxySpringApiRequest(
    new Request("https://preview.example.com/api/public/products"),
    { SPRING_API_ORIGIN: "https://spring.example.com/api" },
  );
  assert.equal(response?.status, 503);
  assert.deepEqual(await response?.json(), { code: "SPRING_API_ORIGIN_INVALID" });
});

test("converte falha do backend em resposta segura sem detalhes internos", async () => {
  const response = await proxySpringApiRequest(
    new Request("https://preview.example.com/api/public/products"),
    { SPRING_API_ORIGIN: "https://spring.example.com" },
    async () => {
      throw new Error("connect ECONNREFUSED 10.0.0.5:8080");
    },
  );

  assert.equal(response?.status, 502);
  assert.deepEqual(await response?.json(), { code: "SPRING_API_UNAVAILABLE" });
});
