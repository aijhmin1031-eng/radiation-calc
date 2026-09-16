import { test } from "node:test";
import assert from "node:assert/strict";
import att from "../data/attenuation.json" with { type: "json" };
import nuc from "../data/nuclides.json" with { type: "json" };
import type { Row } from "./interp.ts";
import type { NuclideMap, Material } from "./types.ts";
import { linearAttenuation } from "./gamma.ts";
import { hvlFromMu } from "./alara.ts";
import { spectrumHVL, spectrumTVL, spectrumTransmission, meanPhotonEnergyKeV, lineShares } from "./spectrum.ts";

const A = att as unknown as Record<Material, Row[]>;
const N = nuc as unknown as NuclideMap;
const SINGLE = Math.log(10) / Math.log(2);     // 3.3219 — 단일선의 TVL/HVL

/** ★★ **이 값은 좁은 빔이다.** 핸드북의 Co-60 납 반가층 12.5 mm 는 **넓은 빔**(축적 포함)
 *  값이라 우리 것(10.4 mm)과 다르다 — 틀린 것이 아니라 **다른 양**이다. 그래서 문헌 표가
 *  아니라 **같은 정의의 해석해**(단일 에너지 μ)와 대조한다. 문헌 표에 맞추려 들면 축적을
 *  몰래 섞게 되고, 그러면 화면의 「좁은 빔」이라는 말이 거짓이 된다. */
test("정말로 단일선인 핵종은 해석해와 정확히 일치한다 (Mn-54)", () => {
  const n = N["Mn-54"];
  const top = lineShares(n.lines, A.air)[0];
  assert.ok(top.share > 0.999, `Mn-54 주선 기여 ${(top.share * 100).toFixed(2)}% — 단일선이 아니다`);
  const analytic = hvlFromMu(linearAttenuation(A.lead, top.eKeV / 1000, "lead"));
  const spec = spectrumHVL(n.lines, A.air, A.lead, "lead");
  assert.ok(Math.abs(spec - analytic) < 1e-9, `스펙트럼 ${spec} vs 해석 ${analytic}`);
});

/** ★★ **이 검사가 이 lab 의 주장 그 자체다** — 「주선 하나로 표에서 읽으면 틀린다」.
 *  Na-22 는 1275 keV 가 커마의 55% 뿐이고 나머지가 511 keV 소멸감마다. 주선만 보면
 *  납 10.5 mm 인데 스펙트럼으로는 6.5 mm 로 **38% 다르다.** 이 차이가 사라지면 우리가
 *  스펙트럼을 푸는 이유도 사라진 것이므로 **차이가 있다는 것**을 잰다. */
test("선이 섞이면 주선 해석해와 크게 다르다 — 단일에너지 표가 틀리는 자리 (Na-22)", () => {
  const n = N["Na-22"];
  const top = lineShares(n.lines, A.air)[0];
  assert.ok(top.share < 0.7, `주선 기여 ${(top.share * 100).toFixed(1)}%`);
  const analytic = hvlFromMu(linearAttenuation(A.lead, top.eKeV / 1000, "lead"));
  const spec = spectrumHVL(n.lines, A.air, A.lead, "lead");
  assert.ok(Math.abs(spec - analytic) / analytic > 0.2, `차이 ${((spec - analytic) / analytic * 100).toFixed(1)}%`);
  assert.ok(spec < analytic, "연한 선이 섞이면 반가층은 얇아진다");
});

test("반가층에서 투과율이 정확히 0.5 다 (정의)", () => {
  for (const key of ["Co-60", "Cs-137", "I-131", "Ir-192", "Am-241", "Eu-152"]) {
    const h = spectrumHVL(N[key].lines, A.air, A.lead, "lead");
    const t = spectrumTransmission(N[key].lines, A.air, A.lead, "lead", h);
    assert.ok(Math.abs(t - 0.5) < 1e-6, `${key}: 투과 ${t}`);
  }
});

test("밀도 순서대로 두꺼워진다 — 텅스텐 < 납 < 철 < 콘크리트 < 물", () => {
  const l = N["Co-60"].lines;
  const h = (m: Material) => spectrumHVL(l, A.air, A[m], m);
  assert.ok(h("tungsten") < h("lead"), "텅스텐 < 납");
  assert.ok(h("lead") < h("iron"), "납 < 철");
  assert.ok(h("iron") < h("concrete"), "철 < 콘크리트");
  assert.ok(h("concrete") < h("water"), "콘크리트 < 물");
});

/** ★ 단일선이면 TVL/HVL 은 ln10/ln2 로 **정확히** 고정이다. 선이 여럿이면 얇은 층에서
 *  연한 선이 먼저 죽어 남은 빔이 단단해지므로 비가 **커진다**(빔 경화).
 *  3.32 아래로 내려가면 계산이 깨진 것이다. */
test("십가층/반가층 비가 3.3219 아래로 내려가지 않는다 (전 감마 핵종)", () => {
  let n = 0;
  for (const [key, nu] of Object.entries(N)) {
    if (!(nu.gamma_const > 0) || !nu.lines.length) continue;
    const r = spectrumTVL(nu.lines, A.air, A.lead, "lead") / spectrumHVL(nu.lines, A.air, A.lead, "lead");
    assert.ok(Number.isFinite(r) && r > SINGLE - 1e-6, `${key}: TVL/HVL = ${r}`);
    n++;
  }
  assert.ok(n > 90, `감마 핵종 ${n}종만 검사됐다`);
});

/** ★★ **「반가층 하나」가 통하지 않는 핵종이 있다.** Sn-113 은 TVL/HVL 이 84 다 — 첫 절반은
 *  연한 광자를 죽여 얻고, 십분의 일까지 가려면 단단한 꼬리를 뚫어야 한다. 그런 핵종에서
 *  「HVL 을 세 번 겹치면 1/8」은 **거짓**이다. 쪽이 그 사실을 말해야 하므로 근거를 잰다. */
test("빔 경화가 심한 핵종을 실제로 집어낸다", () => {
  const r = (k: string) =>
    spectrumTVL(N[k].lines, A.air, A.lead, "lead") / spectrumHVL(N[k].lines, A.air, A.lead, "lead");
  assert.ok(r("Sn-113") > 10, `Sn-113 비 ${r("Sn-113")}`);
  assert.ok(Math.abs(r("Mn-54") - SINGLE) < 1e-6, "단일선은 정확히 3.3219");
});

test("선별 커마 기여도의 합은 1 이고 방출강도 순서와 다를 수 있다", () => {
  const s = lineShares(N["Co-60"].lines, A.air);
  assert.ok(Math.abs(s.reduce((a, x) => a + x.share, 0) - 1) < 1e-9);
  assert.ok(s[0].eKeV > s[1].eKeV, "에너지가 높은 선이 커마 기여에서 앞선다");
});

test("커마 가중 평균 에너지는 최저선과 최고선 사이다", () => {
  for (const key of ["Co-60", "I-131", "Eu-152", "Ba-133"]) {
    const n = N[key]; if (!n?.lines.length) continue;
    const kept = n.lines.filter(([e]) => e >= 20).map(([e]) => e);
    const m = meanPhotonEnergyKeV(n.lines, A.air);
    assert.ok(m >= Math.min(...kept) && m <= Math.max(...kept), `${key}: ${m}`);
  }
});

/** ★ 쪽이 147장이라 한 종만 NaN 이어도 화면에 「NaN mm」이 그대로 나간다. */
test("선이 없으면 NaN 이다 — 0 이 아니다", () => {
  assert.ok(Number.isNaN(spectrumHVL([], A.air, A.lead, "lead")));
});

test("감마 핵종 전수 × 7물질에서 HVL·TVL 이 유한하고 양수다", () => {
  const bad: string[] = [];
  for (const [key, nu] of Object.entries(N)) {
    if (!(nu.gamma_const > 0)) continue;
    for (const m of ["lead", "tungsten", "iron", "copper", "concrete", "water", "aluminum"] as Material[]) {
      const h = spectrumHVL(nu.lines, A.air, A[m], m), t = spectrumTVL(nu.lines, A.air, A[m], m);
      if (!(h > 0) || !Number.isFinite(h) || !(t > h)) bad.push(`${key}/${m}`);
    }
  }
  assert.equal(bad.length, 0, `비정상: ${bad.slice(0, 8).join(", ")}`);
});
