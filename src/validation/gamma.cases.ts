/** ★★★ 감마 선량률·차폐 계산기의 **유효성 평가 케이스 정본**(2026-09-18).
 *
 *  ★★ **앞선 두 보고서와 또 다르다.**
 *    · 단위환산 — 정의만으로 서 있어 **완전**할 수 있었다.
 *    · 붕괴 — 수학 + 측정값(반감기) 둘. 반감기는 독립 평가와 σ 로 대조했다.
 *    · 감마 — **사슬**이다. 유도식 · 보간 · 방출선 · 감쇠계수 · 빌드업이 줄줄이 엮여 있고,
 *      고리마다 검증 방법이 다르다. 한 고리라도 뭉뚱그리면 전체가 뜻을 잃는다.
 *
 *  ★★★ **왜 「문헌 Γ 와 2% 이내」로 하지 않는가** — 이 보고서의 핵심 판단이다.
 *    ① **양이 다르다.** 우리 Γ 는 **공기커마율상수 Γ_δ** 다. 문헌의 「감마상수」는
 *       조사선량률상수 · 공기커마율상수 · 주변선량당량률상수 Γ_H*(10) 이 뒤섞여 있다.
 *       ORNL/RSIC-45(Unger & Trubey 1981)를 실제로 열어 확인했다 — 그것은
 *       **선량당량**률상수이고, 환산인자가 **유료 규격(ANSI/ANS-6.1.1-1977)의 표**라
 *       우리 레포에 넣을 수도 없다(절대규칙 2). **대조 상대가 못 된다.**
 *    ② **δ 를 안 밝힌 값과의 일치는 우연이다.** 실측: Am-241 은 δ=10↔20 keV 에서
 *       **+684%**, Ir-192 는 **+9.05%** 움직인다(아래 DELTA_CASES).
 *    → 그래서 **출력을 맞대지 않고 ① 유도식과 ② 입력을 각각 검증한다.**
 *      이것이 규약이 엇갈리는 유도량을 다루는 옳은 방법이다.
 *
 *  ★ 이 파일은 `engine/` 의 값을 하나도 import 하지 않는다. */

/** 유도·항등식 — 정확한 수학이므로 배정밀도 바닥까지. */
export const TOLERANCE_EXACT = 1e-12;
/** 손계산 케이스 — 기대값을 10자리로 끊어 싣는다(계산기로 재현 가능해야 한다). */
export const TOLERANCE_WORKED = 1e-9;
/** 방출선 대조 — DDEP 표준불확도의 몇 배까지. 붕괴 보고서와 같은 계량 관행 k=3. */
export const SIGMA_LIMIT = 3;
/** ★★ 표점 재현의 합격기준. **처음에 「정확히 0」으로 걸었다가 검사가 그 주장을 잡았다** —
 *  실측 최대 5.8×10⁻¹⁶ 다. E 가 표점과 같으면 가중치는 정확히 1 이 되지만, 그 뒤의
 *  `log(y0) + (log(y1) − log(y0))` 가 부동소수로 `log(y1)` 과 정확히 같지 않기 때문이다.
 *  ★ 엔진을 고쳐 「정확히」로 만들 수도 있지만(`E === x1` 이면 바로 y1), 재는 것이
 *    10⁻¹⁶ 이라 어떤 답도 바뀌지 않는다. **고치지 않고 사실을 적는다.** */
export const NODE_TOLERANCE = 1e-15;

/* ═══════════ 1. 단위 사슬 — 손으로 완전히 유도된다 ═══════════
   ★ 지금까지 **아무 테스트도 이 인자를 보지 않았다.** 사슬의 맨 밑바닥인데도. */
export interface DerivationCase {
  id: string; title: string; expect: number; steps: string[];
  /** 코드의 어느 자리를 말하는가. ★ **쪽에 그려지는 값이므로 영문이다**(절대규칙 5) —
   *  첫 판에서 한국어로 적었다가 산출물에 새어 나갔다. 주석은 한국어, **값은 영문**이다. */
  where: string;
}

export const DERIVATION_CASES: DerivationCase[] = [
  { id: "G-U-01", title: "The factor that carries Gy/s per Bq to mGy·m²/(GBq·h)",
    expect: 3.6e15, where: "the 3.6e15 in gammaConstant and shieldedDoseRate",
    steps: [
      "A point source of activity A emits A·yᵢ photons of energy Eᵢ per second, isotropically.",
      "At distance d the fluence rate of that line is φ̇ᵢ = A·yᵢ/(4πd²), in units of 1/(m²·s).",
      "The air kerma rate it produces is K̇ᵢ = φ̇ᵢ·Eᵢ·(µen/ρ)air.",
      "Checking the units: [1/(m²·s)]·[J]·[m²/kg] = J/(kg·s) = Gy/s. The expression is dimensionally a dose rate, which is the first thing to establish.",
      "The constant is defined as Γ = K̇·d²/A = Σ Eᵢ·yᵢ·(µen/ρ)ᵢ /(4π), in Gy·m²/(Bq·s).",
      "The interface reports mGy·m²/(GBq·h), so three conversions apply: Gy to mGy is ×10³, per becquerel to per gigabecquerel is ×10⁹, and per second to per hour is ×3600.",
      "10³ × 10⁹ × 3600 = 3.6 × 10¹⁵ exactly.",
    ] },
  { id: "G-U-02", title: "The factor that carries cm²/g to m²/kg",
    expect: 0.1, where: "the muEn * 0.1 in gammaConstant and shieldedDoseRate",
    steps: [
      "The NIST tables give mass energy-absorption coefficients in cm²/g.",
      "1 cm²/g = (10⁻² m)² / (10⁻³ kg) = 10⁻⁴ m² / 10⁻³ kg.",
      "= 10⁻¹ m²/kg, so the multiplier is 0.1 exactly.",
      "Getting this wrong by a factor of ten would move every dose rate on the site by the same factor, and nothing else in the chain would notice.",
    ] },
  { id: "G-U-03", title: "Collision kerma, not total kerma",
    expect: 1, where: "the choice of muEn over muTr",
    steps: [
      "The sum uses µen/ρ, the mass energy-absorption coefficient, not µtr/ρ, the mass energy-transfer coefficient.",
      "µen/ρ = (µtr/ρ)(1 − g), where g is the fraction of the secondary electron energy that goes to bremsstrahlung.",
      "The product therefore yields the collision kerma; total kerma is larger by 1/(1 − g).",
      "In air below a few MeV g is small, so the two are close, but this report records which of them the tool computes rather than leaving it to be assumed.",
      "This case carries no arithmetic; it is here so that the choice is stated and cannot drift unrecorded.",
    ] },
];

/* ═══════════ 2. 항등식 — 감쇠계수가 무엇이든 성립해야 한다 ═══════════ */
export interface IdentityCase {
  id: string; title: string;
  kind: "inverseSquare" | "linearActivity" | "zeroThickness" | "modeNone"
      | "hvl" | "tvl" | "tvlOverHvl" | "buildupZero" | "buildupNoCoeff" | "twoPaths";
  expect: number; steps: string[];
}

export const IDENTITY_CASES: IdentityCase[] = [
  { id: "G-ID-01", title: "Doubling the distance quarters the dose rate", kind: "inverseSquare",
    expect: 0.25,
    steps: [
      "Ḋ = Γ·A/d², so Ḋ(2d)/Ḋ(d) = d²/(2d)² = 1/4.",
      "Exactly a quarter, for any Γ and any activity. This is the one relation a user checks in their head.",
    ] },
  { id: "G-ID-02", title: "The dose rate is proportional to the activity", kind: "linearActivity",
    expect: 2,
    steps: ["Ḋ is linear in A, so doubling the activity doubles the rate.", "The ratio is exactly 2."] },
  { id: "G-ID-03", title: "No shield transmits everything", kind: "zeroThickness",
    expect: 1,
    steps: ["At x = 0 the attenuation factor is e⁰ = 1 for every line.", "The transmission is exactly 1, not approximately."] },
  { id: "G-ID-04", title: "Turning the shield off transmits everything", kind: "modeNone",
    expect: 1,
    steps: ["With the shield mode set to none the attenuation term is skipped entirely.", "Transmission is exactly 1, and must equal the zero-thickness case rather than merely resemble it."] },
  { id: "G-ID-05", title: "One half-value layer transmits one half", kind: "hvl",
    expect: 0.5,
    steps: [
      "The half-value layer is defined by x = ln2/µ.",
      "Then µx = ln2 and the transmission is e^(−ln2) = 1/2 exactly.",
      "This holds whatever µ is, so it tests the exponential rather than the coefficient. The coefficient itself is tested separately against the NIST table.",
    ] },
  { id: "G-ID-06", title: "One tenth-value layer transmits one tenth", kind: "tvl",
    expect: 0.1,
    steps: ["x = ln10/µ gives µx = ln10 and transmission e^(−ln10) = 1/10 exactly."] },
  { id: "G-ID-07", title: "A tenth-value layer is log₂10 half-value layers", kind: "tvlOverHvl",
    expect: Math.log2(10),
    steps: [
      "TVL/HVL = (ln10/µ)/(ln2/µ) = ln10/ln2 = log₂10.",
      "= 3.321928095, independent of material and energy. The rule of thumb 'a TVL is about three and a third HVLs' is this number.",
    ] },
  { id: "G-ID-08", title: "Buildup at zero thickness is unity", kind: "buildupZero",
    expect: 1,
    steps: [
      "The Berger form is B = 1 + a·µx·e^(b·µx).",
      "At µx = 0 the second term vanishes and B = 1 exactly.",
      "A buildup factor below 1 would mean the shield created a deficit of scattered photons, which is not physical.",
    ] },
  { id: "G-ID-10", title: "The two dose-rate code paths agree", kind: "twoPaths",
    expect: 1,
    steps: [
      "The same physics is implemented twice in this engine: once as Γ·A/d² on a precomputed constant, and once inside the shielding routine, which rebuilds the 3.6×10¹⁵/(4π) factor for itself and sums the spectrum again.",
      "The screen uses the second one. A report that exercised only the first would be validating code the user never reaches.",
      "With the shield turned off the two must return the same number, and the ratio must be 1.",
      "They do agree, to better than one part in 10¹⁵. Nothing enforced that before this case existed, which is the reason it exists.",
    ] },
  { id: "G-ID-09", title: "Buildup without coefficients is unity, not zero", kind: "buildupNoCoeff",
    expect: 1,
    steps: [
      "The coefficients for the Berger form are not supplied by this site, because the published tables are inside a standard that cannot be reproduced here.",
      "When they are absent the factor must fall back to 1, which is the narrow-beam result and an underestimate that the interface labels as such.",
      "Falling back to 0 would silently report no dose behind a shield.",
    ] },
];

/* ═══════════ 3. 보간 — 표점에서는 표값이 그대로 나와야 한다 ═══════════
   ★ 보간의 가장 강한 검사다. 표점에서 오차가 0 이 아니면 보간식이 틀린 것이다. */
export interface InterpCase {
  id: string; title: string; material: string; energyMeV: number;
  /** 1 = µ/ρ, 2 = µen/ρ */
  col: 1 | 2;
  expect: number; steps: string[];
}

export const INTERP_CASES: InterpCase[] = [
  { id: "G-IN-01", title: "At a tabulated energy the table value comes back unchanged",
    material: "air", energyMeV: 0.6, col: 2, expect: 0.02953,
    steps: [
      "The air table has a row at 0.6 MeV with µen/ρ = 0.02953 cm²/g.",
      "Asking for exactly that energy must return exactly that number: the interpolation weight is 1 and no arithmetic should intervene.",
      "This is the strongest single check on an interpolator, because it fails for almost any error in the formula.",
    ] },
  { id: "G-IN-02", title: "The same, for a linear attenuation coefficient in lead",
    material: "lead", energyMeV: 1.0, col: 1, expect: 0.07102,
    steps: ["The lead table has a row at 1.0 MeV with µ/ρ = 0.07102 cm²/g.", "It must come back unchanged."] },
  { id: "G-IN-03", title: "Between two rows, the logarithmic interpolation worked by hand",
    material: "air", energyMeV: 0.7, col: 2, expect: 0.02914740761,
    steps: [
      "The bracketing rows are 0.6 MeV with 0.02953 and 0.8 MeV with 0.02882.",
      "The weight is f = (ln0.7 − ln0.6)/(ln0.8 − ln0.6) = 0.5358369345.",
      "µen/ρ = exp(ln0.02953 + f·(ln0.02882 − ln0.02953))",
      "= 0.02914740761 cm²/g.",
      "Linear interpolation would give 0.029175, which differs in the fifth digit here and by far more where the coefficient falls steeply.",
    ] },
  { id: "G-IN-04", title: "The same in lead, where the coefficient falls faster",
    material: "lead", energyMeV: 1.1, col: 1, expect: 0.06549810906,
    steps: [
      "Rows: 1.0 MeV with 0.07102 and 1.25 MeV with 0.05876.",
      "f = (ln1.1 − ln1.0)/(ln1.25 − ln1.0) = 0.4271249572.",
      "µ/ρ = exp(ln0.07102 + f·(ln0.05876 − ln0.07102)) = 0.06549810906 cm²/g.",
    ] },
  { id: "G-IN-05", title: "Below the first row the first value is held",
    material: "air", energyMeV: 0.0005, col: 1, expect: 3606.0,
    steps: [
      "The air table starts at 1 keV with µ/ρ = 3606 cm²/g.",
      "Below that the first value is held rather than extrapolated. Extrapolating a curve this steep would produce nonsense.",
      "No emission line in this site's data lies below 1 keV, so the clamp is a guard rather than a working path.",
    ] },
  { id: "G-IN-06", title: "Above the last row the last value is held",
    material: "air", energyMeV: 25, col: 1, expect: 0.01705,
    steps: ["The table ends at 20 MeV with µ/ρ = 0.01705 cm²/g, and that value is held above it.",
            "The highest line in this site's data is well below 20 MeV."] },
  { id: "G-IN-07", title: "At the lead K-edge, exactly on the edge energy, the lower branch is returned",
    material: "lead", energyMeV: 0.0880045, col: 1, expect: 1.91,
    steps: [
      "The NIST lead table lists 88.0045 keV twice, once with µ/ρ = 1.91 and once with 7.683: the K-shell absorption switches on there and the coefficient is discontinuous.",
      "A function of one variable cannot return two values, so a convention is forced. Asked for exactly the edge energy this implementation returns the lower branch, 1.91.",
      "One step above the edge it returns 7.683, and one step below it interpolates towards 1.91 from the row beneath. Both sides are therefore right; only the single point of discontinuity is a convention.",
      "This is recorded because the source comment claimed the opposite, and a claim that disagrees with the code is worse than no claim. The effect on any dose rate is nil: no emission line in this site's data sits on an edge energy to seven digits.",
    ] },
  { id: "G-IN-08", title: "One step above the edge, the upper branch",
    material: "lead", energyMeV: 0.0880046, col: 1, expect: 7.68297776884886,
    steps: [
      "At 88.0046 keV the bracketing rows are the upper edge row (7.683) and 100 keV (5.549).",
      "The interpolation runs on the upper branch and returns 7.68297776884886, a hair below 7.683.",
      "The discontinuity is therefore resolved within one part in 10⁷ of the edge energy.",
    ] },
];

/* ═══════════ 4. 방출선 — 독립 평가에서 **유도**한다 ═══════════
   ★★ DDEP 는 광자 방출확률을 바로 싣지 않는다. **전이확률 Pγ+ce** 와 **내부전환계수 αT**,
     그리고 1.022 MeV 를 넘는 전이에는 **내부쌍생성계수 απ** 를 싣는다. 광자 방출확률은
        Pγ = Pγ+ce / (1 + αT + απ)
     로 유도해야 한다. **베끼기가 아니라 유도**라 중간에 틀리면 드러난다 — 실제로 드러났다:
     απ 를 빼고 계산했을 때 Co-60 의 1332 keV 가 0.0034% 어긋났고, 넣자 우리 자료와
     **적힌 자릿수까지 일치**했다. 우리 자료와 유도가 **둘 다** 맞아야만 그렇게 떨어진다.
   ★ **읽을 수 없는 낱장은 쓰지 않는다.** Am-241 의 전이표는 「≈」와 빈 확률이 섞여 있어
     안전하게 옮길 수 없다 — **추측하지 않고 뺐다.** 뺀 사실을 쪽이 적는다. */
export interface EmissionRef {
  id: string;
  nuclide: string;
  /** 전이 에너지 [keV] — 원문 표기. */
  energyKeV: number;
  /** 전이확률 Pγ+ce [%] 와 그 표준불확도. */
  pTransition: number;
  uTransition: number;
  /** 내부전환계수 αT. */
  alphaT: number;
  /** 내부쌍생성계수 απ — 1.022 MeV 아래 전이에는 없다(0). */
  alphaPi: number;
  /** 원문에서 그대로 옮긴 줄. */
  quoted: string;
}

export const EMISSION_REFS: EmissionRef[] = [
  { id: "G-EM-01", nuclide: "Cs-137", energyKeV: 661.657,
    pTransition: 94.57, uTransition: 0.26, alphaT: 1.124e-1, alphaPi: 0,
    quoted: "γ2,0(Ba) 661,657 (3)  94,57 (26)  M4  αT = 1,124 (16) ×10⁻¹" },
  { id: "G-EM-02", nuclide: "Co-60", energyKeV: 1332.508,
    pTransition: 99.9988, uTransition: 0.0002, alphaT: 1.28e-4, alphaPi: 3.4e-5,
    quoted: "γ1,0(Ni) 1332,508 (4)  99,9988 (2)  E2  αT = 1,28 (5) ×10⁻⁴  απ = 3,4 (4) ×10⁻⁵" },
  { id: "G-EM-03", nuclide: "Co-60", energyKeV: 1173.240,
    pTransition: 99.85, uTransition: 0.03, alphaT: 1.68e-4, alphaPi: 6.2e-6,
    quoted: "γ3,1(Ni) 1173,240 (3)  99,85 (3)  E2(+M3)  αT = 1,68 (4) ×10⁻⁴  απ = 0,62 (7) ×10⁻⁵" },
  { id: "G-EM-04", nuclide: "Co-60", energyKeV: 826.10,
    pTransition: 0.0076, uTransition: 0.0008, alphaT: 3.4e-4, alphaPi: 0,
    quoted: "γ2,1(Ni) 826,10 (3)  0,0076 (8)  M1+45%E2  αT = 3,4 (4) ×10⁻⁴" },
  { id: "G-EM-05", nuclide: "Co-60", energyKeV: 347.14,
    pTransition: 0.0075, uTransition: 0.0004, alphaT: 55.7e-4, alphaPi: 0,
    quoted: "γ3,2(Ni) 347,14 (7)  0,0075 (4)  [E2]  αT = 55,7 (17) ×10⁻⁴" },
  { id: "G-EM-06", nuclide: "Co-60", energyKeV: 2158.61,
    pTransition: 0.0012, uTransition: 0.0002, alphaT: 0.495e-4, alphaPi: 0,
    quoted: "γ2,0(Ni) 2158,61 (3)  0,0012 (2)  E2  αT = 0,495 (15) ×10⁻⁴" },
  /* ★★ **배율이 낱장마다 다르다 — 머리글을 읽어야 한다.** Cs-137 은 (10⁻¹), Co-60 은 (10⁻⁴),
     그런데 **I-131 은 배율이 없어 절대값**이다(164 keV 는 M4 전이라 αT 가 50 을 넘는다).
     ★ 이 읽기는 **스스로를 확인한다**: 절대값으로 읽으면 유도가 우리 자료와 0.015% 로 맞고,
       10⁻⁴ 로 잘못 읽으면 **50배** 틀어진다. 자릿수가 맞는다는 것이 곧 읽기가 맞다는 뜻이다. */
  { id: "G-EM-07", nuclide: "Mn-54", energyKeV: 834.855,
    pTransition: 99.9997, uTransition: 0.0003, alphaT: 2.45e-4, alphaPi: 0,
    quoted: "γ1,0(Cr) 834,855 (3)  99,9997 (3)  E2  αT = 2,45 (4) ×10⁻⁴" },
  { id: "G-EM-08", nuclide: "Na-22", energyKeV: 1274.577,
    pTransition: 99.94, uTransition: 0.13, alphaT: 6.71e-6, alphaPi: 2.34e-5,
    quoted: "γ1,0(Ne) 1274,577 (7)  99,94 (13)  E2  αT = 6,71 (9) ×10⁻⁶  απ = 2,34 (3) ×10⁻⁵" },
  { id: "G-EM-09", nuclide: "I-131", energyKeV: 80.1854,
    pTransition: 6.63, uTransition: 0.15, alphaT: 1.544, alphaPi: 0,
    quoted: "γ1,0(Xe) 80,1854 (19)  6,63 (15)  M1  αT = 1,544 (46)  — no power-of-ten factor on this sheet" },
  { id: "G-EM-10", nuclide: "I-131", energyKeV: 163.930,
    pTransition: 1.087, uTransition: 0.021, alphaT: 50.5, alphaPi: 0,
    quoted: "γ2,0(Xe) 163,930 (8)  1,087 (21)  M4  αT = 50,5 (7)  — no power-of-ten factor on this sheet" },
];

/** 광자 방출확률 — 원문의 수에 대한 산술뿐이다(엔진을 부르지 않는다). */
export const photonProbability = (r: EmissionRef) => r.pTransition / (1 + r.alphaT + r.alphaPi);
/** 그 불확도 — αT·απ 의 불확도는 이 값들에서 무시할 수 있다(전이확률이 지배한다). */
export const photonUncertainty = (r: EmissionRef) => r.uTransition / (1 + r.alphaT + r.alphaPi);

/** ★ 유도가 스스로를 확인하는 자리 — DDEP 는 Cs-137 의 662 keV 방출확률을
 *  **따로 85,01 (20) %** 로 권고한다. 위 유도가 그 값을 재현하면 유도 자체가 맞다는 뜻이다. */
export const EMISSION_SELF_CHECK = {
  id: "G-EM-00",
  nuclide: "Cs-137",
  recommended: 85.01,
  uncertainty: 0.20,
  tolerance: 1e-3,
  steps: [
    "DDEP publishes the 661.657 keV photon emission probability separately as 85.01 (20) %.",
    "Deriving it from the transition data in the same sheet: 94.57 / (1 + 0.1124) = 85.0144 %.",
    "The two agree to 0.005 %, which establishes that the derivation used here is the one DDEP itself applies.",
    "Without this step the derivation would be an assumption, and every line below would inherit it.",
  ],
};

/* ═══════════ 5. δ — 밝히지 않은 규약과의 일치는 우연이다 ═══════════
   ★ Γ_δ 는 저에너지 차단 δ 에 의존한다. 문헌값이 δ 를 안 밝히면 대조 자체가 성립하지 않는다.
     그 크기를 **재서** 얼어 둔다 — 말로 「의존한다」고만 적으면 얼마나인지 알 수 없다. */
export interface DeltaCase {
  id: string; nuclide: string;
  /** Γ(δ=10 keV) / Γ(δ=20 keV). */
  ratio10over20: number;
  note: string;
}

export const DELTA_CASES: DeltaCase[] = [
  { id: "G-DL-01", nuclide: "Am-241", ratio10over20: 7.842095655,
    note: "Nearly eight times. Almost all of the air kerma from americium-241 comes from photons between 10 and 20 keV, so the cutoff does not trim the answer — it decides it." },
  { id: "G-DL-02", nuclide: "Ir-192", ratio10over20: 1.090485207,
    note: "Nine per cent, which is larger than the agreement any published comparison would claim." },
  { id: "G-DL-03", nuclide: "Cs-137", ratio10over20: 1,
    note: "No change: the caesium X-rays lie above 30 keV, so the two cutoffs select the same lines." },
  { id: "G-DL-04", nuclide: "Co-60", ratio10over20: 1,
    note: "No change, for the same reason. A comparison built only on cobalt-60 would show none of this." },
  { id: "G-DL-05", nuclide: "I-131", ratio10over20: 1,
    note: "No change at this pair of cutoffs, although iodine-131 does move between 20 and 30 keV." },
];

/* ═══════════ 6. 끝에서 끝까지 ═══════════ */
export interface WorkedCase {
  id: string; title: string;
  kind: "gammaConstant" | "doseRate" | "transmission";
  nuclide: string;
  input?: { activityGBq?: number; distanceM?: number; material?: string; thicknessCm?: number };
  expect: number; expectUnit: string;
  steps: string[]; why: string;
}

export const WORKED_CASES: WorkedCase[] = [
  { id: "G-W-01", title: "The air kerma rate constant of caesium-137", kind: "gammaConstant",
    nuclide: "Cs-137", expect: 0.07714631742, expectUnit: "mGy·m²/(GBq·h)",
    why: "The reference source of the field, and the one whose spectrum is simple enough to follow line by line.",
    steps: [
      "Six lines survive the 20 keV cutoff: 661.657 keV at 85.1 %, and five X-rays between 31.8 and 37.3 keV.",
      "For the main line, µen/ρ in air interpolates to 0.02928664455 cm²/g, that is 2.928664455 × 10⁻³ m²/kg.",
      "Its contribution is E·y·(µen/ρ) = 0.661657 × 1.602176634×10⁻¹³ × 0.851 × 2.928664455×10⁻³ = 2.642059×10⁻¹⁶ J·m²/kg.",
      "The five X-rays add 5.0855×10⁻¹⁸, about 1.9 % of the total; the sum is 2.692914490×10⁻¹⁶.",
      "Γ = sum /(4π) × 3.6×10¹⁵ = 0.07714631742 mGy·m²/(GBq·h).",
    ] },
  { id: "G-W-02", title: "The air kerma rate constant of cobalt-60", kind: "gammaConstant",
    nuclide: "Co-60", expect: 0.3056472063, expectUnit: "mGy·m²/(GBq·h)",
    why: "Two strong lines close in energy, so the answer is dominated by a part of the attenuation curve that is nearly flat.",
    steps: [
      "The two principal lines, 1173.228 keV at 99.85 % and 1332.492 keV at 99.9826 %, carry essentially all of it.",
      "Three weak lines and nothing below 20 keV make up the remainder.",
      "Γ = 0.3056472063 mGy·m²/(GBq·h), about four times the caesium value for twice the photon energy and twice the yield.",
    ] },
  { id: "G-W-03", title: "37 GBq of cobalt-60 at one metre", kind: "doseRate",
    nuclide: "Co-60", input: { activityGBq: 37, distanceM: 1 },
    expect: 11.30894663, expectUnit: "mGy/h",
    why: "One curie at one metre, the arrangement every handbook rule of thumb is quoted for.",
    steps: [
      "Ḋ = Γ·A/d² = 0.3056472063 × 37 / 1²",
      "= 11.30894663 mGy/h of air kerma.",
      "This is air kerma, not ambient dose equivalent and not exposure: comparing it with a remembered number in R/h without converting is how the two get confused.",
    ] },
  { id: "G-W-04", title: "370 GBq of iridium-192 at two metres", kind: "doseRate",
    nuclide: "Ir-192", input: { activityGBq: 370, distanceM: 2 },
    expect: 10.11363917, expectUnit: "mGy/h",
    why: "An industrial radiography source at a barrier distance.",
    steps: [
      "Γ(Ir-192) = 0.1093366396 mGy·m²/(GBq·h) at the 20 keV cutoff.",
      "Ḋ = 0.1093366396 × 370 / 2² = 40.45455667 / 4",
      "= 10.11363917 mGy/h.",
    ] },
  { id: "G-W-05", title: "Caesium-137 through two centimetres of lead", kind: "transmission",
    nuclide: "Cs-137", input: { material: "lead", thicknessCm: 2 },
    expect: 0.07874879433, expectUnit: "(transmission)",
    why: "The commonest shielding sum in a radiation protection office, and the one where leaving out buildup matters most.",
    steps: [
      "For the 661.657 keV line, µ/ρ in lead interpolates to 0.1111201198 cm²/g.",
      "µ = 0.1111201198 × 11.35 g/cm³ = 1.261213360 cm⁻¹, so µx = 2.522426719 at 2 cm.",
      "e^(−2.522426719) = 0.08026459060 for that line alone.",
      "The X-rays are attenuated far more strongly, so the weighted transmission over all six lines is lower:",
      "0.07874879433.",
      "This is narrow-beam: scattered photons are not counted, so the real rate behind the shield is higher. The interface says so, and the buildup mode exists for that reason.",
    ] },
];

/* ═══════════ 7. 거부 동작 ═══════════ */
export interface GammaRefusal { id: string; title: string; why: string; distanceM: number }

export const REFUSAL_CASES: GammaRefusal[] = [
  { id: "G-R-01", title: "A distance of zero", distanceM: 0,
    why: "The inverse-square law has a pole at the source. A point source is an idealisation and the field does not diverge in reality, but the model says nothing usable at zero and must not pretend otherwise." },
  { id: "G-R-02", title: "A negative distance", distanceM: -1,
    why: "There is no such geometry. Squaring it would hide the sign and return a plausible number." },
];
