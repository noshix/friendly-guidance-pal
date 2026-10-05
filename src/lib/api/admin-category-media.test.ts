import assert from "node:assert/strict";
import test from "node:test";
import {
  categoryImageUrl,
  getCategoryImages,
  uploadCategoryImage,
  deleteCategoryImage,
} from "./admin-category-media.ts";
import { AdminProductMediaApiError } from "./admin-product-media.ts";
import { mapPublicCategory } from "./public-catalog.ts";
import { categoryPresentation } from "../category-presentation.ts";

const category = { name: "Acabamentos", erpName: "ACABAMENT", slug: "acabament", productCount: 34 };
const csrf = { headerName: "X-CSRF-TOKEN", token: "test-csrf", parameterName: "_csrf" };
test("category images GET is authenticated and preserves public taxonomy identity", async () => {
  const result = await getCategoryImages(async (url, init) => {
    assert.equal(url, "/api/admin/category-images");
    assert.equal(init?.credentials, "include");
    assert.equal(init?.method, "GET");
    return Response.json([{ ...category, imageUrl: "https://media.test/categories/random.png" }]);
  });
  assert.equal(result[0]?.imageUrl, "https://media.test/categories/random.png");
  assert.equal(result[0]?.erpName, "ACABAMENT");
});
test("category upload sends only multipart file with session and dynamic CSRF", async () => {
  const file = new File(["artificial"], "test.png", { type: "image/png" });
  await uploadCategoryImage(" 00CAT/A & B ", file, csrf, async (url, init) => {
    assert.equal(new URL(String(url), "https://test").searchParams.get("erpName"), " 00CAT/A & B ");
    assert.equal(init?.method, "PUT");
    assert.equal(init?.credentials, "include");
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("X-CSRF-TOKEN"), csrf.token);
    assert.equal(headers.get("Content-Type"), null);
    assert.ok(init?.body instanceof FormData);
    assert.deepEqual([...init.body.keys()], ["file"]);
    return Response.json({ imageUrl: "https://media.test/categories/random.png" });
  });
});
test("category deletion uses authenticated CSRF without browser-authoritative URL", async () => {
  await deleteCategoryImage("EQUIPAM.", csrf, async (url, init) => {
    assert.equal(url, categoryImageUrl("EQUIPAM."));
    assert.equal(init?.method, "DELETE");
    assert.equal(init?.body, undefined);
    assert.equal(init?.credentials, "include");
    assert.equal(new Headers(init?.headers).get("X-CSRF-TOKEN"), csrf.token);
    return new Response(null, { status: 204 });
  });
});
test("invalid category file and empty name are rejected before network", async () => {
  let calls = 0;
  await assert.rejects(
    uploadCategoryImage(
      "ACABAMENT",
      new File(["svg"], "test.svg", { type: "image/svg+xml" }),
      csrf,
      async () => {
        calls++;
        return Response.json({});
      },
    ),
    AdminProductMediaApiError,
  );
  assert.equal(calls, 0);
  assert.throws(() => categoryImageUrl(" "), AdminProductMediaApiError);
});
test("category unauthorized errors are typed and never reveal technical response", async () => {
  await assert.rejects(
    getCategoryImages(async () =>
      Response.json({ code: "UNAUTHORIZED", detail: "private stack" }, { status: 401 }),
    ),
    (error: unknown) =>
      error instanceof AdminProductMediaApiError &&
      error.status === 401 &&
      !error.message.includes("private"),
  );
});
test("category API remains compatible with old payload and prioritizes uploaded image", () => {
  assert.deepEqual(mapPublicCategory(category), category);
  assert.equal(
    categoryPresentation("PROTECAO", "Proteção", "https://media.test/new.png").image,
    "https://media.test/new.png",
  );
  assert.equal(
    categoryPresentation("PROTECAO", "Proteção", null).image,
    "/assets/categories/protecao.png",
  );
  assert.equal(categoryPresentation("ACABAMENT", "Acabamentos", null).image, "");
  assert.throws(() => mapPublicCategory({ ...category, imageUrl: 123 }));
});
