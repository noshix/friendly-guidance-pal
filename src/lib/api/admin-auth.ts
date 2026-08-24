export type AdminSessionResponse =
  { authenticated: false } | { authenticated: true; username: string };

export interface AdminCsrfResponse {
  token: string;
  headerName: string;
  parameterName: string;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminApiError {
  code: string;
  message?: string;
}

export class AdminAuthApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super("Não foi possível concluir a autenticação administrativa");
    this.name = "AdminAuthApiError";
    this.status = status;
    this.code = code;
  }
}

type FetchImplementation = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

const ADMIN_AUTH_PATH = "/api/admin/auth";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new AdminAuthApiError(502, `INVALID_${field.toUpperCase()}_RESPONSE`);
  }
  return value;
}

function mapAdminCsrf(value: unknown): AdminCsrfResponse {
  if (!isRecord(value)) throw new AdminAuthApiError(502, "INVALID_CSRF_RESPONSE");
  return {
    token: requiredString(value["token"], "csrf_token"),
    headerName: requiredString(value["headerName"], "csrf_header"),
    parameterName: requiredString(value["parameterName"], "csrf_parameter"),
  };
}

function mapAdminSession(value: unknown): AdminSessionResponse {
  if (!isRecord(value) || typeof value["authenticated"] !== "boolean") {
    throw new AdminAuthApiError(502, "INVALID_SESSION_RESPONSE");
  }
  if (!value["authenticated"]) return { authenticated: false };
  return {
    authenticated: true,
    username: requiredString(value["username"], "session_username"),
  };
}

async function readApiError(response: Response): Promise<AdminApiError> {
  try {
    const value: unknown = await response.json();
    if (isRecord(value) && typeof value["code"] === "string") {
      return {
        code: value["code"],
        ...(typeof value["message"] === "string" ? { message: value["message"] } : {}),
      };
    }
  } catch {
    // Technical response bodies are intentionally not exposed to the UI.
  }
  return { code: "ADMIN_AUTH_ERROR" };
}

async function requestJson(
  path: string,
  init: RequestInit,
  fetchImplementation: FetchImplementation,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetchImplementation(path, {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...init.headers,
      },
    });
  } catch {
    throw new AdminAuthApiError(0, "NETWORK_ERROR");
  }

  if (!response.ok) {
    const error = await readApiError(response);
    throw new AdminAuthApiError(response.status, error.code);
  }

  try {
    return (await response.json()) as unknown;
  } catch {
    throw new AdminAuthApiError(502, "INVALID_JSON_RESPONSE");
  }
}

export async function getAdminCsrf(
  fetchImplementation: FetchImplementation = fetch,
): Promise<AdminCsrfResponse> {
  return mapAdminCsrf(
    await requestJson(`${ADMIN_AUTH_PATH}/csrf`, { method: "GET" }, fetchImplementation),
  );
}

export async function getAdminSession(
  fetchImplementation: FetchImplementation = fetch,
): Promise<AdminSessionResponse> {
  return mapAdminSession(
    await requestJson(`${ADMIN_AUTH_PATH}/session`, { method: "GET" }, fetchImplementation),
  );
}

export async function loginAdmin(
  credentials: AdminLoginRequest,
  csrf: AdminCsrfResponse,
  fetchImplementation: FetchImplementation = fetch,
): Promise<AdminSessionResponse> {
  return mapAdminSession(
    await requestJson(
      `${ADMIN_AUTH_PATH}/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [csrf.headerName]: csrf.token,
        },
        body: JSON.stringify({
          username: credentials.username.trim(),
          password: credentials.password,
        }),
      },
      fetchImplementation,
    ),
  );
}

export async function logoutAdmin(
  csrf: AdminCsrfResponse,
  fetchImplementation: FetchImplementation = fetch,
): Promise<AdminSessionResponse> {
  return mapAdminSession(
    await requestJson(
      `${ADMIN_AUTH_PATH}/logout`,
      {
        method: "POST",
        headers: { [csrf.headerName]: csrf.token },
      },
      fetchImplementation,
    ),
  );
}

export function isAdminUnauthorizedError(error: unknown): boolean {
  return error instanceof AdminAuthApiError && error.status === 401;
}
