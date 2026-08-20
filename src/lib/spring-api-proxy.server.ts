const SPRING_API_PATH_PREFIX = "/api/";

type FetchImplementation = (request: Request) => Promise<Response>;

function jsonError(status: number, code: string): Response {
  return Response.json({ code }, { status });
}

function readSpringApiOrigin(env: unknown): string | undefined {
  if (typeof env !== "object" || env === null || Array.isArray(env)) return undefined;
  const value = (env as Record<string, unknown>)["SPRING_API_ORIGIN"];
  return typeof value === "string" ? value.trim() : undefined;
}

export function isSpringApiRequest(request: Request): boolean {
  return new URL(request.url).pathname.startsWith(SPRING_API_PATH_PREFIX);
}

export function buildSpringApiUrl(requestUrl: string | URL, configuredOrigin: string): URL {
  const origin = new URL(configuredOrigin);
  if (
    (origin.protocol !== "https:" && origin.protocol !== "http:") ||
    origin.username ||
    origin.password ||
    origin.search ||
    origin.hash ||
    (origin.pathname !== "/" && origin.pathname !== "")
  ) {
    throw new TypeError("SPRING_API_ORIGIN must be an HTTP(S) origin without path or credentials");
  }

  const incoming = new URL(requestUrl);
  return new URL(`${incoming.pathname}${incoming.search}`, `${origin.origin}/`);
}

export async function proxySpringApiRequest(
  request: Request,
  env: unknown,
  fetchImplementation: FetchImplementation = fetch,
): Promise<Response | null> {
  if (!isSpringApiRequest(request)) return null;

  const configuredOrigin = readSpringApiOrigin(env);
  if (!configuredOrigin) {
    return jsonError(503, "SPRING_API_ORIGIN_NOT_CONFIGURED");
  }

  let targetUrl: URL;
  try {
    targetUrl = buildSpringApiUrl(request.url, configuredOrigin);
  } catch {
    return jsonError(503, "SPRING_API_ORIGIN_INVALID");
  }

  try {
    const upstreamRequest = new Request(targetUrl, request);
    upstreamRequest.headers.delete("host");
    return await fetchImplementation(upstreamRequest);
  } catch {
    return jsonError(502, "SPRING_API_UNAVAILABLE");
  }
}
