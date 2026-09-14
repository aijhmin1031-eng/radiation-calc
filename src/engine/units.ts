import { BQ_PER_CI, GY_PER_RAD, SV_PER_REM, CKG_PER_R, DPM_PER_BQ, W_AIR_J_PER_C } from "./constants";

/** 단위 환산 — 각 군의 기준단위로 가는 배수 하나로 둔다.
 *  ★ 군을 섞어 환산하지 않는다. Gy(흡수선량)·Sv(등가선량)·R(조사선량)은 **다른 양**이고,
 *    잇는 것은 물리 가정(W값·품질계수)이지 단위 환산이 아니다. 그 자리는 따로 함수를 둔다. */
export type Quantity = "activity" | "dose" | "equivalent" | "exposure" | "surface" | "massConc";

export const UNITS: Record<Quantity, { base: string; u: Record<string, number> }> = {
  activity:   { base: "Bq",     u: { Bq:1, kBq:1e3, MBq:1e6, GBq:1e9, TBq:1e12,
                                     Ci:BQ_PER_CI, mCi:BQ_PER_CI/1e3, "µCi":BQ_PER_CI/1e6,
                                     nCi:BQ_PER_CI/1e9, pCi:BQ_PER_CI/1e12,
                                     dps:1, dpm:1/DPM_PER_BQ } },
  dose:       { base: "Gy",     u: { Gy:1, mGy:1e-3, "µGy":1e-6, rad:GY_PER_RAD, mrad:GY_PER_RAD/1e3 } },
  equivalent: { base: "Sv",     u: { Sv:1, mSv:1e-3, "µSv":1e-6, rem:SV_PER_REM, mrem:SV_PER_REM/1e3 } },
  exposure:   { base: "C/kg",   u: { "C/kg":1, R:CKG_PER_R, mR:CKG_PER_R/1e3, "µR":CKG_PER_R/1e6 } },
  surface:    { base: "Bq/cm²", u: { "Bq/cm²":1, "Bq/m²":1e-4, "kBq/m²":0.1,
                                     "dpm/100cm²":1/(DPM_PER_BQ*100), "dpm/cm²":1/DPM_PER_BQ,
                                     "µCi/cm²":BQ_PER_CI/1e6 } },
  massConc:   { base: "Bq/g",   u: { "Bq/g":1, "Bq/kg":1e-3, "kBq/kg":1, "Bq/L":1,
                                     "pCi/g":BQ_PER_CI/1e12, "pCi/L":BQ_PER_CI/1e12 } },
};

export function convert(value: number, from: string, to: string, q: Quantity): number {
  const t = UNITS[q].u;
  if (!(from in t) || !(to in t)) return NaN;
  return (value * t[from]) / t[to];
}

/** 공기커마 ↔ 조사선량 — **환산이 아니라 물리다**(W값이 들어간다). */
export const exposureToAirKerma = (cPerKg: number) => cPerKg * W_AIR_J_PER_C;   // Gy
export const airKermaToExposure = (gy: number) => gy / W_AIR_J_PER_C;           // C/kg
