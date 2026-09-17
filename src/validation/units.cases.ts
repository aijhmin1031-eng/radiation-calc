/** ★★★ 단위환산 도구의 **유효성 평가 케이스 정본**(2026-09-17).
 *
 *  「우리 도구로 계산한 결과가 손으로 계산한 결과와 같다」를 보이는 자료이고,
 *  **테스트·공개 낱장·게이트 셋이 전부 이 파일에서 파생된다.** 세 곳에 따로 적으면
 *  반드시 한쪽이 낡는다 — 이 레포들이 되풀이해 배운 것이다.
 *
 *  ★★ **이 파일은 `engine/` 의 값을 하나도 import 하지 않는다.**
 *    기대값을 엔진 상수에서 계산하면 「도구가 도구와 같다」를 증명할 뿐이다(순환논증).
 *    아래 배수는 전부 `sources.ts` 의 **원문에서 사람이 옮겨 적은 수**이고, 쓰인 산술은
 *    그 수들끼리의 곱·나눗셈뿐이다. 지키는 것은 `gate/check-validation.mjs` ②다.
 *    (`import type` 만 허용한다 — 형은 컴파일에서 지워지므로 값을 들여오지 않는다.)
 *
 *  ★★ **왜 배수 44개면 충분한가.** 엔진의 환산은 `value × f_from / f_to` 한 줄이다.
 *    따라서 각 단위의 **기준단위 배수 f 하나씩**을 독립적으로 검증하면, 같은 군 안의
 *    **순서쌍 276개**는 그 배수들의 비로 전부 따라온다. 테스트가 그 276쌍을 여기 적힌
 *    배수에서 만들어 엔진 출력과 **전수** 대조한다 — 표본이 아니라 전수다.
 *
 *  ★ **정확함과 표현 가능함은 다른 층이다.** 아래 44개 배수는 전부 정의에서 나온 정확값이지만,
 *    1/60 처럼 2진 부동소수로 **정확히 표현되지 않는 것**이 있다. 그래서 대조는 같음이 아니라
 *    상대차로 하고, 합격기준을 명시한다(TOLERANCE). 이 도구에서 **정의가 아닌 상수는
 *    W/e 하나뿐**이고 그것만 불확도를 진다. */
import type { Quantity } from "../engine/units";

/** 합격기준 — 상대차. 배정밀도 2진 부동소수의 기계엡실론이 약 2.2×10⁻¹⁶ 이고,
 *  한 번의 곱·나눗셈에서 오차가 그 몇 배를 넘지 않는다. 1e-12 는 거기서 네 자릿수 여유다.
 *  ★ 이 값을 느슨하게 잡으면 **1000배 틀린 것은 잡고 0.1% 틀린 것은 놓친다** — 그런 자를
 *    쓰면 「통과」가 아무 뜻이 없다. 실제 관측 상대차는 통과 로그에 찍는다. */
export const TOLERANCE = 1e-12;

export interface UnitCase {
  id: string;
  quantity: Quantity;
  unit: string;
  /** 이 단위 1 이 그 군의 기준단위로 몇인가 — 원문에서 옮긴 수들의 산술로만 쓴다. */
  factor: number;
  /** 손계산 단계. 마지막 줄이 factor 를 말한다. */
  steps: string[];
  /** 인용한 정의 — `sources.ts` 의 STATEMENTS id. */
  cites: string[];
}

/* ───────────────────────────── 1. Activity — base Bq ───────────────────────────── */
const ACTIVITY: UnitCase[] = [
  { id: "U-ACT-01", quantity: "activity", unit: "Bq", factor: 1, cites: ["bq"],
    steps: [
      "The becquerel is the SI unit of activity, equal to one reciprocal second.",
      "It is the base unit of this group, so its factor to the base is 1 exactly.",
    ] },
  { id: "U-ACT-02", quantity: "activity", unit: "kBq", factor: 1e3, cites: ["bq", "prefixes"],
    steps: ["The SI prefix kilo (k) denotes 10³.", "1 kBq = 10³ Bq.", "Factor to base = 1 × 10³."] },
  { id: "U-ACT-03", quantity: "activity", unit: "MBq", factor: 1e6, cites: ["bq", "prefixes"],
    steps: ["The SI prefix mega (M) denotes 10⁶.", "1 MBq = 10⁶ Bq.", "Factor to base = 1 × 10⁶."] },
  { id: "U-ACT-04", quantity: "activity", unit: "GBq", factor: 1e9, cites: ["bq", "prefixes"],
    steps: ["The SI prefix giga (G) denotes 10⁹.", "1 GBq = 10⁹ Bq.", "Factor to base = 1 × 10⁹."] },
  { id: "U-ACT-05", quantity: "activity", unit: "TBq", factor: 1e12, cites: ["bq", "prefixes"],
    steps: ["The SI prefix tera (T) denotes 10¹².", "1 TBq = 10¹² Bq.", "Factor to base = 1 × 10¹²."] },
  { id: "U-ACT-06", quantity: "activity", unit: "Ci", factor: 3.7e10, cites: ["ci", "ci-exact"],
    steps: [
      "The 12th CGPM retained the curie outside the SI with the value 3.7 × 10¹⁰ s⁻¹.",
      "One reciprocal second is one becquerel, so 1 Ci = 3.7 × 10¹⁰ Bq.",
      "NIST SP 811 prints this factor in boldface, which its table defines as exact.",
      "Factor to base = 3.7 × 10¹⁰.",
    ] },
  { id: "U-ACT-07", quantity: "activity", unit: "mCi", factor: 3.7e10 / 1e3, cites: ["ci", "prefixes"],
    steps: [
      "1 Ci = 3.7 × 10¹⁰ Bq, and the prefix milli (m) denotes 10⁻³.",
      "1 mCi = 10⁻³ × 3.7 × 10¹⁰ Bq = 3.7 × 10⁷ Bq.",
      "Factor to base = 3.7 × 10⁷.",
    ] },
  { id: "U-ACT-08", quantity: "activity", unit: "µCi", factor: 3.7e10 / 1e6, cites: ["ci", "prefixes"],
    steps: [
      "1 Ci = 3.7 × 10¹⁰ Bq, and the prefix micro (µ) denotes 10⁻⁶.",
      "1 µCi = 10⁻⁶ × 3.7 × 10¹⁰ Bq = 3.7 × 10⁴ Bq.",
      "Factor to base = 3.7 × 10⁴, that is, 37 kBq.",
    ] },
  { id: "U-ACT-09", quantity: "activity", unit: "nCi", factor: 3.7e10 / 1e9, cites: ["ci", "prefixes"],
    steps: [
      "1 Ci = 3.7 × 10¹⁰ Bq, and the prefix nano (n) denotes 10⁻⁹.",
      "1 nCi = 10⁻⁹ × 3.7 × 10¹⁰ Bq = 3.7 × 10¹ Bq.",
      "Factor to base = 37.",
    ] },
  { id: "U-ACT-10", quantity: "activity", unit: "pCi", factor: 3.7e10 / 1e12, cites: ["ci", "prefixes"],
    steps: [
      "1 Ci = 3.7 × 10¹⁰ Bq, and the prefix pico (p) denotes 10⁻¹².",
      "1 pCi = 10⁻¹² × 3.7 × 10¹⁰ Bq = 3.7 × 10⁻² Bq.",
      "Factor to base = 0.037.",
    ] },
  { id: "U-ACT-11", quantity: "activity", unit: "dps", factor: 1, cites: ["bq"],
    steps: [
      "A disintegration per second is one nuclear transformation per second.",
      "The becquerel is defined as one reciprocal second, so the two coincide.",
      "Factor to base = 1 exactly.",
    ] },
  { id: "U-ACT-12", quantity: "activity", unit: "dpm", factor: 1 / 60, cites: ["bq", "minute"],
    steps: [
      "A disintegration per minute is one transformation per minute.",
      "The SI Brochure gives 1 min = 60 s, so one transformation per minute is 1/60 per second.",
      "The becquerel is one reciprocal second, so 1 dpm = (1/60) Bq.",
      "Factor to base = 1/60 ≈ 1.6666667 × 10⁻², the reciprocal of 1 Bq = 60 dpm.",
    ] },
];

/* ───────────────────────────── 2. Absorbed dose — base Gy ───────────────────────── */
const DOSE: UnitCase[] = [
  { id: "U-ABS-01", quantity: "dose", unit: "Gy", factor: 1, cites: ["gy"],
    steps: [
      "The gray is the SI unit of absorbed dose, equal to one joule per kilogram.",
      "It is the base unit of this group, so its factor to the base is 1 exactly.",
    ] },
  { id: "U-ABS-02", quantity: "dose", unit: "mGy", factor: 1e-3, cites: ["gy", "prefixes"],
    steps: ["The prefix milli (m) denotes 10⁻³.", "1 mGy = 10⁻³ Gy.", "Factor to base = 1 × 10⁻³."] },
  { id: "U-ABS-03", quantity: "dose", unit: "µGy", factor: 1e-6, cites: ["gy", "prefixes"],
    steps: ["The prefix micro (µ) denotes 10⁻⁶.", "1 µGy = 10⁻⁶ Gy.", "Factor to base = 1 × 10⁻⁶."] },
  { id: "U-ABS-04", quantity: "dose", unit: "rad", factor: 1e-2, cites: ["rad-exact"],
    steps: [
      "NIST SP 811 gives rad → gray as 1.0 E−02 in boldface, that is, exact.",
      "1 rad = 10⁻² Gy = 1 cGy.",
      "Factor to base = 0.01.",
    ] },
  { id: "U-ABS-05", quantity: "dose", unit: "mrad", factor: 1e-2 / 1e3, cites: ["rad-exact", "prefixes"],
    steps: [
      "1 rad = 10⁻² Gy, and the prefix milli (m) denotes 10⁻³.",
      "1 mrad = 10⁻³ × 10⁻² Gy = 10⁻⁵ Gy = 10 µGy.",
      "Factor to base = 1 × 10⁻⁵.",
    ] },
];

/* ───────────────────────────── 3. Dose equivalent — base Sv ─────────────────────── */
const EQUIVALENT: UnitCase[] = [
  { id: "U-EQV-01", quantity: "equivalent", unit: "Sv", factor: 1, cites: ["sv"],
    steps: [
      "The sievert is the coherent SI unit of dose equivalent, joule per kilogram.",
      "It is the base unit of this group, so its factor to the base is 1 exactly.",
    ] },
  { id: "U-EQV-02", quantity: "equivalent", unit: "mSv", factor: 1e-3, cites: ["sv", "prefixes"],
    steps: ["The prefix milli (m) denotes 10⁻³.", "1 mSv = 10⁻³ Sv.", "Factor to base = 1 × 10⁻³."] },
  { id: "U-EQV-03", quantity: "equivalent", unit: "µSv", factor: 1e-6, cites: ["sv", "prefixes"],
    steps: ["The prefix micro (µ) denotes 10⁻⁶.", "1 µSv = 10⁻⁶ Sv.", "Factor to base = 1 × 10⁻⁶."] },
  { id: "U-EQV-04", quantity: "equivalent", unit: "rem", factor: 1e-2, cites: ["rem-exact"],
    steps: [
      "NIST SP 811 gives rem → sievert as 1.0 E−02 in boldface, that is, exact.",
      "1 rem = 10⁻² Sv = 1 cSv.",
      "Factor to base = 0.01.",
    ] },
  { id: "U-EQV-05", quantity: "equivalent", unit: "mrem", factor: 1e-2 / 1e3, cites: ["rem-exact", "prefixes"],
    steps: [
      "1 rem = 10⁻² Sv, and the prefix milli (m) denotes 10⁻³.",
      "1 mrem = 10⁻³ × 10⁻² Sv = 10⁻⁵ Sv = 10 µSv.",
      "Factor to base = 1 × 10⁻⁵.",
    ] },
];

/* ───────────────────────────── 4. Exposure — base C/kg ──────────────────────────── */
const EXPOSURE: UnitCase[] = [
  { id: "U-EXP-01", quantity: "exposure", unit: "C/kg", factor: 1, cites: ["ckg"],
    steps: [
      "The coherent SI unit of exposure is the coulomb per kilogram.",
      "It is the base unit of this group, so its factor to the base is 1 exactly.",
    ] },
  { id: "U-EXP-02", quantity: "exposure", unit: "R", factor: 2.58e-4, cites: ["r-exact"],
    steps: [
      "NIST SP 811 gives roentgen → coulomb per kilogram as 2.58 E−04 in boldface, that is, exact.",
      "1 R = 2.58 × 10⁻⁴ C/kg.",
      "Factor to base = 2.58 × 10⁻⁴.",
    ] },
  { id: "U-EXP-03", quantity: "exposure", unit: "mR", factor: 2.58e-4 / 1e3, cites: ["r-exact", "prefixes"],
    steps: [
      "1 R = 2.58 × 10⁻⁴ C/kg, and the prefix milli (m) denotes 10⁻³.",
      "1 mR = 10⁻³ × 2.58 × 10⁻⁴ C/kg = 2.58 × 10⁻⁷ C/kg.",
      "Factor to base = 2.58 × 10⁻⁷.",
    ] },
  { id: "U-EXP-04", quantity: "exposure", unit: "µR", factor: 2.58e-4 / 1e6, cites: ["r-exact", "prefixes"],
    steps: [
      "1 R = 2.58 × 10⁻⁴ C/kg, and the prefix micro (µ) denotes 10⁻⁶.",
      "1 µR = 10⁻⁶ × 2.58 × 10⁻⁴ C/kg = 2.58 × 10⁻¹⁰ C/kg.",
      "Factor to base = 2.58 × 10⁻¹⁰.",
    ] },
];

/* ─────────────────────── 5. Surface activity — base Bq/cm² ──────────────────────── */
const SURFACE: UnitCase[] = [
  { id: "U-SUR-01", quantity: "surface", unit: "Bq/cm²", factor: 1, cites: ["bq", "prefixes"],
    steps: [
      "Activity per unit area, with the becquerel over the square centimetre.",
      "It is the base unit of this group, so its factor to the base is 1 exactly.",
    ] },
  { id: "U-SUR-02", quantity: "surface", unit: "Bq/m²", factor: 1 / 1e4, cites: ["prefixes"],
    steps: [
      "The prefix centi (c) denotes 10⁻², so 1 cm = 10⁻² m and 1 m = 10² cm.",
      "Squaring: 1 m² = (10² cm)² = 10⁴ cm².",
      "Spreading 1 Bq over 1 m² is spreading it over 10⁴ cm², so 1 Bq/m² = 10⁻⁴ Bq/cm².",
      "Factor to base = 1 × 10⁻⁴.",
    ] },
  { id: "U-SUR-03", quantity: "surface", unit: "kBq/m²", factor: 1e3 / 1e4, cites: ["prefixes"],
    steps: [
      "1 kBq = 10³ Bq and 1 m² = 10⁴ cm².",
      "1 kBq/m² = 10³ Bq / 10⁴ cm² = 10⁻¹ Bq/cm².",
      "Factor to base = 0.1.",
    ] },
  { id: "U-SUR-04", quantity: "surface", unit: "dpm/100cm²", factor: 1 / (60 * 100), cites: ["bq", "minute"],
    steps: [
      "1 dpm = (1/60) Bq, because 1 min = 60 s and 1 Bq = 1 s⁻¹.",
      "The denominator is 100 cm², so divide again by 100.",
      "1 dpm/100 cm² = (1/60) Bq / 100 cm² = 1/6000 Bq/cm².",
      "Factor to base = 1/6000 ≈ 1.6666667 × 10⁻⁴, the reciprocal of 6000 dpm/100 cm² = 1 Bq/cm².",
    ] },
  { id: "U-SUR-05", quantity: "surface", unit: "dpm/cm²", factor: 1 / 60, cites: ["bq", "minute"],
    steps: [
      "1 dpm = (1/60) Bq, and the denominator is already the square centimetre.",
      "1 dpm/cm² = (1/60) Bq/cm².",
      "Factor to base = 1/60 ≈ 1.6666667 × 10⁻².",
    ] },
  { id: "U-SUR-06", quantity: "surface", unit: "µCi/cm²", factor: 3.7e10 / 1e6, cites: ["ci", "prefixes"],
    steps: [
      "1 µCi = 10⁻⁶ × 3.7 × 10¹⁰ Bq = 3.7 × 10⁴ Bq.",
      "The denominator is already the square centimetre.",
      "1 µCi/cm² = 3.7 × 10⁴ Bq/cm².",
      "Factor to base = 3.7 × 10⁴.",
    ] },
];

/* ──────────────────── 6. Mass concentration — base Bq/g ─────────────────────────── */
const MASS_CONC: UnitCase[] = [
  { id: "U-MAS-01", quantity: "massConc", unit: "Bq/g", factor: 1, cites: ["bq"],
    steps: [
      "Activity per unit mass, with the becquerel over the gram.",
      "It is the base unit of this group, so its factor to the base is 1 exactly.",
    ] },
  { id: "U-MAS-02", quantity: "massConc", unit: "Bq/kg", factor: 1 / 1e3, cites: ["prefixes"],
    steps: [
      "The prefix kilo (k) denotes 10³, so 1 kg = 10³ g.",
      "Spreading 1 Bq over 1 kg is spreading it over 10³ g, so 1 Bq/kg = 10⁻³ Bq/g.",
      "Factor to base = 1 × 10⁻³.",
    ] },
  { id: "U-MAS-03", quantity: "massConc", unit: "kBq/kg", factor: 1e3 / 1e3, cites: ["prefixes"],
    steps: [
      "1 kBq = 10³ Bq and 1 kg = 10³ g.",
      "1 kBq/kg = 10³ Bq / 10³ g = 1 Bq/g. The two prefixes cancel.",
      "Factor to base = 1 exactly.",
    ] },
  { id: "U-MAS-04", quantity: "massConc", unit: "MBq/kg", factor: 1e6 / 1e3, cites: ["prefixes"],
    steps: [
      "1 MBq = 10⁶ Bq and 1 kg = 10³ g.",
      "1 MBq/kg = 10⁶ Bq / 10³ g = 10³ Bq/g.",
      "Factor to base = 1 × 10³.",
    ] },
  { id: "U-MAS-05", quantity: "massConc", unit: "pCi/g", factor: 3.7e10 / 1e12, cites: ["ci", "prefixes"],
    steps: [
      "1 pCi = 10⁻¹² × 3.7 × 10¹⁰ Bq = 3.7 × 10⁻² Bq.",
      "The denominator is already the gram.",
      "1 pCi/g = 0.037 Bq/g, equivalently 37 Bq/kg.",
      "Factor to base = 0.037.",
    ] },
];

/* ──────────────────── 7. Volume concentration — base Bq/L ───────────────────────── */
const VOL_CONC: UnitCase[] = [
  { id: "U-VOL-01", quantity: "volConc", unit: "Bq/L", factor: 1, cites: ["bq", "litre"],
    steps: [
      "Activity per unit volume, with the becquerel over the litre.",
      "It is the base unit of this group, so its factor to the base is 1 exactly.",
    ] },
  { id: "U-VOL-02", quantity: "volConc", unit: "kBq/L", factor: 1e3, cites: ["prefixes"],
    steps: ["The prefix kilo (k) denotes 10³.", "1 kBq/L = 10³ Bq/L.", "Factor to base = 1 × 10³."] },
  { id: "U-VOL-03", quantity: "volConc", unit: "MBq/L", factor: 1e6, cites: ["prefixes"],
    steps: ["The prefix mega (M) denotes 10⁶.", "1 MBq/L = 10⁶ Bq/L.", "Factor to base = 1 × 10⁶."] },
  { id: "U-VOL-04", quantity: "volConc", unit: "Bq/mL", factor: 1e3, cites: ["prefixes", "litre"],
    steps: [
      "The prefix milli (m) denotes 10⁻³, so 1 mL = 10⁻³ L and 1 L = 10³ mL.",
      "Concentrating 1 Bq into 1 mL is 10³ times the concentration of 1 Bq in 1 L.",
      "1 Bq/mL = 10³ Bq/L.",
      "Factor to base = 1 × 10³.",
    ] },
  { id: "U-VOL-05", quantity: "volConc", unit: "Bq/m³", factor: 1e-3, cites: ["litre"],
    steps: [
      "The SI Brochure gives 1 L = 1 dm³ = 10⁻³ m³, so 1 m³ = 10³ L.",
      "Spreading 1 Bq over 1 m³ is spreading it over 10³ L, so 1 Bq/m³ = 10⁻³ Bq/L.",
      "Factor to base = 1 × 10⁻³.",
    ] },
  { id: "U-VOL-06", quantity: "volConc", unit: "pCi/L", factor: 3.7e10 / 1e12, cites: ["ci", "prefixes"],
    steps: [
      "1 pCi = 10⁻¹² × 3.7 × 10¹⁰ Bq = 3.7 × 10⁻² Bq.",
      "The denominator is already the litre.",
      "1 pCi/L = 0.037 Bq/L.",
      "Factor to base = 0.037.",
    ] },
  { id: "U-VOL-07", quantity: "volConc", unit: "µCi/mL", factor: (3.7e10 / 1e6) * 1e3, cites: ["ci", "prefixes", "litre"],
    steps: [
      "1 µCi = 10⁻⁶ × 3.7 × 10¹⁰ Bq = 3.7 × 10⁴ Bq.",
      "1 L = 10³ mL, so a concentration per millilitre is 10³ times the same number per litre.",
      "1 µCi/mL = 3.7 × 10⁴ × 10³ Bq/L = 3.7 × 10⁷ Bq/L = 37 MBq/L.",
      "Factor to base = 3.7 × 10⁷.",
    ] },
];

export const UNIT_CASES: UnitCase[] = [
  ...ACTIVITY, ...DOSE, ...EQUIVALENT, ...EXPOSURE, ...SURFACE, ...MASS_CONC, ...VOL_CONC,
];

/** 군의 기준단위 — 케이스 쪽에서도 알아야 한다(엔진에서 읽지 않는다). */
export const BASE_UNIT: Record<Quantity, string> = {
  activity: "Bq", dose: "Gy", equivalent: "Sv", exposure: "C/kg",
  surface: "Bq/cm²", massConc: "Bq/g", volConc: "Bq/L",
};

/** 군의 화면 이름 — 쪽의 절 제목이 쓴다. */
export const QUANTITY_LABEL: Record<Quantity, string> = {
  activity: "Activity", dose: "Absorbed dose", equivalent: "Dose equivalent",
  exposure: "Exposure", surface: "Surface activity",
  massConc: "Mass concentration", volConc: "Volume concentration",
};

/* ═══════════════════════ 8. 합성 환산 — 끝에서 끝까지 손으로 ═══════════════════════
   위 배수 44개가 맞으면 순서쌍 276개는 따라오지만, **따라온다는 말 자체가 논증**이다.
   그 논증이 실제로 성립하는지 현장에서 자주 쓰는 쌍으로 끝에서 끝까지 확인한다. */
export interface ComposedCase {
  id: string;
  quantity: Quantity;
  value: number;
  from: string;
  to: string;
  /** 손계산의 답 — **리터럴로 적는다**(엔진에서 계산하지 않는다). */
  expect: number;
  steps: string[];
  /** 왜 이 쌍인가. */
  why: string;
}

export const COMPOSED_CASES: ComposedCase[] = [
  { id: "C-01", quantity: "activity", value: 5, from: "µCi", to: "Bq", expect: 1.85e5,
    why: "Sealed check sources are labelled in microcuries and logged in becquerel.",
    steps: ["1 µCi = 3.7 × 10⁴ Bq (U-ACT-08).", "5 µCi = 5 × 3.7 × 10⁴ Bq", "= 1.85 × 10⁵ Bq."] },
  { id: "C-02", quantity: "activity", value: 1, from: "Ci", to: "GBq", expect: 37,
    why: "The single most quoted equivalence in the field.",
    steps: ["1 Ci = 3.7 × 10¹⁰ Bq (U-ACT-06).", "1 GBq = 10⁹ Bq (U-ACT-04).",
            "1 Ci = 3.7 × 10¹⁰ / 10⁹ GBq", "= 37 GBq."] },
  { id: "C-03", quantity: "activity", value: 2.5, from: "kBq", to: "dpm", expect: 1.5e5,
    why: "Counting rooms report in dpm; source certificates are in becquerel.",
    steps: ["2.5 kBq = 2.5 × 10³ Bq = 2500 Bq (U-ACT-02).", "1 dpm = (1/60) Bq (U-ACT-12), so 1 Bq = 60 dpm.",
            "2500 Bq = 2500 × 60 dpm", "= 1.5 × 10⁵ dpm."] },
  { id: "C-04", quantity: "dose", value: 1, from: "Gy", to: "mrad", expect: 1e5,
    why: "Legacy instruments read in millirad while procedures are written in gray.",
    steps: ["1 mrad = 10⁻⁵ Gy (U-ABS-05).", "1 Gy = 1 / 10⁻⁵ mrad", "= 1 × 10⁵ mrad."] },
  { id: "C-05", quantity: "dose", value: 350, from: "mrad", to: "mGy", expect: 3.5,
    why: "A reading taken on an older survey meter, recorded in SI.",
    steps: ["1 mrad = 10⁻⁵ Gy (U-ABS-05).", "350 mrad = 350 × 10⁻⁵ Gy = 3.5 × 10⁻³ Gy.",
            "1 mGy = 10⁻³ Gy (U-ABS-02).", "3.5 × 10⁻³ / 10⁻³ = 3.5 mGy."] },
  { id: "C-06", quantity: "equivalent", value: 1, from: "mSv", to: "mrem", expect: 100,
    why: "Dose records cross this boundary whenever two countries share a worker.",
    steps: ["1 mSv = 10⁻³ Sv (U-EQV-02).", "1 mrem = 10⁻⁵ Sv (U-EQV-05).",
            "1 mSv = 10⁻³ / 10⁻⁵ mrem", "= 100 mrem."] },
  { id: "C-07", quantity: "exposure", value: 15, from: "mR", to: "C/kg", expect: 3.87e-6,
    why: "Ion chamber readings in milliroentgen, reported in SI.",
    steps: ["1 mR = 2.58 × 10⁻⁷ C/kg (U-EXP-03).", "15 mR = 15 × 2.58 × 10⁻⁷ C/kg",
            "= 38.7 × 10⁻⁷ C/kg = 3.87 × 10⁻⁶ C/kg."] },
  { id: "C-08", quantity: "surface", value: 6000, from: "dpm/100cm²", to: "Bq/cm²", expect: 1,
    why: "The equivalence that appears on almost every contamination survey record.",
    steps: ["1 dpm/100 cm² = 1/6000 Bq/cm² (U-SUR-04).", "6000 dpm/100 cm² = 6000 × (1/6000) Bq/cm²",
            "= 1 Bq/cm² exactly."] },
  { id: "C-09", quantity: "surface", value: 1, from: "µCi/cm²", to: "kBq/m²", expect: 3.7e5,
    why: "Crosses both the curie and the area prefix in one step, where two errors can cancel.",
    steps: ["1 µCi/cm² = 3.7 × 10⁴ Bq/cm² (U-SUR-06).", "1 kBq/m² = 0.1 Bq/cm² (U-SUR-03).",
            "3.7 × 10⁴ / 0.1 = 3.7 × 10⁵ kBq/m²."] },
  { id: "C-10", quantity: "massConc", value: 1, from: "pCi/g", to: "Bq/kg", expect: 37,
    why: "Soil and waste clearance levels are quoted in Bq/kg; US data arrive in pCi/g.",
    steps: ["1 pCi/g = 0.037 Bq/g (U-MAS-05).", "1 Bq/kg = 10⁻³ Bq/g (U-MAS-02).",
            "0.037 / 10⁻³ = 37 Bq/kg."] },
  { id: "C-11", quantity: "volConc", value: 5, from: "pCi/L", to: "Bq/L", expect: 0.185,
    why: "A drinking-water figure quoted in pCi/L, the case the tool's own prose warns about.",
    steps: ["1 pCi/L = 0.037 Bq/L (U-VOL-06).", "5 pCi/L = 5 × 0.037 Bq/L", "= 0.185 Bq/L."] },
  { id: "C-12", quantity: "volConc", value: 1, from: "µCi/mL", to: "MBq/L", expect: 37,
    why: "Stock solutions and radiopharmacy vials are labelled this way.",
    steps: ["1 µCi/mL = 3.7 × 10⁷ Bq/L (U-VOL-07).", "1 MBq/L = 10⁶ Bq/L (U-VOL-03).",
            "3.7 × 10⁷ / 10⁶ = 37 MBq/L."] },
];

/* ═══════════════════ 9. 환산이 아닌 단계 — 물리가 들어가는 자리 ═══════════════════
   ★ 여기부터는 **정확값이 아니다.** 위 44개 배수는 전부 정의에서 나왔지만,
     W/e 는 측정에서 나온 값이고 표준불확도 0.2% 를 진다(TRS-398). 합격기준을 따로 둔다. */
export interface BridgeCase {
  id: string;
  kind: "exposureToAirKerma" | "massFromVol" | "volFromMass";
  title: string;
  input: { value: number; from: string; density?: number };
  /** 손계산의 답과 그 단위. */
  expect: number;
  unit: string;
  steps: string[];
  cites: string[];
  /** 이 단계가 정의가 아니라 물리라는 것 — 쪽이 함께 그린다. */
  caveat: string;
}

export const BRIDGE_CASES: BridgeCase[] = [
  { id: "B-01", kind: "exposureToAirKerma", title: "1 R to air kerma",
    input: { value: 1, from: "R" }, expect: 8.76426, unit: "mGy (air)",
    cites: ["r-exact", "wair", "kerma"],
    steps: [
      "1 R = 2.58 × 10⁻⁴ C/kg (U-EXP-02).",
      "Collision air kerma and exposure are related by K_col = X · (W_air/e).",
      "W_air/e for dry air is 33.97 J/C.",
      "K_col = 2.58 × 10⁻⁴ C/kg × 33.97 J/C = 8.76426 × 10⁻³ J/kg",
      "= 8.76426 × 10⁻³ Gy = 8.76426 mGy.",
    ],
    caveat: "Not a unit conversion. W_air/e is a measured constant carrying a standard uncertainty of 0.2%, so this result is not exact in the way the table above is. The product is the collision air kerma; total air kerma is larger by 1/(1 − g), with g the fraction of electron energy lost to bremsstrahlung, which is small but not zero at photon energies of interest." },
  { id: "B-02", kind: "massFromVol", title: "1 Bq/L of water, per kilogram",
    input: { value: 1, from: "Bq/L", density: 1.0 }, expect: 1, unit: "Bq/kg",
    cites: ["litre", "prefixes"],
    steps: [
      "1 L = 10³ mL (U-VOL-04).",
      "At a density of 1.00 g/mL, one litre has a mass of 10³ mL × 1.00 g/mL = 1000 g = 1 kg.",
      "So 1 Bq spread through 1 L is 1 Bq in 1 kg.",
      "= 1 Bq/kg, equivalently 1 × 10⁻³ Bq/g.",
    ],
    caveat: "The numerical equality holds only because water is 1.00 g/mL. It is a coincidence of the material, not a property of the units." },
  { id: "B-03", kind: "massFromVol", title: "5 pCi/L of water, per kilogram",
    input: { value: 5, from: "pCi/L", density: 1.0 }, expect: 0.185, unit: "Bq/kg",
    cites: ["ci", "litre"],
    steps: [
      "5 pCi/L = 0.185 Bq/L (C-11).",
      "At 1.00 g/mL one litre has a mass of 1 kg.",
      "0.185 Bq in 1 kg = 0.185 Bq/kg.",
      "Note what this is not: 5 pCi/L is 0.185 Bq/kg, not 185, and not 0.000185 unless the denominator is the gram.",
    ],
    caveat: "A factor of 1000 hides here whenever the gram is written where the kilogram was meant." },
  { id: "B-04", kind: "massFromVol", title: "A lighter liquid, at 0.80 g/mL",
    input: { value: 1, from: "Bq/L", density: 0.8 }, expect: 1.25, unit: "Bq/kg",
    cites: ["litre"],
    steps: [
      "At 0.80 g/mL, one litre has a mass of 10³ mL × 0.80 g/mL = 800 g = 0.8 kg.",
      "1 Bq in 0.8 kg = 1 / 0.8 Bq/kg",
      "= 1.25 Bq/kg.",
    ],
    caveat: "The same activity per litre is a higher activity per kilogram in a lighter material. Any tool that crosses this boundary with a fixed factor is wrong for everything but water." },
  { id: "B-05", kind: "volFromMass", title: "1 Bq/g of water, per litre",
    input: { value: 1, from: "Bq/g", density: 1.0 }, expect: 1000, unit: "Bq/L",
    cites: ["litre", "prefixes"],
    steps: [
      "1 Bq/g = 10³ Bq/kg (U-MAS-02 read backwards).",
      "At 1.00 g/mL one litre has a mass of 1 kg.",
      "So the activity in one litre is 10³ Bq.",
      "= 1000 Bq/L.",
    ],
    caveat: "The reverse of B-02, through the same density." },
  { id: "B-06", kind: "volFromMass", title: "A denser solid, at 1.20 g/mL",
    input: { value: 1, from: "Bq/g", density: 1.2 }, expect: 1200, unit: "Bq/L",
    cites: ["litre"],
    steps: [
      "At 1.20 g/mL, one litre has a mass of 10³ mL × 1.20 g/mL = 1200 g.",
      "1 Bq/g × 1200 g = 1200 Bq in that litre.",
      "= 1200 Bq/L.",
    ],
    caveat: "Density enters as a multiplication here and as a division in B-04. Reversing the two is the usual way this step is got wrong." },
];

/* ═══════════════════ 10. 거부 동작 — 답하지 않는 것을 확인한다 ═══════════════════
   ★ 「무엇이 맞는가」만 재는 검사는 「무엇을 막아야 하는가」를 못 본다.
     이 도구의 설계 핵심은 **군을 건너지 않는 것**이므로, 건너려 할 때 조용히 0 이나
     그럴듯한 수를 내지 않고 NaN 으로 막는지가 유효성의 일부다. */
export interface RefusalCase {
  id: string;
  kind: "convert" | "density";
  title: string;
  why: string;
  /** kind = "convert" 일 때. */
  call?: { value: number; from: string; to: string; quantity: Quantity };
  /** kind = "density" 일 때. */
  density?: number;
}

export const REFUSAL_CASES: RefusalCase[] = [
  { id: "R-01", kind: "convert", title: "Bq/L asked for as Bq/g",
    call: { value: 1, from: "Bq/L", to: "Bq/g", quantity: "massConc" },
    why: "Per litre and per kilogram are different quantities. An earlier version of this tool answered 1, which was wrong by a factor of 1000 for anything but water, and wrong by 1000 even for water when the gram was meant." },
  { id: "R-02", kind: "convert", title: "pCi/g asked for as pCi/L",
    call: { value: 1, from: "pCi/g", to: "pCi/L", quantity: "volConc" },
    why: "The same refusal in the other direction. Crossing needs a density, which the number does not carry." },
  { id: "R-03", kind: "convert", title: "Gray asked for as sievert",
    call: { value: 1, from: "Gy", to: "Sv", quantity: "equivalent" },
    why: "Absorbed dose to dose equivalent needs a radiation weighting factor, which depends on the radiation type and ranges from 1 to 20. There is no fixed factor to apply." },
  { id: "R-04", kind: "convert", title: "Sievert asked for as gray",
    call: { value: 1, from: "Sv", to: "Gy", quantity: "dose" },
    why: "The reverse is no more defined than the forward direction." },
  { id: "R-05", kind: "convert", title: "Millisievert asked for as becquerel",
    call: { value: 1, from: "mSv", to: "Bq", quantity: "activity" },
    why: "Activity to dose depends on the nuclide, the geometry and the distance. It is a calculation, not a conversion, and a different tool on this site answers it." },
  { id: "R-06", kind: "convert", title: "A unit that does not exist",
    call: { value: 1, from: "nonexistent-unit", to: "Bq", quantity: "activity" },
    why: "An unrecognised unit must not fall through to a silent zero or to the first unit in the group." },
  { id: "R-07", kind: "density", title: "A density of zero", density: 0,
    why: "Dividing by a zero density would yield an infinity that looks like an answer. The step refuses instead." },
];
