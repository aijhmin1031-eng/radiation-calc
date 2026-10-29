/** 판 — 한 곳(`version.ts`)에서 정하고, 글자로 같은 값을 드는 셋(CITATION.cff · .zenodo.json · README)이 따라오는지 잰다(T15). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { RELEASES, VERSION, dateText } from "./version.ts";
import { PAGE_KEYS } from "./nuclide-pages.ts";
import { nuclidePage } from "./nuclides.ts";

const cff = readFileSync("CITATION.cff", "utf8");
const zen = JSON.parse(readFileSync(".zenodo.json", "utf8"));
const readme = readFileSync("README.md", "utf8");

test("판 — 정본 · CITATION.cff · .zenodo.json · README 가 같다", () => {
  assert.equal(VERSION, RELEASES[0]);
  assert.match(cff, new RegExp(`^version: "${VERSION.version}"$`, "m"), "CITATION.cff version");
  assert.match(cff, new RegExp(`^date-released: "${VERSION.date}"$`, "m"), "CITATION.cff date-released");
  assert.equal(zen.version, VERSION.version, ".zenodo.json version");
  assert.equal(zen.publication_date, VERSION.date, ".zenodo.json publication_date");
  assert.ok(readme.includes(`**판: v${VERSION.version} · ${VERSION.date}**`), "README 판 줄");
});

test("판 목록 — 최신이 위, 번호와 날짜가 함께 내려간다", () => {
  const num = (v: string) => v.split(".").map(Number).reduce((s, x) => s * 1000 + x, 0);
  for (let i = 1; i < RELEASES.length; i++) {
    assert.ok(num(RELEASES[i - 1].version) > num(RELEASES[i].version), RELEASES[i].version);
    assert.ok(RELEASES[i - 1].date > RELEASES[i].date, RELEASES[i].date);
  }
  assert.equal(dateText("2026-10-29"), "29 October 2026");
});

test("릴리스 메타데이터의 수가 지금 자료와 맞다 — Zenodo 에 영구 보관되는 글이다", () => {
  const sheets = `Reference sheets for ${PAGE_KEYS.length} nuclides`;
  assert.ok(cff.includes(sheets), `CITATION.cff: ${sheets}`);
  assert.ok(zen.description.includes(sheets), `.zenodo.json: ${sheets}`);
  const sn = Math.round(nuclidePage("Sn-113").shields.find((s) => s.material === "lead")!.ratio);
  assert.ok(cff.includes(`Sn-113 the tenth-value layer is ${sn} times`), `CITATION.cff Sn-113 ${sn}`);
  assert.ok(zen.description.includes(`Sn-113 the tenth-value layer is ${sn} times`), `.zenodo.json Sn-113 ${sn}`);
});
