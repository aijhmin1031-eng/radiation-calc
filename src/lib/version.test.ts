/** 판 — 한 곳(`version.ts`)에서 정하고, 글자로 같은 값을 드는 셋(CITATION.cff · .zenodo.json · README)이 따라오는지 잰다(T15). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { RELEASES, VERSION, dateText } from "./version.ts";
import { PAGE_KEYS } from "./nuclide-pages.ts";
import { nuclidePage, NUCLIDES, ATTEN } from "./nuclides.ts";
import { spectrumHVL } from "../engine/index.ts";

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

/* ★ T16 — 같은 날 두 판이 나올 수 있다(1.1.0 · 1.1.1 이 둘 다 2026-10-29). 번호는 반드시 내려가고, 날짜는 같거나 내려간다. */
test("판 목록 — 최신이 위, 번호는 내려가고 날짜는 거꾸로 가지 않는다", () => {
  const num = (v: string) => v.split(".").map(Number).reduce((s, x) => s * 1000 + x, 0);
  for (let i = 1; i < RELEASES.length; i++) {
    assert.ok(num(RELEASES[i - 1].version) > num(RELEASES[i].version), RELEASES[i].version);
    assert.ok(RELEASES[i - 1].date >= RELEASES[i].date, RELEASES[i].date);
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
  // T15 검토 — 초록의 나머지 수도 잰다: 자료 수 · Na-22 의 납 반가층(스펙트럼 · 1275 keV 한 줄) · 그 줄의 커마 몫
  const all = `all ${Object.keys(NUCLIDES).length} in the dataset`;
  assert.ok(cff.includes(all) && zen.description.includes(all), all);
  const na = nuclidePage("Na-22");
  const hvl = (na.shields.find((s) => s.material === "lead")!.hvlCm * 10).toFixed(1);
  const line = na.shares.reduce((a, b) => (b.share > a.share ? b : a));
  const single = (spectrumHVL([[line.eKeV, 100]], ATTEN.air, ATTEN.lead, "lead") * 10).toFixed(1);
  const na1 = `the lead half-value layer is ${hvl} mm against the ${single} mm implied by its ${Math.round(line.eKeV)} keV gamma line`;
  assert.ok(cff.includes(na1), `CITATION.cff: ${na1}`);
  assert.ok(zen.description.includes(`For Na-22 the lead half-value layer is ${hvl} mm against the ${single} mm implied by its ${Math.round(line.eKeV)} keV gamma line, which carries only ${Math.round(line.share * 100)}% of the kerma`), `.zenodo.json Na-22`);
});
