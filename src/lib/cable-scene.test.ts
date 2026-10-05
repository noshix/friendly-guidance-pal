import assert from "node:assert/strict";
import test from "node:test";
import { createCableTube, cableVertexShader, cableFragmentShader } from "./cable-scene.ts";
test("3D cables share a bounded finite tube mesh with valid triangle indices", () => {
  const mesh = createCableTube();
  assert.equal(mesh.samples.length, 129 * 16 * 2);
  assert.equal(mesh.indices.length, 128 * 16 * 6);
  assert.ok([...mesh.samples].every(Number.isFinite));
  assert.ok([...mesh.indices].every((index) => index < mesh.samples.length / 2));
});
test("tube topology closes every ring and spans the complete cable", () => {
  const mesh = createCableTube(4, 8);
  assert.deepEqual([...mesh.indices.slice(7 * 6, 8 * 6)], [7, 15, 0, 0, 15, 8]);
  assert.equal(mesh.samples[0], 0);
  assert.equal(mesh.samples[mesh.samples.length - 2], 1);
});
test("interactive scene has pointer-controlled 3D rotation and authoritative selected color", () => {
  assert.match(cableVertexShader, /uniform vec2 uPointer/);
  assert.match(cableVertexShader, /uPointer.x/);
  assert.match(cableVertexShader, /uPointer.y/);
  assert.match(cableFragmentShader, /vec3 color = uColor/);
  assert.doesNotMatch(cableFragmentShader, /color = palette/);
});
