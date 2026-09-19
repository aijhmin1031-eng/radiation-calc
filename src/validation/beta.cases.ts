/** ★★★ 베타 계산기의 **유효성 평가 케이스 정본**(2026-09-19).
 *
 *  ★★★ **이 보고서는 앞의 넷과 성격이 다르다 — 그리고 그 차이가 요점이다.**
 *    · 단위환산은 **정의**만으로 서 있어 보고서가 완전할 수 있었다.
 *    · 붕괴·비방사능은 **평가된 측정값** 위에 서 있어, 독립한 평가(DDEP·AME2020)와 대조했다.
 *    · 감마는 **유도량**이라 출력을 맞대지 않고 유도식과 입력을 따로 검증했다.
 *    · 베타는 **경험식** 위에 서 있다. 경험식은 정의도 아니고 평가된 자료도 아니다 —
 *      누군가 측정점에 맞춘 곡선이고, 「맞는가」를 물을 정본이 존재하지 않는다.
 *    그래서 여기서 할 수 있는 것은 셋뿐이고, 할 수 없는 것을 **할 수 없다고 적는 것**이
 *    이 보고서의 절반이다.
 *      ⓐ **구현이 공표된 꼴과 같은가**(형태 충실도)
 *      ⓑ **적합된 범위를 지키는가**(범위 밖에서 답하지 않는가)
 *      ⓒ **독립한 근대 자료와 어떤 관계인가**(잔차를 재되 **다른 양을 섞지 않는다**)
 *
 *  ★★ **층이 셋이고 판정 기준이 셋이다.**
 *    ① **정확** — 무한매질 선량률은 에너지보존에서 바로 나온다. 배정밀도 바닥까지 요구한다.
 *    ② **경험식** — Katz–Penfold 비정 · 질량흡수계수 · 제동복사 수율. 정확도를 주장하지 않고
 *       **실측한 관계**를 싣는다.
 *    ③ **자료** — 핵종별 베타 에너지. 바깥 평가와 대조하지 못했으므로(아래 UNVERIFIED)
 *       **내부 정합**만 전수로 확인한다.
 *
 *  ★★★ **ESTAR 를 쓰되 양을 섞지 않는다 — 감마 Γ 에서 배운 것이다.**
 *    · ESTAR 의 **CSDA 비정**은 전자가 지나간 **경로길이**다.
 *      Katz–Penfold 의 R 은 흡수곡선에서 얻은 **투사비정**(깊이)이라 산란 때문에 늘 짧다.
 *      둘의 비가 NIST 가 정의하는 **우회인자**이고, **항상 1보다 작다.**
 *      그 차이를 「오차」로 적으면 이 보고서 전체가 틀린 말을 하게 된다.
 *    · ESTAR 의 **복사수율**은 **단일에너지 전자**의 값이다. 우리 식은 **베타 스펙트럼**의
 *      어림이라 절대값이 다른 것이 정상이다 — 그래서 **Z 의존성**만 대조한다.
 *
 *  ★ 이 파일은 `engine/` 의 값을 하나도 import 하지 않는다(순환논증 금지).
 *    `estar.json` 은 평가 쪽 자료이고 `scripts/estar.py` 가 NIST 에서 생성한다. */

import estar from "./estar.json" with { type: "json" };

/* ── 합격기준 ───────────────────────────────────────────────────────────── */

/** 에너지보존에서 나오는 것 — 정확한 산술이므로 배정밀도 바닥까지. */
export const TOLERANCE_EXACT = 1e-12;
/** 손계산 — 기대값을 10자리로 끊어 싣는다. */
export const TOLERANCE_WORKED = 1e-9;
/** 자료 내부 정합 — 공표값이 반올림돼 실리므로 그 반올림보다 넉넉히. */
export const TOLERANCE_DATA = 2e-3;

/* ── ① 정확 — 에너지보존 ─────────────────────────────────────────────────── */

export interface DerivationCase {
  id: string; title: string; expect: number; steps: string[];
  /** 코드의 어느 자리인가. ★ 쪽에 그려지는 값이라 영문이다(절대규칙 5). */
  where: string;
  statements?: string[];
}

export const DERIVATION_CASES: DerivationCase[] = [
  { id: "B-U-01", title: "Infinite-medium dose rate from conservation of energy",
    expect: 1, where: "infiniteMediumDoseRate in src/engine/beta.ts",
    statements: ["gy", "bq"],
    steps: [
      "Take a medium uniformly contaminated with a beta emitter, large compared with the beta range in every direction.",
      "Every beta emitted inside it also stops inside it, because the range is short compared with the dimensions. Energy leaving one volume element is balanced by energy arriving from its neighbours.",
      "So the energy deposited per kilogram per second equals the energy emitted per kilogram per second. Nothing about geometry, self-absorption or scattering survives the argument.",
      "A concentration of C becquerel per kilogram emits C betas per second per kilogram, each carrying Ē on average, so the deposited power is C·Ē joule per second per kilogram.",
      "One gray is one joule per kilogram, so the dose rate is C·Ē gray per second, and ×3600 for gray per hour.",
      "This is an exact result, not an approximation. It is the one number on this screen that does not rest on an empirical fit.",
    ] },

  { id: "B-U-02", title: "Megaelectronvolt to joule, and the hour",
    expect: 5.7678358824e-10, where: "the MEV_J * 3600 chain in infiniteMediumDoseRate",
    statements: ["gy"],
    steps: [
      "The energy carried by the betas is tabulated in keV, and the gray is defined in joules per kilogram, so one conversion is needed.",
      "One electronvolt is the work done moving the elementary charge through one volt, so 1 eV = 1.602 176 634 × 10⁻¹⁹ J exactly, the elementary charge being fixed by the SI.",
      "1 MeV = 1.602 176 634 × 10⁻¹³ J, again exactly.",
      "One becquerel per kilogram of an emitter whose mean beta energy is 1 MeV therefore deposits 1.602 176 634 × 10⁻¹³ J/(kg·s) = 1.602 176 634 × 10⁻¹³ Gy/s.",
      "Multiplying by 3600 s/h gives 5.767 835 882 4 × 10⁻¹⁰ Gy/h per (MeV · Bq/kg).",
      "Every dose rate this tool reports is that number times the mean energy in MeV times the concentration.",
    ] },

  { id: "B-U-03", title: "A plane surface receives exactly half",
    expect: 0.5, where: "semiInfiniteSurfaceDoseRate in src/engine/beta.ts",
    steps: [
      "At the surface of a uniformly contaminated half-space, the medium below still supplies its betas, but above there is nothing.",
      "By the same conservation argument applied to the half-space, the dose rate at the interface is exactly half the infinite-medium value.",
      "The factor is 1/2 exactly and it carries no assumption about the beta energy, the nuclide or the material.",
      "The tool reports both, because the two answer different questions: immersion in the medium, and standing on it.",
    ] },

  { id: "B-U-04", title: "What the infinite-medium result does not cover",
    expect: 1, where: "the scope of the dose mode",
    steps: [
      "The derivation needs the medium to be large compared with the beta range in every direction. For water and a 1 MeV endpoint that is a few millimetres, so a bulk sample or a body of water qualifies and a thin film does not.",
      "It gives the dose to the medium, not to skin behind a layer of dead cells, and not to an organ. A skin-dose figure would need a point-kernel integration and a source geometry, which this calculator deliberately does not attempt.",
      "It uses the mean beta energy, so it accounts for the whole spectrum. It does not include the gamma or conversion-electron dose from the same nuclide.",
      "This case carries no arithmetic. It is here so the scope is recorded rather than assumed.",
    ] },
];

export interface IdentityCase {
  id: string; title: string;
  kind: "linearConc" | "linearEnergy" | "surfaceHalf" | "zeroConc" | "additive";
  expect: number; steps: string[];
}

export const IDENTITY_CASES: IdentityCase[] = [
  { id: "B-ID-01", title: "Doubling the concentration doubles the dose rate", kind: "linearConc",
    expect: 2,
    steps: [
      "Ḋ = Ē·C is linear in C, so the ratio is exactly 2 for every nuclide and every energy.",
      "There is no self-shielding term and no saturation: twice the atoms, twice the decays, twice the energy.",
      "Checked at every nuclide in the data set that carries beta data.",
    ] },
  { id: "B-ID-02", title: "Doubling the mean energy doubles the dose rate", kind: "linearEnergy",
    expect: 2,
    steps: [
      "Ḋ = Ē·C is equally linear in Ē.",
      "This is the identity that would break if the conversion chain acquired an extra energy-dependent factor, which is the mistake a spectrum-weighted quantity invites.",
      "The infinite-medium result deliberately has no such factor — that is what makes it exact.",
    ] },
  { id: "B-ID-03", title: "The surface value is half the immersion value", kind: "surfaceHalf",
    expect: 0.5,
    steps: [
      "Checked as an identity across every nuclide rather than at one energy, because a factor written into one code path and not the other would show only on some inputs.",
      "The expected value is exactly 0.5 with no tolerance beyond double precision.",
      "If this ever fails, one of the two functions stopped deriving from the other.",
    ] },
  { id: "B-ID-04", title: "Zero concentration gives zero dose rate", kind: "zeroConc",
    expect: 0,
    steps: [
      "Trivial, and worth pinning: a constant offset added anywhere in the chain would survive every ratio test above and fail only here.",
      "Ratio identities are blind to additive terms. This case is the one that is not.",
      "Exactly zero is required, not merely small.",
    ] },
  { id: "B-ID-05", title: "Concentrations add", kind: "additive",
    expect: 1,
    steps: [
      "Ḋ(C₁ + C₂) = Ḋ(C₁) + Ḋ(C₂), because the relation is linear and homogeneous.",
      "Together with B-ID-04 this fixes the function to a pure proportionality, leaving only the constant to be checked, which B-U-02 derives.",
      "Checked with two unequal concentrations so that a symmetric error would not cancel.",
    ] },
];

/* ── ② 경험식 ────────────────────────────────────────────────────────────── */

export interface FitCase {
  id: string; title: string;
  /** 공표된 꼴 — 쪽에 그대로 그린다. */
  published: string;
  /** 우리 구현 — 같은 것을 말해야 한다. */
  implemented: string;
  /** 적용 범위(있으면). */
  domain: string;
  /** 이 적합에 대해 **우리가 세운 것**과 **세우지 못한 것**. */
  established: string;
  notEstablished: string;
  source: string;
}

export const FIT_CASES: FitCase[] = [
  { id: "B-F-01", title: "Katz–Penfold range, lower branch",
    published: "R = 412 E₀^(1.265 − 0.0954 ln E₀) mg/cm², for aluminium",
    implemented: "0.412 * E ** (1.265 - 0.0954 * Math.log(E)) g/cm²",
    domain: "0.01 MeV up to the branch point",
    established: "The implemented expression is the published form with mg/cm² carried to g/cm², coefficient for coefficient.",
    notEstablished: "The original paper is behind a subscription and was not opened for this report, so the stated accuracy of the fit is not reproduced here. What replaces it is the measured relationship to ESTAR below.",
    source: "katzPenfold" },
  { id: "B-F-02", title: "Katz–Penfold range, upper branch",
    published: "R = 530 E₀ − 106 mg/cm², above the branch point",
    implemented: "0.530 * E - 0.106 g/cm²",
    domain: "above the branch point",
    established: "The implemented expression is the published form. The branch point is taken as 2.5 MeV; the code used 3 MeV until this report, which affected exactly one nuclide in the data set and by 0.687%.",
    notEstablished: "The branch point was not read from the original paper. The evidence for 2.5 MeV is that the two branches come closest there, which is measured in B-F-04 and is consistent with, but not proof of, that value.",
    source: "katzPenfold" },
  { id: "B-F-03", title: "Beta mass absorption coefficient",
    published: "not located",
    implemented: "17 / E ** 1.14 cm²/g",
    domain: "applied over the same range as the range fit",
    established: "Nothing beyond the arithmetic. The transmission it feeds is monotonic in thickness and is cut to zero at the range, which is checked as an identity.",
    notEstablished: "No published source for this expression was located, and the site carried no citation for it. It is reported here as unsourced rather than presented as validated. A user needing a defensible attenuation figure should not rely on it.",
    source: "" },
];

/** 두 가지가 가장 가까워지는 점 — **경계점의 유일한 내부 증거**다.
 *  ★ 두 가지는 실제로 교차하지 않는다(고에너지 가지가 늘 0.57~1.1% 위에 있다).
 *    그러므로 「연속이 되는 점」으로 경계를 정할 수는 없고, **간격이 최소인 점**만 잴 수 있다.
 *    이것은 2.5 MeV 와 **부합하는 증거이지 증명이 아니다** — 쪽에 그렇게 적는다. */
export const BRANCH_CASE = {
  id: "B-F-04",
  title: "Where the two branches come closest",
  /** 실측 결과는 쪽이 다시 잰다. 여기 적는 것은 **만족해야 할 경계**뿐이다. */
  searchFrom: 2.0, searchTo: 3.2,
  /** 최소 간격이 이 근처여야 한다 — 3.0 이면 경계가 옛 값으로 되돌아간 것이다. */
  expectNear: 2.58, expectTolerance: 0.15,
  /** 최소 간격의 크기 — 두 적합이 독립이라 0 이 아니다. */
  gapBelow: 0.01,
  steps: [
    "The two branches were fitted separately, so they do not meet exactly: the upper branch lies above the lower one by between 0.57% and 1.1% across 2 to 3.5 MeV.",
    "A branch point therefore cannot be recovered from continuity. What can be measured is where the gap is smallest.",
    "Scanning from 2.0 to 3.2 MeV locates that minimum, and the report prints the value it finds.",
    "This is evidence consistent with a branch point of 2.5 MeV rather than 3 MeV. It is not proof, and the report says so.",
  ],
} as const;

/* ── ESTAR — 독립한 근대 자료. **양을 섞지 않는다.** ───────────────────────── */

export interface EstarMaterial { matno: string; z: number; estarMaterial: string; rows: number[][] }
/** 재료 → { 재료번호, 화면이 쓰는 Z, ESTAR 재료명, [E MeV, CSDA g/cm², 복사수율] } */
export const ESTAR = estar as unknown as Record<string, EstarMaterial>;

/** 우회인자 대조 — Katz–Penfold(투사비정) ÷ ESTAR(경로길이).
 *  ★★ **이 비는 1보다 작아야 하고, 그것이 결함이 아니라 물리라는 것이 이 케이스의 요지다.** */
export const DETOUR_CASE = {
  id: "B-E-01",
  title: "The range this tool reports against the path length NIST tabulates",
  material: "aluminum",
  fromMeV: 0.01, toMeV: 3,
  /** 비가 1을 넘으면 양을 잘못 짝지은 것이다(우회인자는 항상 1 미만). */
  mustBeBelow: 1,
  /** 중간대에서 대략 이 근처 — 아래로 크게 벗어나면 단위가 어긋난 것이다. */
  midBandFrom: 0.5, midBandTo: 3, midBandAtLeast: 0.6,
  statements: ["estar-csda", "estar-projected"],
  steps: [
    "NIST defines the CSDA range as the average path length travelled by the particle as it slows to rest, and the projected range as the average depth reached along the initial direction.",
    "It defines the detour factor as the ratio of the two, and states that multiple scattering makes it always smaller than unity.",
    "Katz–Penfold's R comes from absorption curves, so it is a depth, not a path length. Comparing it with the CSDA range therefore measures a detour factor and not an error.",
    "The report prints the measured ratio across the fit's range in aluminium. A ratio above 1 would mean the two quantities had been mismatched or a unit dropped, and the case fails in that event.",
    "This is the same trap the gamma report documents for the gamma-ray constant: two numbers with the same name that are not the same quantity.",
  ],
} as const;

/** 제동복사 — **Z 의존성만** 대조한다.
 *  ★ 절대값을 맞대지 않는 이유: ESTAR 는 단일에너지 전자, 우리 식은 베타 스펙트럼이다. */
export interface BremsPair { id: string; heavy: string; light: string; title: string }
export const BREMS_PAIRS: BremsPair[] = [
  { id: "B-E-02", heavy: "water", light: "acrylic", title: "Water against acrylic — two low-Z materials" },
  { id: "B-E-03", heavy: "aluminum", light: "acrylic", title: "Aluminium against acrylic" },
  { id: "B-E-04", heavy: "iron", light: "acrylic", title: "Iron against acrylic" },
  { id: "B-E-05", heavy: "lead", light: "acrylic", title: "Lead against acrylic — the pair the tool's advice rests on" },
];

export const BREMS_CASE = {
  /** 이 에너지들에서 잰다 — ESTAR 격자에 있는 값이어야 한다. */
  energiesMeV: [0.1, 0.5, 1.0, 2.0, 3.0],
  statements: ["estar-yield"],
  /** 저Z 쌍은 Z 비와 맞아야 한다 — 맞지 않으면 대조 자체가 잘못된 것이다. */
  lowZPairTolerance: 0.05,
  steps: [
    "The tool computes the bremsstrahlung fraction as f ≈ 3.5 × 10⁻⁴ · Z · E_max, so the ratio between two materials is exactly the ratio of their atomic numbers, independent of energy.",
    "NIST tabulates the radiation yield, defined as the average fraction of an electron's initial kinetic energy converted to bremsstrahlung. That is the same quantity for a monoenergetic electron.",
    "The absolute values are not compared, because the tool's expression is meant for a beta spectrum whose mean energy is roughly a third of the endpoint, while the NIST value is for a single energy. Comparing them directly would repeat the gamma-constant mistake.",
    "The ratio between two materials at the same energy is free of that difference, so it is the part that can be checked.",
    "The low-Z pair is required to agree within a few percent. If it did not, the comparison itself would be wrong rather than the rule of thumb.",
  ],
} as const;

/* ── ③ 자료 — 내부 정합만 (바깥 평가와 대조하지 못했다) ────────────────────── */

export const DATA_CASES = {
  weightedMean: {
    id: "B-D-01",
    title: "The stored mean beta energy is the intensity-weighted mean of the branches",
    steps: [
      "Each nuclide carries a list of beta branches, each with an endpoint, a mean energy and an intensity, and separately a single stored mean energy that the dose calculation uses.",
      "The stored value must be the intensity-weighted mean of the branch means. That is checkable without any outside source, and it fails loudly if a harvest ever takes the mean from one branch instead of the decay.",
      "Checked for every nuclide carrying beta data.",
    ],
  },
  maxIsMaxBranch: {
    id: "B-D-02",
    title: "The stored endpoint is the highest branch endpoint",
    steps: [
      "The shielding mode computes the range from the stored endpoint, so that value must be the largest endpoint among the branches — shielding for anything less would leave the most penetrating betas unaccounted for.",
      "Checked for every nuclide carrying beta data.",
    ],
  },
  rareBranch: {
    id: "B-D-03",
    title: "Where that endpoint belongs to a rare branch",
    /** 강도가 이보다 작으면 쪽이 이름을 들어 밝힌다. */
    thresholdPct: 2,
    steps: [
      "Using the highest endpoint is the conservative choice for shielding, but it can be a branch almost nobody sees.",
      "Cobalt-60 is the clearest case: its highest endpoint belongs to a branch emitted in about one decay in eight hundred, while more than 99.8% of its betas stop in a fraction of that thickness.",
      "The report names every nuclide where this happens rather than leaving the reader to discover it, because a thickness quoted without it looks like a measurement of the common beta and is not.",
    ],
  },
  meanOverMax: {
    id: "B-D-04",
    title: "The ratio of mean to endpoint energy",
    steps: [
      "For a single allowed beta transition the mean energy is roughly a third of the endpoint, and that is a useful sanity band for a single-branch emitter.",
      "It is not a rule for a multi-branch decay: the stored mean covers the whole decay while the stored endpoint is the highest branch, so the ratio can be far below a third without anything being wrong.",
      "The report prints the distribution rather than asserting a bound, and names the nuclides at the extremes so that the reason is visible.",
    ],
  },
} as const;

/* ── 손계산 ──────────────────────────────────────────────────────────────── */

export interface WorkedCase {
  id: string; title: string; nuclide: string;
  kind: "doseRate" | "surface" | "range" | "rangeCm" | "transmission";
  /** doseRate·surface 는 Bq/kg, range 계열은 g/cm² 또는 밀도. */
  input?: number;
  density?: number;
  expect: number;
  unit: string;
  steps: string[];
}

export const WORKED_CASES: WorkedCase[] = [
  { id: "B-W-01", title: "Strontium-90 at one megabecquerel per kilogram",
    nuclide: "Sr-90", kind: "doseRate", input: 1e6, expect: 1.1287654822e-4, unit: "Gy/h",
    steps: [
      "Ē = 195.7 keV = 0.1957 MeV, the intensity-weighted mean over the branches of the decay.",
      "Each becquerel per kilogram deposits 0.1957 × 1.602 176 634 × 10⁻¹³ = 3.135 460 × 10⁻¹⁴ J/(kg·s).",
      "At 10⁶ Bq/kg that is 3.135 460 × 10⁻⁸ Gy/s.",
      "× 3600 s/h = 1.128 765 482 2 × 10⁻⁴ Gy/h, that is 0.1129 mGy/h.",
      "This is the dose to the medium from the strontium alone. In a real sample the yttrium-90 daughter is in equilibrium and contributes about five times more, which the tool does not add.",
    ] },
  { id: "B-W-02", title: "Yttrium-90 at one megabecquerel per kilogram",
    nuclide: "Y-90", kind: "doseRate", input: 1e6, expect: 5.3774110715e-4, unit: "Gy/h",
    steps: [
      "Ē = 932.31 keV = 0.932 31 MeV.",
      "0.932 31 × 1.602 176 634 × 10⁻¹³ × 10⁶ = 1.493 725 × 10⁻⁷ Gy/s.",
      "× 3600 = 5.377 411 071 5 × 10⁻⁴ Gy/h.",
      "The ratio to strontium-90 at the same concentration is 4.76, which is the ratio of the mean energies and nothing else — the clearest demonstration that this quantity carries no geometry.",
    ] },
  { id: "B-W-03", title: "Tritium at one megabecquerel per kilogram",
    nuclide: "H-3", kind: "doseRate", input: 1e6, expect: 3.2761307812e-6, unit: "Gy/h",
    steps: [
      "Ē = 5.68 keV = 0.005 68 MeV, the lowest in the data set.",
      "0.005 68 × 1.602 176 634 × 10⁻¹³ × 10⁶ × 3600 = 3.276 130 781 2 × 10⁻⁶ Gy/h.",
      "Five orders of magnitude below yttrium-90 at the same activity concentration, from the energy alone.",
      "The infinite-medium condition is easily met for tritium: its range in water is a fraction of a micrometre, so any sample qualifies.",
    ] },
  { id: "B-W-04", title: "Strontium-90 at a plane surface",
    nuclide: "Sr-90", kind: "surface", input: 1e6, expect: 5.6438274110e-5, unit: "Gy/h",
    steps: [
      "The immersion value from B-W-01 is 1.128 765 482 2 × 10⁻⁴ Gy/h.",
      "At the surface of a contaminated half-space exactly half the solid angle is filled with source.",
      "5.643 827 411 0 × 10⁻⁵ Gy/h, that is 0.0564 mGy/h.",
      "The factor is exact, so this case is really a check that the two code paths still derive from one another.",
    ] },
  { id: "B-W-05", title: "Yttrium-90 range, and what that thickness means",
    nuclide: "Y-90", kind: "range", expect: 1.0945234325, unit: "g/cm²",
    steps: [
      "E_max = 2278.5 keV = 2.2785 MeV, below the 2.5 MeV branch point, so the lower branch applies.",
      "The exponent is 1.265 − 0.0954 ln 2.2785 = 1.265 − 0.0954 × 0.823 517 331 7 = 1.186 436 446 6.",
      "R = 0.412 × 2.2785^1.186 436 446 6 = 1.094 523 432 5 g/cm².",
      "In acrylic at 1.19 g/cm³ that is 0.9198 cm; in water, 1.0945 cm; in lead at 11.35 g/cm³, 0.9643 mm.",
      "This is a depth, not a path length: NIST's CSDA range for a 2.2785 MeV electron in aluminium is longer, and the ratio is the detour factor measured in B-E-01.",
    ] },
  { id: "B-W-06", title: "Praseodymium-144 — the nuclide the branch point moved",
    nuclide: "Pr-144", kind: "range", expect: 1.4818800000, unit: "g/cm²",
    steps: [
      "E_max = 2996 keV = 2.996 MeV, above the 2.5 MeV branch point, so the upper branch applies.",
      "R = 0.530 × 2.996 − 0.106 = 1.587 88 − 0.106 = 1.481 88 g/cm².",
      "Until this report the code branched at 3 MeV and so used the lower branch here, returning 1.471 764 g/cm² — 0.687% lower.",
      "It is the only nuclide in the data set between 2.5 and 3 MeV, so it is the only answer the correction changed.",
      "The size of the change is well inside the scatter of the fit itself; the reason for making it is that the code now computes the relation it names.",
    ] },
];

/* ── 거부 ────────────────────────────────────────────────────────────────── */

export interface RefusalCase {
  id: string; title: string;
  kind: "range" | "rangeCm" | "massAbsorption" | "transmission";
  args: [number, number];
  why: string;
}

/** ★★ 이 여섯 중 넷은 **2026-09-19 에 실제로 뚫려 있었다.**
 *  ★★★ 그중 하나가 이 레포에서 처음 보는 유형이다 — **NaN 과의 비교는 언제나 false** 라,
 *    `thicknessGcm2 >= betaRange(E)` 가 비정이 NaN 일 때 「두께가 비정보다 작다」로 읽혀
 *    지수식으로 빠졌다. 그래서 적합 범위 밖에서 **6.4×10⁻¹⁹⁵ 이라는 수**가 나왔다.
 *    **막는 조건을 통과했다고 해서 답이 있는 것이 아니다.** */
export const REFUSAL_CASES: RefusalCase[] = [
  { id: "B-R-01", title: "An energy below the fit's lower limit", kind: "range", args: [0.001, 0],
    why: "The relation was fitted from 0.01 MeV upward. Below that there is no fitted data, and an extrapolated curve returns a number that looks like a measurement." },
  { id: "B-R-02", title: "A negative energy", kind: "range", args: [-1, 0],
    why: "There is no such beta. The logarithm in the exponent would also return a not-a-number in a way that depends on the platform rather than on the physics." },
  { id: "B-R-03", title: "An infinite energy", kind: "range", args: [Infinity, 0],
    why: "The upper branch is linear, so an infinite energy returns an infinite range, which prints as a thickness." },
  { id: "B-R-04", title: "A mass absorption coefficient below the fit's range", kind: "massAbsorption", args: [0.001, 0],
    why: "Before this report this returned 44 715 cm²/g, a value with no physical meaning that then fed the transmission." },
  { id: "B-R-05", title: "Transmission at an energy outside the fit", kind: "transmission", args: [0.001, 0.01],
    why: "The guard compared the thickness against a not-a-number range. Comparisons with a not-a-number are always false, so the guard was skipped and the exponential returned 6.4 × 10⁻¹⁹⁵ — a number, through a check that was supposed to stop it." },
  { id: "B-R-06", title: "A negative absorber thickness", kind: "transmission", args: [1.0, -0.5],
    why: "A negative thickness would make the exponential larger than one, reporting more beta leaving the absorber than entered it." },
];

/* ── 이 보고서가 세우지 못한 것 ──────────────────────────────────────────── */

/** ★★★ **목록으로 둔다 — 산문에 묻으면 읽는 사람이 세지 않는다.**
 *  쪽이 이것을 그대로 표로 그린다. 항목을 지우려면 **실제로 세운 뒤**에 지운다. */
export const UNVERIFIED = [
  { id: "B-N-01", what: "The accuracy claimed for the Katz–Penfold fit",
    why: "The 1952 paper is behind a subscription and was not opened for this report. The site previously said the fit is accurate to roughly 10% and gave no source; that sentence has been removed rather than re-sourced from memory." },
  { id: "B-N-02", what: "The branch point of 2.5 MeV",
    why: "Taken from secondary descriptions of the paper, not from the paper. The internal evidence in B-F-04 is consistent with it but does not establish it. The alternative in the code until this report, 3 MeV, has no evidence at all." },
  { id: "B-N-03", what: "The mass absorption coefficient 17/E^1.14",
    why: "No published source was located for this expression, and the site carried no citation for it. It is used only for the transmission figure in the shielding mode." },
  { id: "B-N-04", what: "The absolute bremsstrahlung fraction",
    why: "Only its dependence on atomic number is checked against NIST, because the tool's expression is for a beta spectrum and the NIST tabulation is for monoenergetic electrons. The two are different quantities and are not compared directly." },
  { id: "B-N-05", what: "The nuclide beta energies against an independent evaluation",
    why: "The endpoints and mean energies come from the same evaluated file as the half-lives. They are checked here only for internal consistency; no second evaluation was brought in, as the decay report does for half-lives." },
] as const;
