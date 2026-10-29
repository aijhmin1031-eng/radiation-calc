/** 베타 계산기 흡수체 표 — 제동복사는 낱장 · `/beta-shield-materials/` 와 같은 규칙(T13)이고, 멈추는 두께는 최대 끝점 그대로다. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { absorberRows } from "./beta-absorbers.ts";
import { NUCLIDES, nuclidePage } from "./nuclides.ts";

const row = (key: string, abs: string) => absorberRows(NUCLIDES[key]).rows.find((r) => r.value === abs)!;

test("계산기 제동복사 — Co-60 은 0.318 MeV 가지로 계산한다(납 0.912%, 아크릴 0.0723%)", () => {
  const t = absorberRows(NUCLIDES["Co-60"]);
  assert.equal(t.bremsKeV, 317.88);
  assert.equal((row("Co-60", "lead").f * 100).toPrecision(3), "0.912");
  assert.equal((row("Co-60", "acrylic").f * 100).toPrecision(3), "0.0723");
  // 멈추는 두께는 1.49 MeV 끝점 그대로다
  assert.equal(t.eMax, 1.492);
});

test("계산기 제동복사 — 낱장과 같은 끝점을 쓴다(베타 핵종 전수)", () => {
  for (const [k, n] of Object.entries(NUCLIDES)) {
    if (!n.beta?.length || !n.beta_max_keV) continue;
    assert.equal(absorberRows(n).eBrems, nuclidePage(k).bremsMeV, k);
  }
});

test("가지가 하나인 핵종(Y-90)은 값이 그대로다 — 도구 쪽 예제의 6.5% 가 지켜진다", () => {
  assert.equal((row("Y-90", "lead").f * 100).toPrecision(2), "6.5");
});
