import { test } from "node:test";
import assert from "node:assert/strict";
import { TOOLS, toolCode, REF_PATTERN, toolBySlug } from "./tools.ts";

test("도구 약자가 서로 겹치지 않는다", () => {
  const codes = TOOLS.map((t) => toolCode(t.slug));
  assert.equal(new Set(codes).size, TOOLS.length,
    `약자가 겹친다: ${codes.join(", ")} — 겹치면 번호를 함께 쓰게 된다`);
  for (const c of codes) assert.match(c, /^[A-Z0-9]{2,3}$/, c);
});

test("약자 규칙이 DB 의 calc_tool_code() 와 같다", () => {
  // DB 에서 실측한 값 (2026-09-14)
  for (const [slug, want] of [["units", "UNI"], ["decay", "DEC"], ["gamma-shielding", "GAM"],
                              ["specific-activity", "SPE"], ["mda", "MDA"], ["beta", "BET"],
                              ["alara", "ALA"]] as const)
    assert.equal(toolCode(slug), want, slug);
});

test("고유번호 생김새", () => {
  for (const t of TOOLS)
    assert.match(`RC-${toolCode(t.slug)}-20260914-0001`, REF_PATTERN, t.slug);
  for (const bad of ["RC-20260914-0001", "RC-GAMMA-20260914-0001", "XX-GAM-20260914-0001",
                     "RC-GAM-2026914-0001", "RC-GAM-20260914-1"])
    assert.ok(!REF_PATTERN.test(bad), `막아야 한다: ${bad}`);
});

test("등록부가 온전하다", () => {
  assert.equal(TOOLS.length, 8);
  assert.equal(new Set(TOOLS.map((t) => t.slug)).size, 8, "슬러그 중복");
  for (const t of TOOLS) {
    assert.match(t.slug, /^[a-z0-9-]{2,40}$/, t.slug);   // DB 의 calc_tool_ok 와 같은 규칙
    assert.ok(t.name && t.blurb && t.question, t.slug);
    assert.equal(t.login, false, `${t.slug}: 기본 도구는 로그인 없이 쓴다`);
    assert.equal(toolBySlug(t.slug), t);
  }
});

/* ★ 2026-10-31 Search Console(9/9~10/30) — 사람이 실제로 친 말이 제목 앞머리와 큰 제목에 있어야 한다. */
const SEARCHED: Record<string, { title: string; h1: string; blurb?: string }> = {
  "specific-activity": { title: "Specific activity calculator", h1: "Specific activity calculator", blurb: "Specific activity of Pu-239" },
  mda: { title: "MDA calculator: minimum detectable activity", h1: "MDA calculator", blurb: "Minimum detectable activity" },
  "gamma-shielding": { title: "Gamma shielding", h1: "Gamma shielding" },
  decay: { title: "Radioactive decay calculator", h1: "Radioactive decay calculator", blurb: "Nuclear decay calculator" },
  beta: { title: "Beta shielding", h1: "Beta shielding" },
  alara: { title: "ALARA calculator", h1: "ALARA calculator" },
  units: { title: "Radiation unit converter", h1: "Radiation unit converter" },
};

test("★ 검색 제목·큰 제목이 실제 검색어로 시작한다", () => {
  for (const [slug, want] of Object.entries(SEARCHED)) {
    const t = toolBySlug(slug)!;
    assert.ok(t.seoTitle.startsWith(want.title), `${slug} 제목: ${t.seoTitle}`);
    assert.ok(t.heading.startsWith(want.h1), `${slug} 큰 제목: ${t.heading}`);
    if (want.blurb) assert.ok(t.blurb.startsWith(want.blurb), `${slug} 설명: ${t.blurb}`);
  }
});

test("★ 고친 도구 쪽의 제목·설명이 검색 결과에서 잘리지 않는다", () => {
  for (const slug of Object.keys(SEARCHED)) {
    const t = toolBySlug(slug)!;
    const full = `${t.seoTitle} · Radiation Lab`;
    assert.ok(full.length <= 60, `${slug} 제목 ${full.length}자 — ${full}`);
    assert.ok(t.blurb.length <= 155 && t.blurb.length >= 90, `${slug} 설명 ${t.blurb.length}자 — ${t.blurb}`);
  }
});

test("★ 내비 이름은 그대로다 — 큰 제목만 검색어를 든다(메뉴 글자는 공통 셸 명세와 맞물려 있다)", () => {
  const names = Object.fromEntries(TOOLS.map((t) => [t.slug, t.name]));
  assert.equal(names.decay, "Decay and half-life");
  assert.equal(names["specific-activity"], "Mass and activity");
  assert.equal(names.mda, "Detection limits (MDA / MDC)");
  assert.equal(names.units, "Unit converter");
});
