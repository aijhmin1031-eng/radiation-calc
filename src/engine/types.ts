export interface BetaBranch {
  /** 최대 에너지 [keV] — 비정·제동복사가 쓴다. 일부 가지는 값이 없다. */
  max: number | null;
  /** 평균 에너지 [keV] — 선량이 쓰는 것은 **이쪽이다**(최대가 아니다). */
  mean: number;
  /** 붕괴 100회당 방출수 [%] */
  i: number;
  kind: "b-" | "b+";
}

export interface Nuclide {
  z: number; a: number; sym: string; iso: string;
  t_half_s: number; hl: string; hl_unit: string;
  decay: string | null;
  sa_bq_g: number;            // 비방사능 Bq/g
  gamma_const: number;        // 공기커마율상수 Γ [mGy·m²/(GBq·h)] · δ=20 keV
  lines: [energyKeV: number, intensityPct: number][];

  /** 베타 — 순수 베타 방출체는 lines 가 비고 이쪽만 있다. */
  beta?: BetaBranch[];
  beta_mean_keV?: number;     // 방출강도로 가중한 평균
  beta_max_keV?: number | null;
  beta_yield_pct?: number;

  /** 알파 — [에너지 keV, 방출강도 %] */
  alpha?: [number, number][];
  alpha_mean_keV?: number;
  alpha_yield_pct?: number;
}
export type NuclideMap = Record<string, Nuclide>;
export type Material = "air" | "water" | "concrete" | "lead" | "iron" | "tungsten" | "aluminum" | "copper";

export type Emission = "gamma" | "xray" | "beta" | "alpha";

/** 방출 분류 — 화면이 「무엇을 계산할 수 있는 핵종인가」를 가르는 데 쓴다.
 *  ★ `gamma_const > 0` 만으로 가르면 **EC 핵종이 통째로 사라진다** — Fe-55·Ni-59·Ca-41 은
 *    광자를 내지만 전부 δ(20 keV) 아래라 Γ 가 0 이다. 오염검사에서 실제로 세는 것들이다. */
export function emissionKinds(n: Nuclide): Emission[] {
  const k: Emission[] = [];
  if (n.gamma_const > 0) k.push("gamma");
  else if (n.lines.length) k.push("xray");
  if (n.beta?.length) k.push("beta");
  if (n.alpha?.length) k.push("alpha");
  return k;
}
