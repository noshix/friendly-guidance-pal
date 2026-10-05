import type { AdminCsrfResponse } from "./admin-auth.ts";
import {
  AdminProductMediaApiError,
  validateProductImageFile,
  type AdminProductMediaFetch,
} from "./admin-product-media.ts";
import { mapPublicCategory, type PublicCategory } from "./public-catalog.ts";

const PATH = "/api/admin/category-images";
export function categoryImageUrl(erpName: string) {
  if (!erpName.trim()) throw new AdminProductMediaApiError(400, "INVALID_CATEGORY");
  return `${PATH}?${new URLSearchParams({ erpName })}`;
}
async function request(url: string, init: RequestInit, send: AdminProductMediaFetch) {
  let response: Response;
  try {
    response = await send(url, {
      ...init,
      credentials: "include",
      headers: { Accept: "application/json", ...init.headers },
    });
  } catch {
    throw new AdminProductMediaApiError(0, "NETWORK_ERROR");
  }
  if (!response.ok) {
    let code = "CATEGORY_MEDIA_ERROR";
    try {
      const body: unknown = await response.json();
      if (body && typeof body === "object" && "code" in body && typeof body.code === "string")
        code = body.code;
    } catch {
      /* Never surface technical response bodies. */
    }
    throw new AdminProductMediaApiError(response.status, code);
  }
  return response;
}
export async function getCategoryImages(
  send: AdminProductMediaFetch = fetch,
): Promise<PublicCategory[]> {
  const response = await request(PATH, { method: "GET" }, send);
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new AdminProductMediaApiError(502, "INVALID_RESPONSE");
  }
  if (!Array.isArray(payload)) throw new AdminProductMediaApiError(502, "INVALID_RESPONSE");
  return payload.map(mapPublicCategory);
}
export async function uploadCategoryImage(
  erpName: string,
  file: File,
  csrf: AdminCsrfResponse,
  send: AdminProductMediaFetch = fetch,
): Promise<void> {
  if (validateProductImageFile(file))
    throw new AdminProductMediaApiError(400, "INVALID_IMAGE_FILE");
  const body = new FormData();
  body.set("file", file);
  await request(
    categoryImageUrl(erpName),
    { method: "PUT", body, headers: { [csrf.headerName]: csrf.token } },
    send,
  );
}
export async function deleteCategoryImage(
  erpName: string,
  csrf: AdminCsrfResponse,
  send: AdminProductMediaFetch = fetch,
): Promise<void> {
  await request(
    categoryImageUrl(erpName),
    { method: "DELETE", headers: { [csrf.headerName]: csrf.token } },
    send,
  );
}
