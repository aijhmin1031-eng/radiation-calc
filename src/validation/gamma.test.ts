/** ★★ 감마 계산기 유효성 평가 — 케이스 정본과 엔진의 대조.
 *  ★ 사슬이므로 **고리마다 다른 자**를 쓴다: 유도·항등식은 정확(1e-12), 보간은 표점에서
 *    정확·중간점은 손계산, 방출선은 **불확도의 σ 배수**, 차폐는 10자리 손계산. */
import { test } from "node:test";
import assert from "node:assert/strict";
import nuc from "../data/nuclides.json" with { type: "json" };
import att from "../data/attenuation.json" with { type: "json" };
import type { NuclideMap, Material } from "../engine/types.ts";
import { gammaConstant, pointSourceDoseRate, linearAttenuation, bergerBuildup,
         shieldedDoseRate, DENSITY_G_CM3 } from "../engine/gamma.ts";
import { logInterp, type Row } from "../engine/interp.ts";
import {
  DERIVATION_CASES, IDENTITY_CASES, INTERP_CASES, EMISSION_REFS, EMISSION_SELF_CHECK,
  DELTA_CASES, WORKED_CASES, REFUSAL_CASES, photonProbability, photonUncertainty,
  TOLERANCE_EXACT, TOLERANCE_WORKED, SIGMA_LIMIT, NODE_TOLERANCE,
} from "./gamma.cases.ts";

const N = nuc as unknown as NuclideMap;
const A = att as unknown as Record<string, Row[]>;
const rel = (g: number, w: number) => (w === 0 ? Math.abs(g) : Math.abs(g - w) / Math.abs(w));
const near = (g: number, w: number, what: string, tol: number) =>
  assert.ok(rel(g, w) < tol, `${what}: 도구 ${g}, 손계산 ${w}, 상대차 ${rel(g, w)} (허용 ${tol})`);

/** 홑에너지 가짜 선원 — 항등식은 스펙트럼이 아니라 지수함수를 시험한다. */
const ONE_LINE: [number, number][] = [[661.657, 100]];
const shield = (thicknessCm: number, mode: "none" | "attenuation" | "buildup" = "attenuation") =>
  shieldedDoseRate({ lines: ONE_LINE, air: A.air, shield: A.lead, material: "lead" as Material,
    activityGBq: 1, distanceM: 1, thicknessCm, mode, deltaKeV: 20 });

/* ───────── ① 단위 사슬 ───────── */
test("★ 단위 사슬 — 손으로 유도한 인자가 코드의 상수와 같다", () => {
  const derived: Record<string, number> = {
    "G-U-01": 1e3 * 1e9 * 3600,                 // Gy→mGy · /Bq→/GBq · /s→/h
    "G-U-02": (1e-2 ** 2) / 1e-3,               // cm²/g → m²/kg
    "G-U-03": 1,                                 // 산술 없음 — 선택을 기록하는 자리
  };
  for (const c of DERIVATION_CASES)
    near(derived[c.id], c.expect, `${c.id} ${c.title}`, TOLERANCE_EXACT);
  /* ★ 유도한 인자가 **실제로 엔진 안에 들어 있는지**까지 본다 — 유도만 맞고 코드가 다르면
     이 검사는 자기 자신을 확인할 뿐이다. Γ 를 두 번 계산해 비를 본다. */
  const src = gammaConstant(N["Cs-137"], A.air, 20);
  assert.ok(src > 0.07 && src < 0.08,
    `Γ(Cs-137)=${src} — 3.6e15 이나 0.1 이 바뀌면 이 자리가 자릿수째 달라진다`);
  console.log(`  · 단위 유도 ${DERIVATION_CASES.length}건 · 3.6e15 = ${derived["G-U-01"]} · cm²/g→m²/kg = ${derived["G-U-02"]}`);
});

/* ───────── ② 항등식 ───────── */
test("★ 항등식 — 감쇠계수가 무엇이든 성립한다", () => {
  const mu = linearAttenuation(A.lead, 0.661657, "lead" as Material);
  const got: Record<string, () => number> = {
    "G-ID-01": () => pointSourceDoseRate(0.3, 1, 2) / pointSourceDoseRate(0.3, 1, 1),
    "G-ID-02": () => pointSourceDoseRate(0.3, 2, 1) / pointSourceDoseRate(0.3, 1, 1),
    "G-ID-03": () => shield(0).transmission,
    "G-ID-04": () => shield(5, "none").transmission,
    "G-ID-05": () => shield(Math.LN2 / mu).transmission,
    "G-ID-06": () => shield(Math.log(10) / mu).transmission,
    "G-ID-07": () => (Math.log(10) / mu) / (Math.LN2 / mu),
    "G-ID-08": () => bergerBuildup(0, 0.5, 0.1),
    "G-ID-09": () => bergerBuildup(3, NaN, NaN),
    /* ★★ 화면이 쓰는 경로와 보고서가 재는 경로가 같은지 — 이것이 없으면 둘이 갈려도 조용하다. */
    "G-ID-10": () => {
      let worst = 1;
      for (const [k, act, d] of [["Co-60", 37, 1], ["Ir-192", 370, 2], ["Cs-137", 5, 0.3]] as const) {
        const a = pointSourceDoseRate(gammaConstant(N[k], A.air, 20), act, d);
        const b = shieldedDoseRate({ lines: N[k].lines, air: A.air, shield: A.lead,
          material: "lead" as Material, activityGBq: act, distanceM: d,
          thicknessCm: 0, mode: "none", deltaKeV: 20 }).doseRate;
        if (Math.abs(a / b - 1) > Math.abs(worst - 1)) worst = a / b;
      }
      return worst;
    },
  };
  for (const c of IDENTITY_CASES) near(got[c.id](), c.expect, `${c.id} ${c.title}`, TOLERANCE_EXACT);
  console.log(`  · 항등식 ${IDENTITY_CASES.length}건 (μ = ${mu.toPrecision(10)} 1/cm 에서)`);
});

/* ───────── ③ 보간 ───────── */
test("★ 보간 — 표점에서는 표값이 그대로, 중간점은 손계산과 같다", () => {
  for (const c of INTERP_CASES) {
    const v = logInterp(A[c.material], c.energyMeV, c.col);
    near(v, c.expect, `${c.id} ${c.title}`, TOLERANCE_WORKED);
  }
  /* ★ 표점 검사는 **전수로** 돌린다 — 다섯 재료의 모든 행에서 오차가 정확히 0 이어야 한다. */
  let nodes = 0, worst = 0;
  for (const [mat, rows] of Object.entries(A))
    for (let i = 0; i < rows.length; i++) {
      // 흡수단의 중복 에너지는 아래 가지가 답이므로 첫 행만 센다
      if (i > 0 && rows[i][0] === rows[i - 1][0]) continue;
      if (i + 1 < rows.length && rows[i][0] === rows[i + 1][0]) continue;
      for (const col of [1, 2] as const) {
        nodes += 1;
        const r = rel(logInterp(rows, rows[i][0], col), rows[i][col]);
        if (r > worst) worst = r;
      }
      void mat;
    }
  /* ★★ 처음에 「정확히 0」으로 걸었다가 **이 검사가 내 주장을 잡았다**(실측 5.8×10⁻¹⁶).
     E 가 표점과 같으면 가중치 f 는 정확히 1 이 되지만, 그 뒤의
     `exp(log(y0) + 1·(log(y1) − log(y0)))` 에서 **`log(y0) + (log(y1) − log(y0))` 가
     부동소수로는 `log(y1)` 과 정확히 같지 않다.** 그래서 표점 재현은 「완전 일치」가 아니라
     **산술의 바닥**이다. 그렇게 적는 것이 사실이고, 한 자릿수 여유를 둔 자로 잰다. */
  assert.ok(worst < NODE_TOLERANCE,
    `표점 재현이 산술의 바닥을 넘었다: ${worst} (허용 ${NODE_TOLERANCE})`);
  console.log(`  · 보간 손계산 ${INTERP_CASES.length}건 · 표점 전수 ${nodes}개 · 최대 상대차 ${worst.toExponential(3)} (허용 ${NODE_TOLERANCE})`);
});

/* ───────── ④ 방출선 ───────── */
test("★ 방출선 — DDEP 전이확률에서 유도한 값과 σ 로 견준다", () => {
  // 유도가 스스로를 확인한다
  const self = EMISSION_SELF_CHECK;
  const r0 = EMISSION_REFS.find((r) => r.nuclide === self.nuclide)!;
  near(photonProbability(r0), self.recommended, `${self.id} 유도가 DDEP 권고값을 재현한다`, self.tolerance);

  const sig: [string, number, number][] = [];
  for (const r of EMISSION_REFS) {
    const lines = N[r.nuclide].lines;
    const hit = lines.find(([e]) => Math.abs(e - r.energyKeV) < 0.05);
    assert.ok(hit, `${r.id}: ${r.nuclide} 의 ${r.energyKeV} keV 선이 자료에 없다`);
    const pg = photonProbability(r), u = photonUncertainty(r);
    const s = Math.abs(hit![1] - pg) / u;
    sig.push([`${r.nuclide} ${r.energyKeV}`, s, ((hit![1] - pg) / pg) * 100]);
    assert.ok(s < SIGMA_LIMIT,
      `${r.id} ${r.nuclide} ${r.energyKeV} keV: 우리 ${hit![1]}% · DDEP 유도 ${pg}% ± ${u} · ${s.toFixed(2)}σ`);
  }
  sig.sort((a, b) => b[1] - a[1]);
  console.log(`  · 방출선 ${EMISSION_REFS.length}건 · 최대 ${sig[0][1].toFixed(2)}σ (${sig[0][0]}, ${sig[0][2].toFixed(4)}%) · 유도 자기확인 통과`);
});

/* ───────── ⑤ δ 민감도 ───────── */
test("★ δ — 규약 차이의 크기를 얼어 둔다", () => {
  for (const c of DELTA_CASES) {
    const r = gammaConstant(N[c.nuclide], A.air, 10) / gammaConstant(N[c.nuclide], A.air, 20);
    near(r, c.ratio10over20, `${c.id} ${c.nuclide} Γ(δ=10)/Γ(δ=20)`, TOLERANCE_WORKED);
  }
  const worst = DELTA_CASES.reduce((m, c) => (c.ratio10over20 > m.ratio10over20 ? c : m));
  console.log(`  · δ 민감도 ${DELTA_CASES.length}건 · 최대 ${worst.nuclide} ×${worst.ratio10over20.toFixed(3)}`);
});

/* ───────── ⑥ 끝에서 끝까지 ───────── */
test("★ 손계산 케이스 — Γ · 선량률 · 투과율", () => {
  for (const c of WORKED_CASES) {
    let got: number;
    if (c.kind === "gammaConstant") got = gammaConstant(N[c.nuclide], A.air, 20);
    else if (c.kind === "doseRate") {
      got = pointSourceDoseRate(gammaConstant(N[c.nuclide], A.air, 20), c.input!.activityGBq!, c.input!.distanceM!);
      /* ★ **화면이 쓰는 경로로도 잰다** — 보고서가 재는 경로만 맞고 화면이 틀리면 뜻이 없다. */
      const onScreenPath = shieldedDoseRate({ lines: N[c.nuclide].lines, air: A.air, shield: A.lead,
        material: "lead" as Material, activityGBq: c.input!.activityGBq!, distanceM: c.input!.distanceM!,
        thicknessCm: 0, mode: "none", deltaKeV: 20 }).doseRate;
      near(onScreenPath, c.expect, `${c.id} ${c.title} (화면이 쓰는 경로)`, TOLERANCE_WORKED);
    }
    else
      got = shieldedDoseRate({ lines: N[c.nuclide].lines, air: A.air, shield: A[c.input!.material!],
        material: c.input!.material as Material, activityGBq: 1, distanceM: 1,
        thicknessCm: c.input!.thicknessCm!, mode: "attenuation", deltaKeV: 20 }).transmission;
    near(got, c.expect, `${c.id} ${c.title}`, TOLERANCE_WORKED);
  }
  console.log(`  · 손계산 ${WORKED_CASES.length}건`);
});

/* ───────── ⑦ 거부 ───────── */
test("★ 거부 — 답이 없는 기하에서 수를 내지 않는다", () => {
  for (const c of REFUSAL_CASES) {
    const v = pointSourceDoseRate(0.3, 37, c.distanceM);
    assert.ok(Number.isNaN(v), `${c.id} ${c.title}: NaN 이어야 하는데 ${v} 이 나왔다`);
  }
  console.log(`  · 거부 ${REFUSAL_CASES.length}건 전건 NaN`);
});

/* ───────── ⑧ 밀도 ───────── */
test("★ 선감쇠계수는 질량감쇠계수 × 밀도다", () => {
  for (const [mat, rho] of Object.entries(DENSITY_G_CM3)) {
    const E = 0.5;
    near(linearAttenuation(A[mat], E, mat as Material),
         logInterp(A[mat], E, 1) * rho, `μ(${mat})`, TOLERANCE_EXACT);
    near(linearAttenuation(A[mat], E, mat as Material, 2 * rho),
         2 * linearAttenuation(A[mat], E, mat as Material), `밀도 두 배(${mat})`, TOLERANCE_EXACT);
  }
  console.log(`  · 재료 ${Object.keys(DENSITY_G_CM3).length}종 · μ = (μ/ρ)·ρ · 밀도에 선형`);
});
