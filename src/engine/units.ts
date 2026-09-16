import { BQ_PER_CI, GY_PER_RAD, SV_PER_REM, CKG_PER_R, DPM_PER_BQ, W_AIR_J_PER_C } from "./constants";

/** 단위 환산 — 각 군의 기준단위로 가는 배수 하나로 둔다.
 *  ★ 군을 섞어 환산하지 않는다. Gy(흡수선량)·Sv(등가선량)·R(조사선량)은 **다른 양**이고,
 *    잇는 것은 물리 가정(W값·품질계수)이지 단위 환산이 아니다. 그 자리는 따로 함수를 둔다.
 *
 *  ★★ **그 원칙을 이 표 자신이 어기고 있었다**(2026-09-16 감사에서 잡았다). `massConc` 군에
 *    `Bq/L`·`pCi/L` 이 **질량 배율로** 들어 있어 부피↔질량을 밀도 없이 건너뛰었고,
 *    그 배율이 「1 L = 1 g」이라 **답이 1000배 틀렸다** —
 *      1 Bq/L → 1000 Bq/kg (물이면 1) · 1 pCi/L → 37 Bq/kg (0.037) .
 *    부피끼리(pCi/L→Bq/L)는 비가 맞아 **조용했고**, 테스트가 「자기 자신과 왕복」만 보아
 *    구조적으로 못 봤다. 지금은 **부피농도를 자기 군(`volConc`)으로 갈랐고**, 질량↔부피는
 *    아래 `massConcFromVolConc` — **밀도를 받는 물리 단계**다(조사선량↔공기커마와 같은 꼴). */
export type Quantity =
  | "activity" | "dose" | "equivalent" | "exposure" | "surface" | "massConc" | "volConc";

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
  /** 질량농도 — 분모가 **질량**인 것만 든다. 토양·폐기물·식품이 이 군이다. */
  massConc:   { base: "Bq/g",   u: { "Bq/g":1, "Bq/kg":1e-3, "kBq/kg":1, "MBq/kg":1e3,
                                     "pCi/g":BQ_PER_CI/1e12 } },
  /** 부피농도 — 분모가 **부피**인 것만 든다. 물·공기·소스 바이알이 이 군이다.
   *  ★ `pCi/L` 은 먹는물 기준이 쓰는 단위라 여기서 빠지면 안 된다. */
  volConc:    { base: "Bq/L",   u: { "Bq/L":1, "kBq/L":1e3, "MBq/L":1e6,
                                     "Bq/mL":1e3, "Bq/m³":1e-3,
                                     "pCi/L":BQ_PER_CI/1e12, "µCi/mL":BQ_PER_CI/1e6*1e3 } },
};

export function convert(value: number, from: string, to: string, q: Quantity): number {
  const t = UNITS[q].u;
  if (!(from in t) || !(to in t)) return NaN;
  return (value * t[from]) / t[to];
}

/** 공기커마 ↔ 조사선량 — **환산이 아니라 물리다**(W값이 들어간다). */
export const exposureToAirKerma = (cPerKg: number) => cPerKg * W_AIR_J_PER_C;   // Gy
export const airKermaToExposure = (gy: number) => gy / W_AIR_J_PER_C;           // C/kg

/** 물의 밀도 [g/mL] — 부피농도 ↔ 질량농도의 기본 가정. 20 °C 에서 0.998 이지만
 *  현장 관행이 1.00 이고, 화면에서 바꿀 수 있게 손잡이로 노출한다. */
export const DENSITY_WATER_G_PER_ML = 1.0;

/** 부피농도 → 질량농도 — **환산이 아니라 밀도다.**
 *  @param bqPerL Bq/L, @param densityGPerMl g/mL(= kg/L) → [Bq/g] */
export const massConcFromVolConc = (bqPerL: number, densityGPerMl = DENSITY_WATER_G_PER_ML) =>
  densityGPerMl > 0 ? bqPerL / (densityGPerMl * 1000) : NaN;

/** 질량농도 → 부피농도 — 같은 물리 단계의 역방향. [Bq/L] */
export const volConcFromMassConc = (bqPerG: number, densityGPerMl = DENSITY_WATER_G_PER_ML) =>
  densityGPerMl > 0 ? bqPerG * densityGPerMl * 1000 : NaN;
