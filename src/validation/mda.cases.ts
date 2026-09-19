/** ★★★ 검출하한 계산기의 **유효성 평가 케이스 정본**(2026-09-19).
 *
 *  ★★ **이번에는 대조 상대가 아주 좋다.** MARSSIM(NUREG-1575 Rev 1)은 미국 NRC·EPA·DOE 가
 *    무상 공개한 확정판이고, **완결된 수치 예제를 본문에 싣는다.** 남이 공표한 예제를
 *    우리 엔진이 재현하는지가 이 보고서의 중심이다 — 유도만 맞고 숫자가 다른 일을 막는다.
 *    · ★ Rev 2 는 초안이고 쪽마다 **「DRAFT FOR PUBLIC COMMENT — DO NOT CITE OR QUOTE」**
 *      가 찍혀 있다. 같은 문장이 들어 있어도 **쓰지 않는다.** 인용은 Rev 1 에서만 한다.
 *
 *  ★★ **층이 셋이다.**
 *    ① **통계** — L_C·L_D 는 푸아송 가정에서 나온다. 정확한 산술이다.
 *    ② **규약** — d′ 표·관찰자 효율 0.5·2단계 스캔은 MARSSIM 이 정한 **관행**이지
 *       자연상수가 아니다. 「맞는가」가 아니라 **「그 관행을 그대로 구현했는가」**를 묻는다.
 *    ③ **환산** — 계수를 활성도로 옮기는 자리. 정의뿐이다.
 *
 *  ★★★ **이 라운드가 찾아낸 것 둘.**
 *    · **d′ = 1.38 의 뜻을 화면이 틀리게 적고 있었다.** 도움말이 「95% 참양성 · **25%**
 *      거짓양성」이라고 했는데 MARSSIM 표 6.5 에서 그 칸은 **60%** 다(25% 칸은 2.32).
 *      1단계 스캔은 **거짓양성을 일부러 많이 허용하고** 2단계가 걸러 내는 설계라,
 *      이 숫자를 잘못 적으면 방법 자체를 오해하게 만든다.
 *    · **MARSSIM 은 L_D 의 상수를 3 으로 쓴다**(Currie 의 2.71 대신, Brodsky 1992).
 *      우리는 k 를 사용자가 고르므로 k² 를 유지하지만, **그 차이와 방향을 쪽이 적는다.**
 *
 *  ★ 이 파일은 `engine/` 의 값을 하나도 import 하지 않는다(순환논증 금지). */

/* ── 합격기준 ───────────────────────────────────────────────────────────── */

/** 정확한 산술 — 배정밀도 바닥까지. */
export const TOLERANCE_EXACT = 1e-12;
/** 손계산 — 기대값을 10자리로 끊어 싣는다. */
export const TOLERANCE_WORKED = 1e-9;
/** ★ **공표 예제는 반올림된 채 실린다.** MARSSIM 은 MDCR 을 표에서 130 cpm 으로 읽어
 *  scan MDC 750 을 낸다 — 반올림하지 않으면 130.92 이고 답은 755.9 다.
 *  그래서 예제 대조는 **1% 자리**로 재고, **차이의 출처를 케이스가 직접 적는다.** */
export const TOLERANCE_PUBLISHED = 1e-2;

/* ── ① 통계 — 유도 ──────────────────────────────────────────────────────── */

export interface DerivationCase {
  id: string; title: string; expect: number; steps: string[];
  /** 코드의 어느 자리인가. ★ 쪽에 그려지는 값이라 영문이다(절대규칙 5). */
  where: string;
  statements?: string[];
}

export const DERIVATION_CASES: DerivationCase[] = [
  { id: "M-U-01", title: "The critical level, and why it is √2 rather than 1",
    expect: 1, where: "criticalLevel in src/engine/mda.ts",
    statements: ["currie-forms", "paired-blanks"],
    steps: [
      "A net result is the sample count minus the background count. Both are Poisson, so the variance of each equals its own mean.",
      "Currie's derivation assumes paired blanks, meaning the sample and the background are counted for the same length of time. MARSSIM states that assumption explicitly.",
      "Under it the two counts have the same expected background B, so the variance of the difference is B + B = 2B and its standard deviation is √(2B).",
      "The critical level is the net count that a background-only measurement exceeds with probability alpha, so L_C = k√(2B) with k the standard normal deviate for alpha.",
      "The factor √2 is the whole content of the case: subtracting a measured background, rather than a known one, costs a factor of √2 in the threshold.",
      "At k = 1.645 this is 2.326√B, which MARSSIM prints rounded as 2.33√B.",
    ] },

  { id: "M-U-02", title: "The detection limit, and why it is not twice the critical level",
    expect: 1, where: "detectionLimit in src/engine/mda.ts",
    statements: ["currie-forms"],
    steps: [
      "The critical level answers a question about a blank. The detection limit answers a different one: what true amount will be seen, with confidence 1 − beta, to exceed that threshold?",
      "A sample containing L_D has variance B + L_D rather than B, because the source contributes its own Poisson noise. That is why L_D is not simply 2·L_C.",
      "Solving L_D = L_C + k√(B + L_D + B) for L_D with alpha = beta gives L_D = k² + 2k√(2B), which is k² + 2L_C.",
      "The k² term is what survives at zero background: even with no background at all, k² counts are needed.",
      "At k = 1.645 that is 2.706 + 4.653√B.",
    ] },

  { id: "M-U-03", title: "MARSSIM writes the constant as 3, not k²",
    expect: 1, where: "the k*k term in detectionLimit",
    statements: ["currie-constant"],
    steps: [
      "MARSSIM prints L_D = 3 + 4.65√B at k = 1.645 and attaches a note: Currie's derivation gave 2.71, but a constant of 3 has since been shown more appropriate and is generally accepted.",
      "This calculator keeps k². The reason is not disagreement: the confidence level is a user choice on this screen, and 3 is a value specific to k = 1.645, whereas k² follows the choice.",
      "The difference is 3 − 2.706 = 0.294 counts, independent of background. As a fraction of L_D it falls as the background rises, and the report measures it across a range.",
      "MARSSIM's value is the larger, so it is the more conservative: this calculator reports a slightly lower detection limit than MARSSIM would, which is the direction a user should know about.",
      "This case carries no arithmetic of its own. It is here so that a deliberate deviation from the standard the tool names is recorded rather than left to be discovered.",
    ] },

  { id: "M-U-04", title: "From counts to activity",
    expect: 1, where: "the denominator in minimumDetectableActivity",
    steps: [
      "L_D is in counts. The MDA is that number of counts expressed as the activity that would produce them.",
      "A source of activity A produces A · y decays per second that yield a detectable emission, of which a fraction ε is counted, over a time t: counts = A · y · ε · t.",
      "So MDA = L_D / (ε · t · y · q), with q the sample size when the answer is wanted per gram or per litre.",
      "Every term in the denominator is a multiplication, so the MDA is inversely proportional to each: halving the efficiency doubles the MDA exactly, and that is checked as an identity.",
      "The count time appears twice — once here and once inside B = bgCps · t — which is why the MDA improves as 1/√t rather than 1/t at high background.",
    ] },
];

/* ── 항등식 ──────────────────────────────────────────────────────────────── */

export interface IdentityCase {
  id: string; title: string;
  kind: "effInverse" | "yieldInverse" | "qtyInverse" | "ldIsLcPlus" | "zeroBg" | "sqrtTime" | "surveyorSqrt";
  expect: number; steps: string[];
}

export const IDENTITY_CASES: IdentityCase[] = [
  { id: "M-ID-01", title: "Halving the efficiency doubles the MDA", kind: "effInverse", expect: 2,
    steps: [
      "The efficiency enters only the denominator, so the relation is exactly inverse.",
      "Nothing about the background changes, so the ratio is 2 with no tolerance beyond double precision.",
      "Checked across a grid of backgrounds and count times.",
    ] },
  { id: "M-ID-02", title: "Halving the yield doubles the MDA", kind: "yieldInverse", expect: 2,
    steps: [
      "The emission probability and the chemical yield multiply into the same denominator as the efficiency.",
      "Keeping them as a separate input matters for reporting, not for the arithmetic: the tool cannot tell a 50% efficient detector from a 50% emission probability.",
      "The identity records that they are interchangeable in the formula, which is a fact a user should know before entering one in place of the other.",
    ] },
  { id: "M-ID-03", title: "Doubling the sample size halves the MDA", kind: "qtyInverse", expect: 0.5,
    steps: [
      "The sample quantity converts an activity into a concentration, so it divides.",
      "This is the one term with no counting statistics behind it — it is pure unit conversion.",
      "A tool that applied it as a multiplication would still pass every other check here, so it gets its own.",
    ] },
  { id: "M-ID-04", title: "The detection limit is the critical level twice, plus k²", kind: "ldIsLcPlus", expect: 1,
    steps: [
      "L_D − 2·L_C must equal k² for every background, which is the structural relation between the two quantities.",
      "It holds at any k, so it is checked at each of the confidence levels the screen offers.",
      "If the two functions ever stopped deriving from one another this is where it shows.",
    ] },
  { id: "M-ID-05", title: "At zero background the critical level vanishes but the detection limit does not", kind: "zeroBg", expect: 1,
    steps: [
      "With B = 0 the threshold L_C is zero: any count at all is above background.",
      "L_D is still k², because the source's own Poisson noise remains. At k = 1.645 that is 2.706 counts.",
      "This is the case that distinguishes the two quantities most sharply, and the one where MARSSIM's constant of 3 differs from k² by the largest fraction.",
    ] },
  { id: "M-ID-06", title: "Four times the count time gives about half the MDA", kind: "sqrtTime", expect: 2,
    steps: [
      "At a background large enough that k² is negligible, L_D grows as √t while the denominator grows as t, so the MDA falls as 1/√t.",
      "The ratio is therefore close to 2 for a fourfold increase, and approaches it **from above** as the background rises: the k² term falls as 1/t, faster than the rest, so it weighs more on the shorter count.",
      "This is the rule of thumb every counting laboratory uses, and it is a consequence of the formula rather than an input to it. The case checks both that the ratio exceeds 2 and that it falls towards 2 as the background rises, which is the shape the derivation predicts.",
    ] },
  { id: "M-ID-07", title: "The surveyor efficiency raises the count rate by 1/√p", kind: "surveyorSqrt", expect: Math.SQRT2,
    steps: [
      "MARSSIM divides the ideal-observer MDCR by √p, so at the conventional p = 0.5 the required count rate rises by √2.",
      "It is a penalty, not a correction: a real surveyor walking with a rate meter does not achieve the ideal observer's performance, so more signal is needed.",
      "Checked at the conventional value and at others, since p is an input on this screen.",
    ] },
];

/* ── ② MARSSIM 의 공표 예제 — **이 보고서의 중심** ─────────────────────────── */

export interface PublishedCase {
  id: string; title: string;
  /** MARSSIM 본문의 위치. */
  locator: string;
  /** 입력 — 원문이 적은 그대로. */
  input: {
    bgCpm: number; intervalS: number; dPrime: number;
    efficiency?: number; surfaceEfficiency?: number; probeAreaCm2?: number; observerEff?: number;
  };
  /** 무엇을 대조하는가. */
  quantity: "mdcr" | "scanMdc";
  /** 원문이 인쇄한 값. */
  published: number;
  unit: string;
  /** 차이가 있으면 **그 출처를 여기 적는다** — 「대충 맞는다」로 넘기지 않는다. */
  note: string;
  steps: string[];
}

export const PUBLISHED_CASES: PublishedCase[] = [
  { id: "M-P-01", title: "First scanning stage at 1,500 cpm background",
    locator: "page 6-41",
    input: { bgCpm: 1500, intervalS: 1, dPrime: 1.38 },
    quantity: "mdcr", published: 414, unit: "cpm",
    note: "Exact. MARSSIM's arithmetic is reproduced digit for digit.",
    steps: [
      "MARSSIM: a source remains under the probe for 1 second, so the average background in the observation interval is b_i = 1500 × (1/60) = 25.",
      "At the first stage a 95% detection rate is required and a 60% false positive rate tolerated, so d′ = 1.38 from Table 6.5.",
      "s_i = d′√(b_i) = 1.38 × 5 = 6.9 net counts in the interval.",
      "MDCR = s_i × (60/i) = 6.9 × 60 = 414 cpm, which is the figure MARSSIM prints.",
    ] },
  { id: "M-P-02", title: "Second scanning stage at the same background",
    locator: "page 6-42",
    input: { bgCpm: 1500, intervalS: 4, dPrime: 2.48 },
    quantity: "mdcr", published: 372, unit: "cpm",
    note: "Exact. Note that MARSSIM's text prints the working as “2.48 × (60/4)”, which is a slip for 24.8 × (60/4); the result it gives, 372, is the correct one.",
    steps: [
      "At the second stage the surveyor pauses over a suspect location, taken as about 4 seconds, so b_i = 1500 × (4/60) = 100.",
      "The performance goal is stricter — still 95% detections, but only 20% false positives — so d′ = 2.48.",
      "s_i = 2.48 × 10 = 24.8 net counts in the interval.",
      "MDCR = 24.8 × (60/4) = 372 cpm.",
      "MARSSIM notes that the first stage is usually the more limiting of the two, and 414 > 372 here, so the first stage governs.",
    ] },
  { id: "M-P-03", title: "Scan MDC for technetium-99 on concrete",
    locator: "page 6-43",
    input: { bgCpm: 300, intervalS: 2, dPrime: 1.38, efficiency: 0.36, surfaceEfficiency: 0.54,
             probeAreaCm2: 126, observerEff: 0.5 },
    quantity: "scanMdc", published: 750, unit: "dpm/100 cm²",
    note: "MARSSIM reads its MDCR from Table 6.6 as 130 cpm, which is the unrounded 130.92 rounded to two figures. Feeding 130 into the same expression reproduces 750 to within a count; carrying the unrounded value through gives 755.9. The residual is MARSSIM's own rounding and not a disagreement.",
    steps: [
      "Background 300 cpm with a 2-second observation interval gives b_i = 300 × (2/60) = 10.",
      "s_i = 1.38 × √10 = 4.3638 net counts, so MDCR = 4.3638 × (60/2) = 130.92 cpm. MARSSIM's Table 6.6 prints 130.",
      "The surveyor efficiency of 0.5 raises it to 130.92/√0.5 = 185.14 cpm.",
      "Scan MDC = 185.14 / (0.36 × 0.54 × 1.26) = 755.9 dpm/100 cm².",
      "MARSSIM prints 750, which is what the same arithmetic gives from its rounded 130 cpm.",
    ] },
];

/** ★ MARSSIM 표 6.5 의 두 칸 — d′ 의 뜻이 무엇인지 굳힌다.
 *  ★★ **화면이 이것을 틀리게 적고 있었다**(「95% / 25%」 → 실제는 「95% / 60%」). */
export const DPRIME_TABLE = [
  { truePositive: 0.95, falsePositive: 0.60, dPrime: 1.38, use: "first scanning stage — MARSSIM's default" },
  { truePositive: 0.95, falsePositive: 0.20, dPrime: 2.48, use: "second stage, the surveyor's pause" },
  { truePositive: 0.95, falsePositive: 0.25, dPrime: 2.32, use: "what 1.38 was wrongly labelled as until this report" },
] as const;

/* ── MARSSIM 상수와의 차이를 **잰다** ────────────────────────────────────── */

/** ★ 값을 적지 않고 **경계**만 둔다 — 적어 두면 낡는다(「0.03% 이내」가 그렇게 낡았다). */
export const CONSTANT_CASE = {
  id: "M-C-01",
  title: "The size of the deviation from MARSSIM's constant",
  /** 이 배경들에서 잰다. */
  backgrounds: [0, 1, 10, 25, 100, 400, 1500, 10000],
  /** 두 상수의 차 — 배경과 무관하게 일정해야 한다. */
  absoluteGap: 3 - 1.645 ** 2,
  /** MARSSIM 쪽이 항상 크다(더 보수적). */
  marssimIsLarger: true,
  /** 배경 0 에서의 상대차가 이보다 크다 — 여기가 최악이다. */
  worstAtLeast: 0.10,
  /** 배경 10000 에서의 상대차가 이보다 작다 — 실무 배경에서는 무시할 수준이다. */
  bestAtMost: 1e-3,
} as const;

/* ── 손계산 ──────────────────────────────────────────────────────────────── */

export interface WorkedCase {
  id: string; title: string;
  kind: "lc" | "ld" | "mda";
  input: { bgCps: number; countTimeS?: number; efficiency?: number; yieldFrac?: number; sampleQty?: number; k?: number };
  expect: number; unit: string;
  steps: string[];
}

export const WORKED_CASES: WorkedCase[] = [
  { id: "M-W-01", title: "Critical level for a 100-count background",
    kind: "lc", input: { bgCps: 1, countTimeS: 100 }, expect: 2.3263813101e1, unit: "counts",
    steps: [
      "1 count per second for 100 seconds gives B = 100 background counts.",
      "L_C = k√(2B) = 1.645 × √200 = 1.645 × 14.142 135 623 7 = 23.263 813 101 counts.",
      "MARSSIM's rounded form 2.33√B gives 23.30, which differs by 0.16% — the rounding of 2.326 to 2.33.",
      "Anything below 23.26 net counts is not a detection at 95% confidence, however much it looks like one.",
    ] },
  { id: "M-W-02", title: "Detection limit for the same background",
    kind: "ld", input: { bgCps: 1, countTimeS: 100 }, expect: 4.9233651202e1, unit: "counts",
    steps: [
      "L_D = k² + 2L_C = 2.706 025 + 46.527 626 202 = 49.233 651 202 counts.",
      "MARSSIM's form with the same √B term is 3 + 46.527 626 = 49.527 626 counts, 0.597% higher.",
      "The gap is the 0.294 counts of M-U-03 and nothing else; both expressions share the 4.653√B term.",
    ] },
  { id: "M-W-03", title: "A minimum detectable activity",
    kind: "mda", input: { bgCps: 1, countTimeS: 100, efficiency: 0.25 }, expect: 1.9693460481e0, unit: "Bq",
    steps: [
      "L_D = 49.233 651 202 counts from M-W-02.",
      "The detector counts 0.25 of the emissions, over 100 seconds, so it registers 25 counts per becquerel.",
      "MDA = 49.233 651 202 / 25 = 1.969 346 048 1 Bq.",
      "Reported without the yield or sample size, this is an activity in the counting geometry, not a concentration.",
    ] },
  { id: "M-W-04", title: "The same measurement per gram, with a 60% emission probability",
    kind: "mda", input: { bgCps: 1, countTimeS: 100, efficiency: 0.25, yieldFrac: 0.6, sampleQty: 2 },
    expect: 1.6411217067e0, unit: "Bq/g",
    steps: [
      "The denominator becomes 0.25 × 100 × 0.6 × 2 = 30 counts per becquerel per gram.",
      "MDA = 49.233 651 202 / 30 = 1.641 121 706 7 Bq/g.",
      "Both extra factors divide, so a user who enters the emission probability as part of the efficiency gets the same answer — which is why the identities check them separately.",
    ] },
  { id: "M-W-05", title: "At 99% confidence instead of 95%",
    kind: "ld", input: { bgCps: 1, countTimeS: 100, k: 2.326 }, expect: 7.1199490922e1, unit: "counts",
    steps: [
      "k = 2.326 is the standard normal deviate for 1% in each tail, which the screen offers as the 99% option.",
      "L_C = 2.326 × √200 = 32.894 607 461 counts.",
      "L_D = k² + 2L_C = 5.410 276 + 65.789 214 922 = 71.199 490 922 counts.",
      "Raising the confidence from 95% to 99% raises the detection limit by 45%, which is the trade a survey plan is really making when it picks a confidence level.",
      "MARSSIM's constant of 3 does not apply here at all: it is a value for k = 1.645.",
    ] },
];

/* ── 거부 ────────────────────────────────────────────────────────────────── */

export interface RefusalCase {
  id: string; title: string;
  kind: "lc" | "ld" | "mda" | "scan";
  /** 인자 묶음 — 테스트와 쪽이 같은 것을 쓴다. */
  args: Record<string, number>;
  why: string;
}

/** ★★ 이 아홉 중 여섯은 **2026-09-19 에 실제로 뚫려 있었다.**
 *  ★ 특히 **관찰자 효율 0 이 Infinity** 를, **효율 1.5 가 답**을 냈다 —
 *    화면의 세 효율은 전부 「분율」이라 1 을 넘을 수 없는데 아무도 막지 않았다. */
export const REFUSAL_CASES: RefusalCase[] = [
  { id: "M-R-01", title: "A negative background", kind: "lc", args: { bgCounts: -5 },
    why: "Counts cannot be negative. The square root would return a not-a-number in a way that depends on the platform rather than on the statistics." },
  { id: "M-R-02", title: "A negative confidence factor", kind: "lc", args: { bgCounts: 100, k: -1.645 },
    why: "Before this report this returned a critical level of −23.26 counts: a detection threshold below zero, which every measurement exceeds." },
  { id: "M-R-03", title: "An infinite background", kind: "ld", args: { bgCounts: Infinity },
    why: "Returned an infinite detection limit, which prints as a number on the screen." },
  { id: "M-R-04", title: "An efficiency above one", kind: "mda", args: { bgCps: 1, countTimeS: 60, efficiency: 1.5 },
    why: "The screen defines the efficiency as counts per emission, so it cannot exceed one. Before this report it was accepted and produced an MDA better than the detector can physically achieve." },
  { id: "M-R-05", title: "A zero count time", kind: "mda", args: { bgCps: 1, countTimeS: 0, efficiency: 0.25 },
    why: "No measurement was made, so there is no detection limit to report." },
  { id: "M-R-06", title: "A negative sample size", kind: "mda", args: { bgCps: 1, countTimeS: 60, efficiency: 0.25, sampleQty: -1 },
    why: "A negative mass or volume has no meaning, and dividing by it would flip the sign of the answer." },
  { id: "M-R-07", title: "A zero surveyor efficiency", kind: "scan",
    args: { bgCps: 5, scanSpeedCmPerS: 5, detectorWidthCm: 10, efficiency: 0.2, observerEff: 0 },
    why: "Before this report this returned infinity. A surveyor who notices nothing has no scan MDC, which is not the same as an infinitely large one." },
  { id: "M-R-08", title: "A surveyor efficiency above one", kind: "scan",
    args: { bgCps: 5, scanSpeedCmPerS: 5, detectorWidthCm: 10, efficiency: 0.2, observerEff: 1.5 },
    why: "The surveyor efficiency is the fraction of the ideal observer's performance achieved, so it cannot exceed one. It was accepted and made the scan MDC better than the ideal observer's." },
  { id: "M-R-09", title: "A zero background for a scan", kind: "scan",
    args: { bgCps: 0, scanSpeedCmPerS: 5, detectorWidthCm: 10, efficiency: 0.2 },
    why: "With no background the minimum detectable net counts collapse to zero and the scan MDC with them. Reporting zero would claim that any activity whatever is detectable while walking, which is false. The formula has no answer here." },
];

/* ── 이 보고서가 세우지 못한 것 ──────────────────────────────────────────── */

export const UNVERIFIED = [
  { id: "M-N-01", what: "Currie's 1968 paper itself",
    why: "It is behind a subscription and was not opened. Its results are cited through MARSSIM's restatement, which is quoted verbatim in this report rather than paraphrased." },
  { id: "M-N-02", what: "The basis for MARSSIM's constant of 3",
    why: "MARSSIM attributes it to Brodsky (1992) without reproducing the argument, and that paper was not obtained. What is established here is the size and direction of the difference from what this calculator computes, not which value is better." },
  { id: "M-N-03", what: "The surveyor efficiency of 0.5",
    why: "MARSSIM presents it as a convention supported by laboratory studies reported in NUREG/CR-6364 and NUREG-1507. Those studies were not examined; the value is implemented as the standard specifies it and is a user input on this screen." },
  { id: "M-N-04", what: "The case of unequal sample and background count times",
    why: "The formulas implemented assume paired blanks, which MARSSIM states means equal count times. MARSSIM notes that a different formulation applies otherwise; this calculator does not offer it, and the screen does not currently say so." },
] as const;
