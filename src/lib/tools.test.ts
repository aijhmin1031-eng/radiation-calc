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
  assert.equal(TOOLS.length, 7);
  assert.equal(new Set(TOOLS.map((t) => t.slug)).size, 7, "슬러그 중복");
  for (const t of TOOLS) {
    assert.match(t.slug, /^[a-z0-9-]{2,40}$/, t.slug);   // DB 의 calc_tool_ok 와 같은 규칙
    assert.ok(t.name && t.blurb && t.question, t.slug);
    assert.equal(t.login, false, `${t.slug}: 기본 도구는 로그인 없이 쓴다`);
    assert.equal(toolBySlug(t.slug), t);
  }
});
