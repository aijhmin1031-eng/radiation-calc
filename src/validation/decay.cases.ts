/** ★★★ 붕괴 계산기의 **유효성 평가 케이스 정본**(2026-09-17).
 *
 *  ★★ **단위환산과 성격이 다르다.** 환산은 정의만으로 서 있어 보고서가 **완전할** 수 있었다
 *    — 단위가 44개뿐이고 전부 정의에서 나온다. 붕괴는 두 층 위에 서 있다:
 *      ① **수학** — 붕괴법칙 A(t) = A₀·e^(−λt) 와 λ = ln2/T½. 바깥 자료가 필요 없고
 *         **정확한 분수로 손계산**이 된다(반감기 하나 지나면 정확히 1/2).
 *      ② **측정값** — 각 핵종의 반감기. 이것은 정의가 아니라 **평가된 실험값**이라
 *         「몇 % 이내」가 아니라 **불확도의 몇 배 이내**로 판정해야 한다.
 *    두 층을 섞으면 답이 안 나온다. 그래서 이 파일도 층을 갈라 둔다.
 *
 *  ★★ **대조 상대를 고르는 것이 이 보고서의 핵심 판단이다.**
 *    우리 반감기는 IAEA Livechart 가 내주는 **ENSDF** 에서 온다. 그러면 NNDC(BNL)는
 *    대조 상대가 **못 된다** — 같은 ENSDF 를 내주므로 「같은 자료끼리 같다」를 보일 뿐이다.
 *    **DDEP**(Decay Data Evaluation Project, LNE-LNHB 가 관리)는 **별개의 평가**이고
 *    각 값에 표준불확도를 함께 싣는다. 그래서 여기서는 DDEP 를 쓴다.
 *
 *  ★ 이 파일은 `engine/` 의 값을 하나도 import 하지 않는다(순환논증 금지).
 *    지키는 것은 `gate/check-validation.mjs` ②다.
 *
 *  ★ 반감기 값을 **기억으로 적지 않았다** — 24종 전부 LNHB 낱장 PDF 를 열어 옮겼고,
 *    옮긴 원문 줄을 `quoted` 에 함께 싣는다(쪽이 그것을 그려 독자가 대조할 수 있다).
 *    ★★ 자동 추출이 **U-238 을 24.10 d 로 뽑았다** — 낱장에 **딸핵종의 T½ 도 함께** 실려
 *      있어서다(24.10 d 는 Th-234 다). 괄호 안 동위원소가 맞는지 확인한 줄만 썼다.
 *      **자동으로 긁은 기준값은 그 자체로 위험하다.** */

/** 항등식의 합격기준 — 정확한 수학이므로 배정밀도 바닥까지 요구한다. */
export const TOLERANCE_IDENTITY = 1e-12;
/** 손계산 케이스의 합격기준. 기대값을 **10자리로 끊어** 실으므로(사람이 계산기로 재현할 수
 *  있어야 한다) 그 반올림(최대 2.4×10⁻¹⁰)보다 넉넉한 자리에 둔다. */
export const TOLERANCE_WORKED = 1e-9;
/** 반감기 대조의 합격기준 — **DDEP 표준불확도의 몇 배까지**. 계량 관행의 포함인자 k=3 이다.
 *  ★ 「몇 % 이내」로 두면 안 된다: Ni-63 은 DDEP 불확도가 **±2.4%** 라 2% 차이가 정상이고,
 *    Ir-192 는 ±0.018% 라 0.1% 차이면 이상하다. **자를 값마다 그 값의 불확도로 준다.** */
export const SIGMA_LIMIT = 3;

/** 초/해 — 두 규약. 어느 쪽인지가 이 도구에서 실제로 문제가 된다(아래 YEAR_CASE). */
export const YEAR_S = {
  /** 그레고리력 평균년 365.2425 d — 도구의 연 입력이 쓰는 값. */
  gregorian: 365.2425 * 86400,
  /** 율리우스년 365.25 d — 천문·핵자료에서 흔히 쓰는 값. */
  julian: 365.25 * 86400,
} as const;

export const UNIT_S: Record<string, number> = { s: 1, min: 60, h: 3600, d: 86400 };

/* ═══════════════ 1. 항등식 — 바깥 자료 없이 손으로 확인되는 것 ═══════════════
   ★ 이 검사들은 **반감기 값이 무엇이든 성립해야 한다.** 그래서 한 값이 아니라
     17자릿수에 걸친 다섯 값에서 전부 잰다 — 한 값에서만 맞는 것은 항등식이 아니다. */
export const HALF_LIVES_S = [1, 3600, 86400, 1e8, 1e17];

export interface IdentityCase {
  id: string;
  title: string;
  /** 어느 식을 부르는가. */
  kind: "remaining" | "elapsed" | "halfLife" | "lambda" | "multiplicative" | "roundTrip";
  /** 반감기의 몇 배가 지났나 (remaining·multiplicative·roundTrip). */
  halves?: number;
  /** 남은 비율 (elapsed). */
  ratio?: number;
  /** 손계산의 답 — 정확한 값이다. */
  expect: number;
  steps: string[];
}

export const IDENTITY_CASES: IdentityCase[] = [
  { id: "D-ID-01", title: "One half-life leaves one half", kind: "remaining", halves: 1, expect: 0.5,
    steps: [
      "The decay law is A(t) = A₀·e^(−λt), with λ = ln2 / T½.",
      "At t = T½ the exponent is −(ln2 / T½)·T½ = −ln2.",
      "e^(−ln2) = 1/2 exactly, by the definition of the natural logarithm.",
      "A(T½)/A₀ = 1/2. This is what the half-life means, so the tool must reproduce it exactly.",
    ] },
  { id: "D-ID-02", title: "Two half-lives leave a quarter", kind: "remaining", halves: 2, expect: 0.25,
    steps: ["The exponent is −2·ln2.", "e^(−2·ln2) = (e^(−ln2))² = (1/2)² = 1/4.", "A/A₀ = 0.25."] },
  { id: "D-ID-03", title: "Three half-lives leave an eighth", kind: "remaining", halves: 3, expect: 0.125,
    steps: ["e^(−3·ln2) = (1/2)³ = 1/8.", "A/A₀ = 0.125."] },
  { id: "D-ID-04", title: "Ten half-lives leave about a thousandth", kind: "remaining", halves: 10,
    expect: 1 / 1024,
    steps: [
      "e^(−10·ln2) = (1/2)¹⁰ = 1/1024.",
      "A/A₀ = 9.765625 × 10⁻⁴. The rule of thumb that ten half-lives is a factor of a thousand is this number rounded.",
    ] },
  { id: "D-ID-05", title: "No time elapsed leaves everything", kind: "remaining", halves: 0, expect: 1,
    steps: ["e⁰ = 1.", "A(0)/A₀ = 1 exactly. A calculator that drifts here has a bug in the exponent."] },
  { id: "D-ID-06", title: "Half of a half-life leaves one over root two", kind: "remaining", halves: 0.5,
    expect: Math.SQRT1_2,
    steps: [
      "e^(−0.5·ln2) = (1/2)^(1/2) = 1/√2.",
      "A/A₀ = 0.7071067812. The curve is not a straight line: half the time does not leave three quarters.",
    ] },
  { id: "D-ID-07", title: "log₂10 half-lives leave exactly one tenth", kind: "remaining",
    halves: Math.log2(10), expect: 0.1,
    steps: [
      "Take t = T½·log₂10, that is 3.321928095 half-lives.",
      "The exponent is −ln2·log₂10 = −ln10.",
      "e^(−ln10) = 1/10 exactly.",
      "A/A₀ = 0.1. This is the decade the field calls 'about three and a third half-lives'.",
    ] },
  { id: "D-ID-08", title: "The decay constant times the half-life is ln2", kind: "lambda",
    expect: Math.LN2,
    steps: [
      "λ is defined as ln2 / T½.",
      "So λ·T½ = ln2 = 0.6931471806, whatever the half-life is.",
      "Checked across half-lives spanning seventeen orders of magnitude.",
    ] },
  { id: "D-ID-09", title: "The time to fall to one half is one half-life", kind: "elapsed", ratio: 0.5,
    expect: 1,
    steps: [
      "The inverse is t = −ln(A/A₀)/λ.",
      "With A/A₀ = 1/2: t = −ln(1/2)·T½/ln2 = ln2·T½/ln2 = T½.",
      "The answer is exactly one half-life — the forward and inverse forms must agree here or one of them is wrong.",
    ] },
  { id: "D-ID-10", title: "The time to fall to one tenth is log₂10 half-lives", kind: "elapsed",
    ratio: 0.1, expect: Math.log2(10),
    steps: [
      "t = −ln(0.1)·T½/ln2 = ln10·T½/ln2 = T½·log₂10.",
      "That is 3.321928095 half-lives, the inverse of D-ID-07.",
    ] },
  { id: "D-ID-11", title: "A halving over a measured interval returns that interval", kind: "halfLife",
    halves: 1, expect: 1,
    steps: [
      "The two-point form is T½ = ln2·t / ln(A₀/A₁).",
      "If the second reading is exactly half the first, ln(A₀/A₁) = ln2.",
      "T½ = ln2·t/ln2 = t. The half-life is the interval itself.",
    ] },
  { id: "D-ID-12", title: "A fall by 1024 over an interval returns a tenth of it", kind: "halfLife",
    halves: 10, expect: 0.1,
    steps: [
      "If A₁ = A₀/1024 then ln(A₀/A₁) = ln1024 = 10·ln2.",
      "T½ = ln2·t/(10·ln2) = t/10.",
      "Ten half-lives fitted into the interval, so each is a tenth of it.",
    ] },
  { id: "D-ID-13", title: "Decay over two intervals is the product of the two", kind: "multiplicative",
    halves: 1.7, expect: 1,
    steps: [
      "e^(−λ(t₁+t₂)) = e^(−λt₁)·e^(−λt₂), because the exponential turns addition into multiplication.",
      "So decaying for t₁ and then for t₂ must give the same answer as decaying once for t₁+t₂.",
      "The ratio of the two ways is 1. A calculator that accumulates an error per step fails here and nowhere else.",
    ] },
  { id: "D-ID-14", title: "Forward and inverse round-trip", kind: "roundTrip", halves: 2.7, expect: 1,
    steps: [
      "Decay for t, then ask the inverse how long that took.",
      "elapsed(A(t)/A₀) must return t. The ratio of the two is 1.",
      "This is the pair of functions the 'how much is left' and 'when does it reach' modes use.",
    ] },
];

/* ═══════════════ 2. 반감기 — 독립 평가와의 대조 ═══════════════
   ★★ **여기는 「맞다/틀리다」가 아니라 「두 평가가 얼마나 벌어지는가」다.** 반감기는 정의가
     아니라 측정값이고, 평가 기관마다 채택하는 실험 묶음이 달라 값이 조금씩 다르다.
     그래서 각 값에 DDEP 가 실은 **표준불확도**를 함께 두고, 차이를 그 불확도로 나눈
     배수(σ)로 판정한다.
   ★ `quoted` 는 LNHB 낱장에서 **그대로 옮긴 줄**이다(쉼표가 소수점이고 `a` 는 해다).
     독자가 원문과 눈으로 대조할 수 있게 쪽이 이것을 함께 그린다. */
export interface HalfLifeRef {
  id: string;
  nuclide: string;
  /** DDEP 권고값. */
  value: number;
  /** DDEP 표준불확도 — 원문의 괄호 표기를 풀어 쓴 것. */
  unc: number;
  /** 원문의 단위. `a` 는 해다. */
  unit: "a" | "d" | "h" | "min" | "s";
  /** 원문에서 그대로 옮긴 줄. */
  quoted: string;
}

export const HALFLIFE_REFS: HalfLifeRef[] = [
  { id: "D-HL-01", nuclide: "Co-60",
    value: 5.2711, unc: 0.0008, unit: "a",
    quoted: "T1/2(60Co ) : 5,2711 (8) a" },
  { id: "D-HL-02", nuclide: "Cs-137",
    value: 30.018, unc: 0.022, unit: "a",
    quoted: "T1/2(137Cs ) : 30,018 (22) a" },
  { id: "D-HL-03", nuclide: "I-131",
    value: 8.0233, unc: 0.0019, unit: "d",
    quoted: "T1/2(131I ) : 8,0233 (19) d" },
  { id: "D-HL-04", nuclide: "Ir-192",
    value: 73.827, unc: 0.013, unit: "d",
    quoted: "T1/2(192Ir ) : 73,827 (13) d" },
  { id: "D-HL-05", nuclide: "Mo-99",
    value: 2.7479, unc: 0.0006, unit: "d",
    quoted: "T1/2(99Mo ) : 2,7479 (6) d" },
  { id: "D-HL-06", nuclide: "Tc-99m",
    value: 6.0067, unc: 0.001, unit: "h",
    quoted: "T1/2(99mTc ) : 6,0067 (10) h" },
  { id: "D-HL-07", nuclide: "F-18",
    value: 1.8289, unc: 0.00023, unit: "h",
    quoted: "T1/2(18F ) : 1,82890 (23) h" },
  { id: "D-HL-08", nuclide: "Ga-67",
    value: 3.2613, unc: 0.0005, unit: "d",
    quoted: "T1/2(67Ga ) : 3,2613 (5) d" },
  { id: "D-HL-09", nuclide: "Tl-201",
    value: 3.0421, unc: 0.0017, unit: "d",
    quoted: "T1/2(201Tl ) : 3,0421 (17) d" },
  { id: "D-HL-10", nuclide: "I-125",
    value: 59.388, unc: 0.028, unit: "d",
    quoted: "T1/2(125I ) : 59,388 (28) d" },
  { id: "D-HL-11", nuclide: "Se-75",
    value: 119.781, unc: 0.024, unit: "d",
    quoted: "T1/2(75Se ) : 119,781 (24) d" },
  { id: "D-HL-12", nuclide: "P-32",
    value: 14.273, unc: 0.007, unit: "d",
    quoted: "T1/2(32P ) : 14,273 (7) d" },
  { id: "D-HL-13", nuclide: "Sr-90",
    value: 28.8, unc: 0.07, unit: "a",
    quoted: "T1/2(90Sr ) : 28,80 (7) a" },
  { id: "D-HL-14", nuclide: "H-3",
    value: 12.312, unc: 0.025, unit: "a",
    quoted: "T1/2(3H ) : 12,312 (25) a" },
  { id: "D-HL-15", nuclide: "Na-22",
    value: 2.6029, unc: 0.0008, unit: "a",
    quoted: "T1/2(22Na ) : 2,6029 (8) a" },
  { id: "D-HL-16", nuclide: "Cs-134",
    value: 2.0644, unc: 0.0014, unit: "a",
    quoted: "T1/2(134Cs ) : 2,0644 (14) a" },
  { id: "D-HL-17", nuclide: "Eu-152",
    value: 13.522, unc: 0.016, unit: "a",
    quoted: "T1/2(152Eu ) : 13,522 (16) a" },
  { id: "D-HL-18", nuclide: "Kr-85",
    value: 10.752, unc: 0.023, unit: "a",
    quoted: "T1/2(85Kr ) : 10,752 (23) a" },
  { id: "D-HL-19", nuclide: "Ni-63",
    value: 98.7, unc: 2.4, unit: "a",
    quoted: "T1/2(63Ni ) : 98,7 (24) a" },
  { id: "D-HL-20", nuclide: "C-14",
    value: 5700, unc: 30, unit: "a",
    quoted: "T1/2(14C ) : 5700 (30) a" },
  { id: "D-HL-21", nuclide: "Am-241",
    value: 432.6, unc: 0.6, unit: "a",
    quoted: "T1/2(241Am ) : 432,6 (6) a" },
  { id: "D-HL-22", nuclide: "Pu-239",
    value: 24100, unc: 11, unit: "a",
    quoted: "T1/2(239Pu ) : 24100 (11) a" },
  { id: "D-HL-23", nuclide: "Ra-226",
    value: 1600, unc: 7, unit: "a",
    quoted: "T1/2(226Ra ) : 1600 (7) a" },
  { id: "D-HL-24", nuclide: "U-238",
    value: 4.468e9, unc: 5e6, unit: "a",
    quoted: "T1/2(238U ) : 4,468 (5) 10^9 a" },
];

/** DDEP 값을 초로 — **원문의 수에 대한 산술뿐**이다(엔진을 부르지 않는다).
 *  @param year 해의 규약. 기본은 자료 원천이 실제로 쓰는 그레고리력 평균년이다(아래 YEAR_CASE). */
export const refSeconds = (r: HalfLifeRef, year: number = YEAR_S.gregorian) =>
  r.value * (r.unit === "a" ? year : UNIT_S[r.unit]);
export const refUncSeconds = (r: HalfLifeRef, year: number = YEAR_S.gregorian) =>
  r.unc * (r.unit === "a" ? year : UNIT_S[r.unit]);

/** ★★ **해가 두 가지라는 것이 이 도구에서 실제로 문제가 된다.**
 *  자료는 초로 들어오지만 DDEP 는 해로 적고, 화면의 시간 입력에도 「years」가 있다.
 *  둘이 다른 해를 쓰면 답이 0.002% 씩 어긋난 채 조용히 지나간다.
 *  ★ 어느 쪽인지는 **잴 수 있다**: 두 평가가 같은 수를 싣는 핵종(Am-241·Ra-226·C-14·U-238)에서
 *    남는 차이가 곧 해 규약의 차이다. 실측하면 율리우스년으로 0.0021%, 그레고리력으로 0.0001%
 *    미만 — 자료의 초는 **그레고리력 평균년**으로 만들어졌다. 도구의 연 입력도 같은 값을 쓴다. */
export const YEAR_CASE = {
  id: "D-YR-01",
  title: "The year the data uses and the year the tool offers are the same year",
  /** 두 평가가 같은 값을 싣는 핵종 — 남는 차이가 해 규약의 차이다. */
  nuclides: ["Am-241", "Ra-226", "C-14", "U-238"],
  /** 그레고리력으로 대조했을 때 넘지 않아야 할 상대차. */
  tolerance: 1e-5,
  steps: [
    "Pick the nuclides where the two evaluations quote the same number of years, so that no evaluation difference is left.",
    "Convert the DDEP years to seconds twice: once with the Julian year of 365.25 d, once with the Gregorian mean year of 365.2425 d.",
    "Compare each with the seconds in this site's data.",
    "The Julian conversion leaves a residual of about 2.1 × 10⁻⁵; the Gregorian conversion leaves less than 10⁻⁶.",
    "The seconds therefore rest on the Gregorian mean year, and the tool's own year input uses the same 365.2425 d. The two agree, which is the point.",
  ],
};

/* ═══════════════ 3. 끝에서 끝까지 — 화면의 세 갈래를 하나씩 ═══════════════
   ★ 여기의 손계산은 **반감기를 주어진 것으로 놓고** 산술만 확인한다. 반감기 자체는 위 2절이
     따로 대조한다 — **두 층을 한 검사에 섞으면 어느 쪽이 틀렸는지 알 수 없다.**
   ★ 기대값은 **10자리로 끊어** 싣는다. 계산기를 든 사람이 그대로 재현할 수 있어야 하기 때문이고,
     그 반올림(최대 2.4×10⁻¹⁰)보다 넉넉한 자리에 합격기준을 둔다(TOLERANCE_WORKED). */
export interface WorkedCase {
  id: string;
  /** 화면의 갈래. */
  mode: "remaining" | "when" | "halflife";
  nuclide: string;
  /** 그 갈래가 받는 입력 — 화면의 칸과 같은 이름이다. */
  input: { a0: number; unit: string; t?: number; tu?: "s" | "min" | "h" | "d" | "y"; target?: number; a1?: number };
  /** 손계산의 답과 그 단위. */
  expect: number;
  expectUnit: string;
  /** ★ 도구가 답 옆에 함께 그리는 **검산용 수치**. 갈래마다 다른 것을 그린다 —
   *  「얼마나 남나」·「언제 닿나」는 **반감기 몇 번**, 「반감기 찾기」는 **자료값과의 차이(%)**.
   *  으뜸 답만 재면 이 자리가 시야 밖이 되는데, 쓰는 사람이 답을 눈으로 검산하는 자리가 여기다. */
  secondary: { kind: "halves" | "diffPct"; expect: number };
  steps: string[];
  why: string;
}

export const WORKED_CASES: WorkedCase[] = [
  { id: "D-W-01", mode: "remaining", nuclide: "Co-60",
    input: { a0: 37, unit: "GBq", t: 5, tu: "y" },
    expect: 19.1717419, expectUnit: "GBq", secondary: { kind: "halves", expect: 0.9485438482 },
    why: "A 1 Ci Co-60 source five years on — the case a radiation safety officer meets on every inventory.",
    steps: [
      "T½(Co-60) = 1.66344192 × 10⁸ s from the data, checked against DDEP in the previous section.",
      "Five years at 365.2425 d is t = 5 × 3.1556952 × 10⁷ = 1.5778476 × 10⁸ s.",
      "t/T½ = 0.9485438482, so slightly less than one half-life has passed.",
      "A = 37 × 2^(−0.9485438482) GBq = 37 × 0.5181551864",
      "= 19.1717419 GBq, that is 51.81551864% of the original.",
    ] },
  { id: "D-W-02", mode: "remaining", nuclide: "Tc-99m",
    input: { a0: 100, unit: "MBq", t: 24, tu: "h" },
    expect: 6.27080404, expectUnit: "MBq", secondary: { kind: "halves", expect: 3.995205753 },
    why: "A generator eluate left overnight. Four half-lives is the shape of a nuclear medicine day.",
    steps: [
      "T½(Tc-99m) = 21625.92 s = 6.0072 h from the data.",
      "t = 24 h = 86400 s, so t/T½ = 3.995205753 half-lives.",
      "A = 100 × 2^(−3.995205753) MBq",
      "= 6.27080404 MBq. Just over a sixteenth is left, as four half-lives implies.",
    ] },
  { id: "D-W-03", mode: "remaining", nuclide: "Ir-192",
    input: { a0: 370, unit: "GBq", t: 90, tu: "d" },
    expect: 158.9410852, expectUnit: "GBq", secondary: { kind: "halves", expect: 1.219033172 },
    why: "An industrial radiography source between exchanges, where the output drives the exposure time.",
    steps: [
      "T½(Ir-192) = 6.3788256 × 10⁶ s = 73.829 d from the data.",
      "t = 90 d = 7.776 × 10⁶ s, so t/T½ = 1.219033172 half-lives.",
      "A = 370 × 2^(−1.219033172) GBq",
      "= 158.9410852 GBq, about 43% of the original.",
    ] },
  { id: "D-W-04", mode: "when", nuclide: "Co-60",
    input: { a0: 37, unit: "GBq", target: 1 },
    expect: 866562310.9, expectUnit: "s", secondary: { kind: "halves", expect: 5.209453366 },
    why: "When does a source fall below a licence threshold — the question that decides a disposal date.",
    steps: [
      "The target ratio is 1/37 = 0.02702702703.",
      "t = −ln(0.02702702703) × T½ / ln2 = ln(37) × T½ / ln2.",
      "ln(37) = 3.610917913, and ln(37)/ln2 = 5.209453366 half-lives.",
      "t = 5.209453366 × 1.66344192 × 10⁸ s",
      "= 8.665623109 × 10⁸ s, that is 27.46026647 years.",
    ] },
  { id: "D-W-05", mode: "when", nuclide: "F-18",
    input: { a0: 1, unit: "GBq", target: 0.001 },
    expect: 65636.64846, expectUnit: "s", secondary: { kind: "halves", expect: 9.965784285 },
    why: "Waiting for a PET dose to fall a thousandfold before it leaves the controlled area.",
    steps: [
      "The target ratio is 10⁻³.",
      "t = ln(1000) × T½ / ln2, and ln(1000)/ln2 = log₂1000 = 9.965784285 half-lives.",
      "This is the decade rule three times over: three decades is 9.97 half-lives, not 10 exactly.",
      "t = 9.965784285 × 6586.2 s",
      "= 65636.64846 s, that is 18.23240235 hours.",
    ] },
  { id: "D-W-06", mode: "halflife", nuclide: "I-131",
    input: { a0: 1000, unit: "MBq", a1: 546.3, t: 7, tu: "d" },
    expect: 693391.3768, expectUnit: "s", secondary: { kind: "diffPct", expect: 0.002033062157 },
    why: "Recovering a half-life from two counts a week apart — the check that catches a leaking or adsorbing source.",
    steps: [
      "The two-point form is T½ = ln2 · t / ln(A₀/A₁).",
      "A₀/A₁ = 1000/546.3 = 1.830496064, and ln of that is 0.6047068137.",
      "t = 7 d = 604800 s.",
      "T½ = 0.6931471806 × 604800 / 0.6047068137",
      "= 693391.3768 s, that is 8.025363157 d.",
      "The number of half-lives in the interval follows: 604800 / 693391.3768 = 0.8722346719.",
      "That figure can be checked against the reading it came from, which is the point of quoting it: 2^(−0.8722346719) = 0.5463, the measured ratio.",
      "The data value is 693377.28 s, so the recovered half-life is 0.002% above it — the agreement is limited by the four digits of the second reading, not by the method.",
    ] },
];

/* ═══════════════ 4. 거부 동작 ═══════════════
   ★ 붕괴 계산에는 **물리적으로 답이 없는 입력**이 있다. 활성도가 늘어난 두 측정값에서
     반감기를 구할 수는 없고, 시작보다 큰 목표에 「언제 닿는가」도 답이 없다.
     그 자리에서 그럴듯한 수가 나오면 쓰는 사람이 그것을 답으로 적는다. */
export interface DecayRefusal {
  id: string;
  kind: "elapsed" | "halfLife";
  title: string;
  why: string;
  /** elapsed: 남은 비율. halfLife: [A₀, A₁, 경과초]. */
  ratio?: number;
  two?: [number, number, number];
}

export const REFUSAL_CASES: DecayRefusal[] = [
  { id: "D-R-01", kind: "elapsed", ratio: 1.5, title: "A target above the starting activity",
    why: "Decay never increases activity, so there is no time at which a pure source reaches a higher value. Ingrowth from a parent can do it, which is a different calculation and a different tool." },
  { id: "D-R-02", kind: "elapsed", ratio: 0, title: "A target of exactly zero",
    why: "Exponential decay never reaches zero. The honest answer is that there is no such time, not a very large number." },
  { id: "D-R-03", kind: "elapsed", ratio: -0.2, title: "A negative target",
    why: "Negative activity has no meaning. The input guard on the screen blocks it as well, but the engine must not answer if it is reached another way." },
  { id: "D-R-04", kind: "halfLife", two: [100, 100, 3600], title: "Two readings that did not change",
    why: "If the activity did not fall, no half-life follows from the pair. Returning an enormous half-life would look like a legitimate long-lived answer." },
  { id: "D-R-05", kind: "halfLife", two: [100, 120, 3600], title: "A second reading larger than the first",
    why: "Growth cannot come from decay. In practice this means a counting error, a geometry change or ingrowth — all worth knowing about, none of them a half-life." },
  { id: "D-R-06", kind: "halfLife", two: [100, 50, 0], title: "Two readings with no time between them",
    why: "Dividing by a zero interval would give an infinity that prints like a number." },
];
