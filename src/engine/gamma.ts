import { MEV_J, DELTA_DEFAULT_KEV } from "./constants";
import { logInterp, type Row } from "./interp";
import type { Nuclide, Material } from "./types";

/** 공기커마율상수  Γ = Σᵢ Eᵢ·yᵢ·(μen/ρ)air / 4π   [mGy·m²/(GBq·h)]
 *
 *  ★ 표에서 베끼지 않고 계산한다 — 원천이 IAEA(Eᵢ,yᵢ)와 NIST(μen/ρ) 둘 다 공개라
 *    값이 우리 것이고 검증도 된다. 핸드북 Γ 표를 옮겨 심으면 둘 다 잃는다. */
export function gammaConstant(
  nuc: Pick<Nuclide, "lines">,
  air: Row[],
  deltaKeV = DELTA_DEFAULT_KEV,
): number {
  let s = 0;
  for (const [eKeV, yPct] of nuc.lines) {
    if (eKeV < deltaKeV) continue;
    const E = eKeV / 1000;                       // MeV
    const muEn = logInterp(air, E, 2) * 0.1;     // cm²/g → m²/kg
    s += E * MEV_J * (yPct / 100) * muEn;
  }
  return (s / (4 * Math.PI)) * 3.6e15;           // Gy·m²/(Bq·s) → mGy·m²/(GBq·h)
}

/** 점선원 선량률 (차폐 없음):  Ḋ = Γ·A / d²  */
export function pointSourceDoseRate(gammaConst: number, activityGBq: number, distanceM: number): number {
  if (distanceM <= 0) return NaN;
  return (gammaConst * activityGBq) / (distanceM * distanceM);   // mGy/h
}

/** 선감쇠계수 μ [1/cm] — NIST 의 질량감쇠계수에 밀도를 곱한다. */
export const DENSITY_G_CM3: Record<Material, number> = {
  air: 1.205e-3, water: 1.0, concrete: 2.3, lead: 11.35,
  iron: 7.874, tungsten: 19.3, aluminum: 2.699, copper: 8.96,
};

export function linearAttenuation(rows: Row[], E_MeV: number, material: Material, densityOverride?: number): number {
  const rho = densityOverride ?? DENSITY_G_CM3[material];
  return logInterp(rows, E_MeV, 1) * rho;   // 1/cm
}

/** 빌드업 인자 — Berger 2-계수형  B = 1 + a·μx·e^(b·μx)
 *  ★ ANSI/ANS-6.4.3 의 GP 계수표는 유료 규격 본문이라 재현하지 않는다.
 *    계수는 사용자가 넣거나 공개 문헌값을 출처와 함께 고른다. */
export function bergerBuildup(mux: number, a: number, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 1;
  return 1 + a * mux * Math.exp(b * mux);
}

export type ShieldMode = "none" | "attenuation" | "buildup";

/** 차폐를 통과한 선량률.
 *  ★ mode="attenuation" 은 **산란선을 빼고** 계산한다 — 과소평가다. 화면에 그렇게 적는다. */
export function shieldedDoseRate(opts: {
  lines: [number, number][]; air: Row[]; shield: Row[];
  material: Material; densityOverride?: number;
  activityGBq: number; distanceM: number; thicknessCm: number;
  mode: ShieldMode; berger?: { a: number; b: number }; deltaKeV?: number;
}): { doseRate: number; unshielded: number; transmission: number } {
  const d = opts.deltaKeV ?? DELTA_DEFAULT_KEV;
  let shielded = 0, bare = 0;
  for (const [eKeV, yPct] of opts.lines) {
    if (eKeV < d) continue;
    const E = eKeV / 1000;
    const muEnAir = logInterp(opts.air, E, 2) * 0.1;
    const term = E * MEV_J * (yPct / 100) * muEnAir;
    bare += term;
    if (opts.mode === "none" || opts.thicknessCm <= 0) { shielded += term; continue; }
    const mu = linearAttenuation(opts.shield, E, opts.material, opts.densityOverride);
    const mux = mu * opts.thicknessCm;
    const B = opts.mode === "buildup" && opts.berger ? bergerBuildup(mux, opts.berger.a, opts.berger.b) : 1;
    shielded += term * B * Math.exp(-mux);
  }
  const k = 3.6e15 / (4 * Math.PI) * opts.activityGBq / (opts.distanceM ** 2);
  return { doseRate: shielded * k, unshielded: bare * k, transmission: bare > 0 ? shielded / bare : 0 };
}
