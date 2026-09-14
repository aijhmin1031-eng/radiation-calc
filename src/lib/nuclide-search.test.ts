import { test } from "node:test";
import assert from "node:assert/strict";
import nuc from "../data/nuclides.json" with { type: "json" };
import type { NuclideMap } from "../engine/types";
import { searchNuclides, rankNuclide } from "./nuclide-search.ts";
const N = nuc as unknown as NuclideMap;

// ★ 실측 결함 — 「co60」을 치면 Co-60m(10.5분)이 먼저 와서 잘못 집혔다.
//   Γ 가 522배 작아 답이 11,310 대신 21.7 µSv/h 로 나왔다(2026-09-14).
test("★ 정확히 일치하는 바닥상태가 이성질체보다 먼저 온다", () => {
  for (const [q, want] of [["co60", "Co-60"], ["tc99", "Tc-99"], ["ir192", "Ir-192"],
                           ["cs134", "Cs-134"], ["y88", "Y-88"], ["eu152", "Eu-152"]] as const) {
    const r = searchNuclides(N, q);
    assert.ok(r.length > 0, `${q}: 결과 없음`);
    assert.equal(r[0].k, want, `"${q}" 의 첫 결과가 ${r[0].k} 다 — ${want} 여야 한다`);
  }
});

// ★ 바닥상태가 **안정**이면 방사성 핵종 등록부에 없고 이성질체만 나오는 것이 정상이다
//   (Ba-137 이 그렇다 — Cs-137 의 662 keV 를 내는 것은 Ba-137m 이다).
test("바닥상태가 안정이면 이성질체만 나온다", () => {
  const r = searchNuclides(N, "ba137");
  assert.equal(r.length, 1);
  assert.equal(r[0].k, "Ba-137m");
  assert.ok(!N["Ba-137"], "Ba-137 바닥상태는 안정이라 등록부에 없다");
});

test("이성질체를 일부러 찾으면 찾을 수 있다", () => {
  assert.equal(searchNuclides(N, "co60m")[0].k, "Co-60m");
  assert.equal(searchNuclides(N, "tc99m")[0].k, "Tc-99m");
  assert.ok(searchNuclides(N, "co60").some((x) => x.k === "Co-60m"), "목록에는 남아 있어야 한다");
});

test("하이픈·대소문자·공백을 가리지 않는다", () => {
  for (const q of ["Co-60", "co-60", "CO60", " co 60 ", "co60"])
    assert.equal(searchNuclides(N, q)[0].k, "Co-60", `"${q}"`);
});

test("방출 종류로 거른다 — 감마 화면에서 순수 베타 방출체를 고를 수 없다", () => {
  const g = searchNuclides(N, "", ["gamma", "xray"]);
  assert.ok(!g.some((x) => x.k === "Sr-90"), "Sr-90 은 감마가 없다");
  assert.ok(!g.some((x) => x.k === "H-3"), "H-3 은 감마가 없다");
  assert.ok(g.some((x) => x.k === "Co-60"));
  const be = searchNuclides(N, "", ["beta"]);
  assert.ok(be.some((x) => x.k === "Sr-90") && be.some((x) => x.k === "Y-90"));
  assert.ok(!be.some((x) => x.k === "Am-241"), "Am-241 은 알파다");
});

test("순위 함수 자체", () => {
  assert.equal(rankNuclide("Co-60", "co60"), 0);
  assert.equal(rankNuclide("Co-60m", "co60"), 1);
  assert.equal(rankNuclide("Fe-60", "co60"), 2);
  assert.equal(rankNuclide("Co-60", ""), 2, "빈 검색어면 전부 같은 순위");
});

test("빈 검색어에서도 바닥상태가 이성질체보다 앞이다", () => {
  const all = searchNuclides(N, "");
  const iCo = all.findIndex((x) => x.k === "Co-60");
  const iCom = all.findIndex((x) => x.k === "Co-60m");
  assert.ok(iCo < iCom, `Co-60(${iCo}) 이 Co-60m(${iCom}) 보다 앞이어야 한다`);
  assert.equal(all.length, Object.keys(N).length, "거르개가 없으면 전부 나온다");
});
