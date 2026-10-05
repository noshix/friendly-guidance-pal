import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ELECTRICIAN_DAY,
  ELECTRICIAN_MAP_URL,
  electricianBreakfastCalendar,
} from "./electrician-day.ts";

test("breakfast is Friday October 16, before the Saturday celebration", () => {
  assert.equal(new Date(`${ELECTRICIAN_DAY.breakfastDate}T12:00:00Z`).getUTCDay(), 5);
  assert.equal(new Date(`${ELECTRICIAN_DAY.celebrationDate}T12:00:00Z`).getUTCDay(), 6);
  assert.equal(ELECTRICIAN_DAY.breakfastTime, "07:30");
});

test("calendar uses 07:30 Cuiabá, not 07:30 UTC, and does not invent an ending time", () => {
  const calendar = electricianBreakfastCalendar();
  assert.ok(calendar.includes("DTSTART:20261016T113000Z\r\n"));
  assert.ok(calendar.startsWith("BEGIN:VCALENDAR\r\n"));
  assert.ok(calendar.endsWith("END:VCALENDAR\r\n"));
  assert.ok(calendar.includes("LOCATION:Av. Manoel José de Arruda\\, 664"));
  assert.ok(calendar.includes("não abrimos aos sábados"));
  assert.ok(!calendar.includes("DTEND"));
});

test("directions preserve the real Pizzatto address without collecting participant data", () => {
  assert.equal(new URL(ELECTRICIAN_MAP_URL).searchParams.get("query"), ELECTRICIAN_DAY.address);
  assert.equal(ELECTRICIAN_DAY.giftLimit, 500);
  assert.equal(ELECTRICIAN_DAY.televisionInches, 65);
});

test("page contains the approved invitation and bounded campaign information", () => {
  const page = readFileSync(
    new URL("../routes/dia-do-eletricista.tsx", import.meta.url),
    "utf8",
  ).replace(/\s+/g, " ");
  const footer = readFileSync(new URL("../components/Footer.tsx", import.meta.url), "utf8");
  assert.match(footer, /to="\/dia-do-eletricista"/);
  assert.match(page, /primeiros 500 clientes/);
  assert.match(page, /Toda compra feita na loja em outubro/);
  assert.match(page, /TV de 65 polegadas/);
  assert.match(page, /sorteio no final do mês/);
  assert.match(page, /não abrimos aos sábados/);
  assert.match(page, /Regulamento, critérios de participação/);
  assert.ok(!page.includes("<form"));
  assert.ok(!page.includes("fetch("));
  assert.ok(!page.includes("localStorage"));
});

test("3D illustration has real pointer/keyboard control, pause and reduced-motion fallback", () => {
  const scene = readFileSync(
    new URL("../components/ElectricianCoffeeScene.tsx", import.meta.url),
    "utf8",
  );
  const style = readFileSync(new URL("../styles/electrician-day.css", import.meta.url), "utf8");
  assert.match(scene, /onPointerMove/);
  assert.match(scene, /onKeyDown/);
  assert.match(scene, /setPointerCapture/);
  assert.match(scene, /aria-pressed=\{paused\}/);
  assert.match(style, /rotateX\(var\(--coffee-x\)\) rotateY\(var\(--coffee-y\)\)/);
  assert.match(style, /prefers-reduced-motion: reduce/);
});
