/** T16(2026-10-29) — 화면이 보여 주는 Γ(`gammaOf`)는 낱장이 찍는 엔진 값과 같다. 저장 값(소수 여섯째 자리 반올림)으로
 *  되돌아가면 작은 Γ 에서 낱장과 어긋난다(Pm-147 저장 1e-06, 낱장 5.19e-07). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { NUCLIDES, ATTEN, gammaOf } from "./nuclides.ts";
import { gammaConstant, DELTA_DEFAULT_KEV } from "../engine/index.ts";

test("보여 주는 Γ 는 낱장의 엔진 값이다 — 작은 Γ 포함, 저장 값이 0 이면 0", () => {
  for (const k of Object.keys(NUCLIDES)) {
    const want = NUCLIDES[k].gamma_const > 0 ? gammaConstant(NUCLIDES[k], ATTEN.air, DELTA_DEFAULT_KEV) : 0;
    assert.equal(gammaOf(k), want, k);
  }
  assert.equal(gammaOf("Pm-147").toExponential(2), "5.19e-7");
});
