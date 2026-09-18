/** ★★★ 비방사능 계산기의 **유효성 평가 케이스 정본**(2026-09-18).
 *
 *  ★★ **이 라운드는 결함을 찾아냈다 — 그것이 이 파일이 있는 이유다.**
 *    그전에는 비방사능을  a = ln2·N_A/(T½·A)  로 계산하며 **질량수 A 를 몰 질량으로** 썼고,
 *    화면·방법론·도구 목록·낱장 다섯 자리가 그 근사를 「모든 핵종에서 0.03% 이내」라고
 *    적고 있었다. AME2020 과 전수 대조하니 **147 중 95 가 0.03% 를 넘었고**, 최악은
 *    H-3 의 **+0.535%** — **주장한 한계의 18배**였다.
 *    ★ 근사의 오차는 우연이 아니라 **핵의 결합에너지**다. 원자질량은 A 에 질량결손 Δ/c² 를
 *      더한 것이고, Δ 는 A≈56(철 부근)에서 가장 음이라 −0.11%, 가벼운 핵에서 크게 양이라
 *      H-3 에서 +0.53% 다. **A 에 가까운 것은 중간 무게의 우연이지 규칙이 아니다.**
 *    ★ **근사의 한계를 다시 적는 것으로 끝내지 않았다 — 근사를 없앴다.** 실제 원자질량을
 *      데이터에 넣었다(`scripts/masses.py`). 0.03% 라는 수가 어디서 왔는지는 끝내 못 찾았다.
 *
 *  ★★ **왜 이 결함이 오래 살아남았나 — 게이트가 스스로를 검증하고 있었다.**
 *    `data.test.ts` 가 「저장된 비방사능이 반감기·질량수와 어긋나지 않는다」를 재고 있었다.
 *    데이터도 `ln2·N_A/(T½·A)` 로 만들고 테스트도 같은 식으로 재니 **영원히 통과한다.**
 *    근사가 0.5% 틀렸다는 것은 **바깥 자료를 들여야만** 보인다. 그것이 유효성 평가다 —
 *    **일관성 검사는 정확성 검사가 아니다.**
 *
 *  ★★ **층이 셋이다.** 섞으면 판정 기준이 안 나온다.
 *    ① **정의·수학** — a = ln2·N_A/(T½·M) 의 유도. 외부 자료가 필요 없고 정확하다.
 *    ② **측정값** — 반감기(DDEP 로 이미 대조했다, `decay.cases.ts`)와 **원자질량**(AME2020).
 *    ③ **환산상수** — N_A 는 SI 정의값, M_u 는 CODATA 측정값(상대 3.1×10⁻¹⁰).
 *
 *  ★★ **독립한 둘째 평가가 없다는 것을 밝힌다.** 반감기는 ENSDF 와 DDEP 라는 **두 평가**가
 *    있어 진짜 대조가 됐지만, 원자질량은 **AME2020 하나**가 사실상 유일한 평가다. 그러니
 *    「두 기관이 같은 값을 냈다」를 주장할 수 없다. 대신 할 수 있는 것을 한다 —
 *    ⓐ 유도를 전부 보이고 ⓑ **AME2020 안의 독립한 두 열**(원자질량 · 질량결손)이 서로
 *    맞는지 재고 ⓒ 옮긴 **원문 줄을 그대로 싣는다**(독자가 직접 대조할 수 있게).
 *    감마 보고서에서 「공개된 Γ 와 비교하지 않는 이유」를 적은 것과 같은 자세다.
 *
 *  ★ 이 파일은 `engine/` 의 값을 하나도 import 하지 않는다(순환논증 금지).
 *    `ame2020.json` 은 **평가 쪽 자료**이고 `scripts/masses.py` 가 원문에서 생성한다. */

import ame2020 from "./ame2020.json" with { type: "json" };

/* ── 합격기준 ───────────────────────────────────────────────────────────── */

/** 정확한 수학·항등식 — 배정밀도 바닥까지 요구한다. */
export const TOLERANCE_IDENTITY = 1e-12;
/** 손계산 케이스 — 기대값을 10자리로 끊어 실으므로(사람이 계산기로 재현할 수 있어야 한다)
 *  그 반올림보다 넉넉한 자리에 둔다. */
export const TOLERANCE_WORKED = 1e-9;
/** 데이터의 몰 질량이 AME2020 과 일치해야 하는 자리 — 옮긴 값이므로 완전일치를 요구한다. */
export const TOLERANCE_MASS = 1e-15;

/* ── ① 정의·유도 ─────────────────────────────────────────────────────────── */

export interface DerivationCase {
  id: string; title: string; expect: number; steps: string[];
  /** 코드의 어느 자리를 말하는가. ★ **쪽에 그려지는 값이므로 영문이다**(절대규칙 5). */
  where: string;
  /** 인용한 원문 — `sources.ts` 의 STATEMENTS id. */
  statements?: string[];
}

export const DERIVATION_CASES: DerivationCase[] = [
  { id: "S-U-01", title: "Specific activity from the definition of the mole and of activity",
    expect: 1, where: "specificActivity in src/engine/decay.ts",
    statements: ["avogadro", "bq"],
    steps: [
      "A sample of mass m grams of a pure nuclide of molar mass M grams per mole holds m/M moles.",
      "One mole holds N_A atoms, so the sample holds N = (m/M)·N_A atoms.",
      "Activity is the expected number of decays per second: A = λ·N, with λ the decay constant.",
      "The half-life fixes λ: after T½ the surviving fraction is e^(−λT½) = 1/2, so λ = ln 2 / T½.",
      "Substituting, A = (ln 2 / T½)·(m/M)·N_A becquerel.",
      "Specific activity is activity per unit mass, a = A/m = ln 2 · N_A / (T½ · M) becquerel per gram.",
      "The mass m cancels, which is the point: specific activity is a property of the nuclide, not of the sample.",
      "This case carries no arithmetic. It is here so that the formula is derived rather than asserted, and so that the two inputs it needs — the half-life and the molar mass — are named explicitly.",
    ] },

  { id: "S-U-02", title: "The molar mass is the atomic mass, not the mass number",
    expect: 1, where: "the m_u field of every nuclide in src/data/nuclides.json",
    statements: ["atomic-mass", "u-definition", "molar-mass-constant"],
    steps: [
      "The mass number A counts nucleons. It is an integer and it is not a mass.",
      "The atomic mass of the neutral atom is A plus the mass excess Δ divided by c², where Δ is negative where the nucleus is tightly bound and positive where it is loosely bound.",
      "Because Δ is largest in magnitude near A = 56, where nuclear binding per nucleon peaks, the difference between the atomic mass and A is not a rounding error with a single bound. It is a physical quantity that changes sign across the chart of nuclides.",
      "Carbon-12 is the one exception by construction: the unified atomic mass unit is defined so that its atomic mass is exactly 12 u, and AME2020 lists it with zero uncertainty.",
      "Converting an atomic mass in u to a molar mass in g/mol uses the molar mass constant M_u = 1.000 000 001 05(31) × 10⁻³ kg/mol. The factor differs from 1 g/mol by 1.05 × 10⁻⁹ relative, which is four orders of magnitude below the six significant figures the calculator prints, so the numerical value in u is used directly as g/mol.",
      "Before 2026-09-18 this calculator used A in place of M and described the substitution as accurate to 0.03%. It is not; see the measured distribution in this report.",
    ] },

  { id: "S-U-03", title: "One unified atomic mass unit in keV, derived from the SI",
    expect: 931494.103717, where: "U_KEV in scripts/masses.py, used to add isomer excitation energy",
    statements: ["molar-mass-constant", "avogadro", "u-energy"],
    steps: [
      "The mass of one atomic mass unit is m_u = M_u / N_A, with M_u the molar mass constant.",
      "Its energy equivalent is m_u·c², and dividing by the elementary charge expresses it in electronvolts.",
      "Both c = 299 792 458 m/s and e = 1.602 176 634 × 10⁻¹⁹ C are exact by definition of the SI, and N_A = 6.022 140 76 × 10²³ /mol is exact as well. Only M_u is measured.",
      "m_u c²/e = (1.000 000 001 05 × 10⁻³ × 299 792 458²) / (6.022 140 76 × 10²³ × 1.602 176 634 × 10⁻¹⁹) eV.",
      "= 9.314 941 037 17 × 10⁸ eV = 931 494.103 717 keV.",
      "CODATA lists 931.494 103 72 MeV. The derivation reproduces the published value to 3.1 × 10⁻¹², which is the rounding of the printed figure, so the chain from the SI definitions is confirmed rather than assumed.",
    ] },

  { id: "S-U-04", title: "An isomer is heavier than its ground state",
    expect: 1, where: "the isomer branch of scripts/masses.py",
    statements: ["isomer-energy"],
    steps: [
      "AME2020 tabulates the ground-state atomic mass. A nuclear isomer is the same nucleus held in an excited state, and that excitation energy is mass.",
      "NUBASE2020 gives the excitation energy E in keV for each isomer, so the isomer's atomic mass is m = m(ground) + E/c², using the conversion derived in S-U-03.",
      "The effect is small. The largest in this data set is U-238m at 2557.9 keV, which is 1.15 × 10⁻⁵ of the atomic mass — roughly one four-hundredth of the mass-number error this report removed.",
      "It is nevertheless two orders of magnitude larger than the AME2020 uncertainties, so it is carried rather than neglected. 36 of the 147 nuclides are isomers.",
    ] },
];

/* ── ② 항등식 — 정확한 수학 ────────────────────────────────────────────────── */

export interface IdentityCase {
  id: string; title: string;
  kind: "roundTrip" | "inverseHalfLife" | "inverseMolarMass" | "linearMass" | "carbon12" | "perGram";
  expect: number; steps: string[];
}

export const IDENTITY_CASES: IdentityCase[] = [
  { id: "S-ID-01", title: "Mass to activity and back returns the starting mass", kind: "roundTrip",
    expect: 1,
    steps: [
      "activityFromMass(m, a) = m·a and massFromActivity(A, a) = A/a are inverse maps for any positive a.",
      "The tool offers both directions on one screen, so a user can walk a value through both. If they did not compose to the identity the two answers would quietly disagree.",
      "Checked for every one of the 147 nuclides, in both orders.",
    ] },
  { id: "S-ID-02", title: "Doubling the half-life halves the specific activity", kind: "inverseHalfLife",
    expect: 0.5,
    steps: [
      "a = ln 2 · N_A / (T½ · M) is inversely proportional to T½ with everything else fixed.",
      "So a(2T½)/a(T½) = 1/2 exactly, independent of the nuclide and of the molar mass.",
      "This is the single most useful sanity check on the tool: a nuclide that lives twice as long is half as hot per gram.",
    ] },
  { id: "S-ID-03", title: "Doubling the molar mass halves the specific activity", kind: "inverseMolarMass",
    expect: 0.5,
    steps: [
      "The same inverse proportionality holds in M, because a gram of a heavier nuclide holds proportionally fewer atoms.",
      "This is the identity the mass-number approximation perturbed: an error of 0.5% in M is an error of 0.5% in the answer, in the opposite direction.",
      "Because the relationship is exactly linear in 1/M, no part of the calculation damps a molar-mass error. Whatever fraction M is wrong by, the answer is wrong by, which is why the input had to be fixed rather than bounded.",
    ] },
  { id: "S-ID-04", title: "Activity is proportional to mass", kind: "linearMass",
    expect: 10,
    steps: [
      "activityFromMass is linear, so ten times the mass is ten times the activity exactly.",
      "There is no self-absorption, no geometry and no dead time in this quantity — it is a count of atoms — and the linearity records that.",
      "The check matters because the screen offers mass in milligrams through kilograms: a unit prefix applied in the wrong place would break linearity across decades while looking right at one of them.",
    ] },
  { id: "S-ID-05", title: "Carbon-12 has an atomic mass of exactly 12", kind: "carbon12",
    expect: 12,
    steps: [
      "The unified atomic mass unit is defined as one twelfth of the mass of a free neutral carbon-12 atom at rest in its ground state.",
      "AME2020 therefore lists carbon-12 as 12 000 000.0 micro-u with an uncertainty of zero.",
      "The extraction in scripts/masses.py reads that value back as exactly 12 and stops if it does not. It is the one row in the table whose value is known in advance, so it tests the reader rather than the data.",
    ] },
  { id: "S-ID-06", title: "The specific activity is the activity of exactly one gram", kind: "perGram",
    expect: 1,
    steps: [
      "activityFromMass(1 g, a) must return a itself, and massFromActivity(a, a) must return 1 g.",
      "Trivial arithmetic, but it pins the unit of the headline figure: the number the screen shows is becquerel per gram, not per kilogram and not per mole.",
      "Per mole would be larger by the molar mass, per kilogram by a thousand. Both are plausible-looking numbers, so the unit is fixed by a case rather than left to the label.",
    ] },
];

/* ── ③ AME2020 원자질량 — 147 핵종 전수 ──────────────────────────────────── */

export interface MassRef {
  nuclide: string;
  /** 질량수 — 그전에 몰 질량으로 쓰이던 값. */
  a: number;
  /** AME2020 바닥상태 원자질량 [u]. */
  mGround_u: number;
  /** 그 표준불확도 [u]. */
  u_u: number;
  /** AME2020 질량결손 [keV] — 원자질량과 **독립한 열**이다. */
  excess_keV: number;
  /** NUBASE2020 들뜬 에너지 [keV] — 이성질체가 아니면 0. */
  exc_keV: number;
  /** 우리가 쓰는 원자질량 [u] = 바닥상태 + 들뜬에너지/c². */
  m_u: number;
  /** 옮긴 AME2020 원문 줄 — 독자가 대조할 자리다. */
  line: string;
  /** 이성질체면 NUBASE2020 원문 줄. */
  excLine: string | null;
}

export const MASS_REFS = ame2020 as unknown as MassRef[];

/** 1 u 의 keV 등가 — **S-U-03 에서 유도한 값**이고, 케이스 쪽에서 다시 유도해 쓴다.
 *  엔진에서 가져오지 않는다(순환논증 금지). */
export const U_KEV = (1.00000000105e-3 * 299792458 ** 2) / (6.02214076e23 * 1.602176634e-19) / 1e3;
/** 아보가드로 상수 — SI 정의값. 인용은 STATEMENTS 의 `avogadro`. */
export const N_A_REF = 6.02214076e23;

/** 질량수 근사가 얼마나 틀렸는지 — **이 라운드의 발견**. 숫자는 여기 적지 않는다.
 *  테스트와 쪽이 `MASS_REFS` 에서 **재어** 내고, 아래는 그 결과가 만족해야 할 경계다.
 *  ★ 왜 경계로 두나: 값을 적어 두면 데이터가 늘 때 낡는다. 「0.03% 이내」가 그렇게 낡았다. */
export const APPROX_BOUNDS = {
  /** 최악의 핵종이 0.4% 보다는 나쁘다 — 「0.03% 이내」가 되살아나면 여기서 걸린다. */
  worstAtLeast: 4e-3,
  /** 0.03% 를 넘는 핵종이 절반을 넘는다. */
  overOldClaimAtLeast: 74,
  /** 최악은 가장 가벼운 핵종이다(결합에너지의 모양). */
  worstNuclide: "H-3",
};

/* ── ④ 손계산 ───────────────────────────────────────────────────────────── */

export interface WorkedCase {
  id: string; title: string; nuclide: string;
  /** 무엇을 계산하는가. */
  kind: "specificActivity" | "massFromActivity" | "activityFromMass";
  /** 입력 — massFromActivity 는 Bq, activityFromMass 는 g. */
  input?: number;
  /** 기대값, 10자리. */
  expect: number;
  unit: string;
  steps: string[];
}

export const WORKED_CASES: WorkedCase[] = [
  { id: "S-W-01", title: "Tritium — the nuclide the old approximation missed by the most",
    nuclide: "H-3", kind: "specificActivity", expect: 3.5598568228e14, unit: "Bq/g",
    steps: [
      "T½ = 388 781 328.006 973 s (12.32 a, from the data set; the half-life itself is checked in the decay report).",
      "M = 3.016 049 281 32 g/mol (AME2020). The mass number is 3, so the substitution M = A would be 0.535% low.",
      "λ = ln 2 / T½ = 0.693 147 180 6 / 388 781 328.007 = 1.782 871 580 1 × 10⁻⁹ /s.",
      "N_A / M = 6.022 140 76 × 10²³ / 3.016 049 281 32 = 1.996 698 × 10²³ atoms per gram.",
      "a = λ · N_A/M = 1.782 871 580 1 × 10⁻⁹ × 1.996 698 × 10²³ = 3.559 856 822 8 × 10¹⁴ Bq/g.",
      "With M = 3 the same arithmetic gives 3.578 9 × 10¹⁴ Bq/g. The commonly published figure for tritium is 3.56 × 10¹⁴ Bq/g, which agrees with the atomic mass and disagrees with the mass number at the precision printed.",
    ] },
  { id: "S-W-02", title: "Cobalt-60 — the mass of one gigabecquerel",
    nuclide: "Co-60", kind: "massFromActivity", input: 1e9, expect: 2.3883787871e-5, unit: "g",
    steps: [
      "T½ = 166 344 192 s (1925.28 d), M = 59.933 815 536 g/mol.",
      "λ = 0.693 147 180 6 / 166 344 192 = 4.166 945 489 5 × 10⁻⁹ /s.",
      "a = λ · N_A / M = 4.166 945 489 5 × 10⁻⁹ × 6.022 140 76 × 10²³ / 59.933 815 536 = 4.186 940 553 1 × 10¹³ Bq/g.",
      "m = A / a = 1 × 10⁹ / 4.186 940 553 1 × 10¹³ = 2.388 378 787 1 × 10⁻⁵ g, that is 23.9 micrograms.",
      "Cobalt-60 sits near A = 56, where the mass excess is most negative, so here the old approximation erred the other way: M = 60 would have made the source lighter by 0.11%.",
    ] },
  { id: "S-W-03", title: "Caesium-137 — the activity of one gram",
    nuclide: "Cs-137", kind: "activityFromMass", input: 1, expect: 3.2120175029e12, unit: "Bq",
    steps: [
      "T½ = 949 232 333.315 727 s (30.08 a), M = 136.907 089 296 g/mol.",
      "λ = 0.693 147 180 6 / 949 232 333.316 = 7.302 186 790 7 × 10⁻¹⁰ /s.",
      "a = 7.302 186 790 7 × 10⁻¹⁰ × 6.022 140 76 × 10²³ / 136.907 089 296 = 3.212 017 502 9 × 10¹² Bq/g.",
      "One gram therefore holds 3.212 × 10¹² Bq, or 86.81 Ci.",
      "This figure is for the caesium alone. Its daughter Ba-137m is in secular equilibrium in a real source and adds its own activity, which this tool does not include — see the refusals below.",
    ] },
  { id: "S-W-04", title: "Uranium-238 — the other end of the range",
    nuclide: "U-238", kind: "specificActivity", expect: 1.2436520396e4, unit: "Bq/g",
    steps: [
      "T½ = 1.409 963 452 544 77 × 10¹⁷ s (4.468 × 10⁹ a), M = 238.050 786 936 g/mol.",
      "λ = 0.693 147 180 6 / 1.409 963 452 5 × 10¹⁷ = 4.916 064 876 1 × 10⁻¹⁸ /s.",
      "a = 4.916 064 876 1 × 10⁻¹⁸ × 6.022 140 76 × 10²³ / 238.050 786 936 = 1.243 652 039 6 × 10⁴ Bq/g.",
      "Twelve thousand becquerel per gram against tritium's 3.6 × 10¹⁴ — eleven orders of magnitude, from the half-life alone.",
      "This case exercises the far end of the floating-point range in the same expression as S-W-01, which is where an arithmetic ordering mistake would show itself.",
    ] },
  { id: "S-W-05", title: "Barium-137m — an isomer, where the excitation energy enters",
    nuclide: "Ba-137m", kind: "specificActivity", expect: 1.9912246323e19, unit: "Bq/g",
    steps: [
      "T½ = 153.12 s. The ground-state atomic mass from AME2020 is 136.905 827 207 u, and NUBASE2020 gives the isomer 661.659 keV of excitation.",
      "661.659 keV / 931 494.103 717 keV·u⁻¹ = 7.103 × 10⁻⁴ u, so M = 136.906 537 527 1 g/mol.",
      "λ = 0.693 147 180 6 / 153.12 = 4.526 823 279 5 × 10⁻³ /s.",
      "a = 4.526 823 279 5 × 10⁻³ × 6.022 140 76 × 10²³ / 136.906 537 527 1 = 1.991 224 632 3 × 10¹⁹ Bq/g.",
      "The excitation shifts the answer by 5 × 10⁻⁶ relative — invisible at six figures, and carried anyway because it is known exactly and costs nothing.",
    ] },
  { id: "S-W-06", title: "Plutonium-239 — one milligram",
    nuclide: "Pu-239", kind: "activityFromMass", input: 1e-3, expect: 2.2950480730e6, unit: "Bq",
    steps: [
      "T½ = 760 837 485 247.413 s (24 110 a), M = 239.052 161 596 g/mol.",
      "λ = 0.693 147 180 6 / 7.608 374 852 474 × 10¹¹ = 9.110 318 5 × 10⁻¹³ /s.",
      "a = 9.110 318 5 × 10⁻¹³ × 6.022 140 76 × 10²³ / 239.052 161 596 = 2.295 048 073 0 × 10⁹ Bq/g.",
      "One milligram is therefore 2.295 × 10⁶ Bq, about 62 µCi.",
      "This is the isotope alone. Weapons- or reactor-grade plutonium is a mixture in which Pu-241 dominates the activity while contributing little of the mass, so the mass of real material holding a given activity is not this number.",
    ] },
];

/* ── ⑤ 거부 — 답이 없는 자리에서 수처럼 생긴 것을 내지 않는다 ─────────────────── */

export interface RefusalCase {
  id: string; title: string;
  kind: "specificActivity" | "massFromActivity" | "activityFromMass";
  args: [number, number];
  why: string;
}

/** ★★ 이 다섯은 **2026-09-18 에 실제로 뚫려 있었다.** 엔진이 T½=0 과 M=0 에서 Infinity 를,
 *  음의 활성도에서 **음의 질량**을 내고 있었다 — 전부 화면에서 수처럼 보인다.
 *  유효성 평가가 「맞는 답이 맞는가」만 묻고 **「틀린 질문에 답하지 않는가」를 안 물으면**
 *  이런 자리는 영원히 안 보인다. */
export const REFUSAL_CASES: RefusalCase[] = [
  { id: "S-R-01", title: "A half-life of zero", kind: "specificActivity", args: [0, 60],
    why: "Nothing has a half-life of zero, and the formula divides by it. Returning infinity would print as a number on the screen and would be the largest specific activity in the table." },
  { id: "S-R-02", title: "A negative half-life", kind: "specificActivity", args: [-1, 60],
    why: "The arithmetic happily returns a negative specific activity, which is meaningless and would flow through to a negative mass." },
  { id: "S-R-03", title: "A molar mass of zero", kind: "specificActivity", args: [1e3, 0],
    why: "A gram of a substance with no molar mass would hold infinitely many atoms. The guard belongs in the engine because the data file is not the only caller." },
  { id: "S-R-04", title: "A negative activity converted to a mass", kind: "massFromActivity", args: [-1e9, 4.2e13],
    why: "Activity counts decays, so it cannot be negative. Before the guard this returned a negative mass, which is the kind of answer that survives a screenshot." },
  { id: "S-R-05", title: "A specific activity of zero", kind: "massFromActivity", args: [1e9, 0],
    why: "A stable nuclide has no specific activity and no finite mass carries a given activity. Infinity is not the answer; there is no answer." },
];
