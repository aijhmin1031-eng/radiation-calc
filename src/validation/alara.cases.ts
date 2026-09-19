/** ★★★ 작업계획(ALARA) 계산기의 **유효성 평가 케이스 정본**(2026-09-19).
 *
 *  ★★★ **이 도구에는 대조할 바깥 자료가 없다 — 그것이 이 보고서의 성격이다.**
 *    핵자료도 경험식도 규격 상수도 쓰지 않는다. 역제곱 법칙은 **기하**이고, 체류시간과
 *    집단선량은 **나눗셈과 곱셈**이며, 반가층은 **정의**다. 대조할 편찬물이 없으니
 *    「MARSSIM 이 인쇄한 414 를 맞혔다」 같은 말을 할 수 없다.
 *
 *  ★★ **그러면 무엇을 검증하는가.** 셋이다.
 *    ① **식이 기하에서 나오는가** — 손으로 유도한다(입체각 논증).
 *    ② ★★★ **가정이 깨지는 자리를 수로 말할 수 있는가** — 「점선원을 가정한다」는 문장은
 *       실무에서 쓸모가 없다. **얼마나 멀면 충분한가**가 답이어야 한다. 선선원의 해석해가
 *       정확히 알려져 있으므로, 점근사의 과대평가를 **거리의 함수로 잰다**(아래 EXTENT_CASE).
 *    ③ **답하지 말아야 할 때 답하지 않는가** — 자료가 없는 도구에서 틀릴 수 있는 것은
 *       식이 아니라 **거부**다. 이 라운드가 여덟 자리를 찾았다.
 *
 *  ★★★ **이 라운드의 가장 중요한 발견: 같은 결함을 절반만 고쳤던 자리.**
 *    2026-09-14 에 `stayTime` 이 **선량률 NaN 에서 「unlimited」**를 내는 것을 고쳤다
 *    (`NaN > 0` 이 false 라 무제한 가지로 떨어졌다). 그런데 **음수도 같은 가지로 떨어진다** —
 *    `-1 > 0` 역시 false 다. 고친 지 닷새 뒤까지 **음의 선량률이 「무제한 체류 가능」**이었다.
 *    **한 가지 나쁜 입력을 막을 때는 같은 분기로 떨어지는 나머지를 함께 세어야 한다.**
 *
 *  ★ 이 파일은 `engine/` 의 값을 하나도 import 하지 않는다(순환논증 금지). */

/* ── 합격기준 ───────────────────────────────────────────────────────────── */

/** 기하와 산술 — 배정밀도 바닥까지. */
export const TOLERANCE_EXACT = 1e-12;
/** 손계산 — 기대값을 10자리로 끊어 싣는다. */
export const TOLERANCE_WORKED = 1e-9;

/* ── ① 유도 ─────────────────────────────────────────────────────────────── */

export interface DerivationCase {
  id: string; title: string; expect: number; steps: string[];
  /** 코드의 어느 자리인가. ★ 쪽에 그려지는 값이라 영문이다(절대규칙 5). */
  where: string;
  statements?: string[];
}

export const DERIVATION_CASES: DerivationCase[] = [
  { id: "A-U-01", title: "The inverse square law from solid angle",
    expect: 1, where: "inverseSquare in src/engine/alara.ts",
    steps: [
      "A point source emits the same number of particles per second in every direction.",
      "At distance d those particles are spread over a sphere of area 4πd². Nothing is created or destroyed in between, so the number crossing unit area falls as 1/d².",
      "Dose rate is proportional to that fluence rate, so it falls the same way: Ḋ(d₂) = Ḋ(d₁)·(d₁/d₂)².",
      "No property of the source, the radiation or the material enters. That is why this is the one relation on the screen that needs no data at all.",
      "It is also why it is the first control a radiation protection plan reaches for: doubling the distance costs nothing and removes three quarters of the dose.",
    ] },

  { id: "A-U-02", title: "What the point-source assumption costs, as a function of distance",
    expect: 1, where: "the scope of inverseSquare",
    steps: [
      "The derivation above needs the source to be a point. Real sources have extent, and the honest question is not whether the assumption is exact — it never is — but how far away it stops mattering.",
      "That question has a closed-form answer for a uniform line source of length L. Integrating 1/(d² + l²) along the line gives a dose rate proportional to (2/(L·d))·arctan(L/(2d)) at perpendicular distance d from the midpoint.",
      "Dividing by the point-source expression A/d² leaves arctan(x)/x with x = L/(2d), which is less than one for every finite distance and tends to one as d grows.",
      "So the point approximation always OVERESTIMATES the dose rate from an extended source. For planning that is the safe direction, which is worth knowing as well.",
      "The report tabulates the overestimate against d/L and solves for the distance at which it falls below 10%, 5%, 1% and 0.1%. That turns a caveat into a number a planner can use.",
      "Two things this does not cover: air attenuation, which reduces the rate further at long distance, and scatter from floors and walls, which increases it. Neither is in this calculator.",
    ] },

  { id: "A-U-03", title: "Stay time, and the difference between zero and unknown",
    expect: 1, where: "stayTime in src/engine/alara.ts",
    steps: [
      "A dose budget divided by a dose rate is a time. There is nothing more to it when the rate is a positive number.",
      "The interesting cases are the others. A rate of exactly zero means the budget is never spent, so the stay time is unbounded — that answer is correct and useful.",
      "A rate that is missing, not-a-number, negative or infinite means something different: there is no answer. Reporting unbounded there would tell a worker they may stay indefinitely because the field was left blank.",
      "The screen must therefore distinguish three outcomes, not two, and the engine returns a not-a-number for the third so that the screen can.",
      "This case exists because the distinction was got wrong twice — see the refusals.",
    ] },

  { id: "A-U-04", title: "Collective dose adds, and must not cancel",
    expect: 1, where: "collectiveDose in src/engine/alara.ts",
    steps: [
      "Collective dose is the sum over tasks of workers × hours × dose rate, in person-millisieverts.",
      "It is a plain sum, so it is exactly additive: splitting a task into two halves changes nothing.",
      "What matters is what happens to a bad row. A negative number of workers, or a negative rate, produces a negative contribution that silently cancels part of a legitimate task, and the total still looks like a total.",
      "So a single invalid row makes the whole sum unanswerable rather than being absorbed into it.",
    ] },

  { id: "A-U-05", title: "Half-value and tenth-value layers are definitions",
    expect: 1, where: "hvlFromMu and tvlFromMu in src/engine/alara.ts",
    steps: [
      "Narrow-beam attenuation is I = I₀·e^(−µx). Setting I/I₀ = 1/2 gives x = ln2/µ, and 1/10 gives x = ln10/µ.",
      "These follow from the exponential and nothing else, so they are exact for any µ the user supplies.",
      "Their ratio is therefore ln10/ln2 = log₂10 = 3.3219…, independent of µ and of the material — which is checked as an identity.",
      "A µ of zero has no half-value layer: the beam is not attenuated at all. Returning an infinite thickness reads as “a very thick shield works”, when the truth is that no thickness of that material works.",
    ] },
];

/* ── ★★ 가정이 깨지는 자리를 잰다 ────────────────────────────────────────── */

/** 선선원의 해석해 대비 점근사의 과대평가. **정확한 수학이라 바깥 자료가 필요 없다.**
 *  비 = arctan(x)/x,  x = L/(2d). */
export const EXTENT_CASE = {
  id: "A-E-01",
  title: "How far is far enough for a line source",
  /** 이 거리들(선원 길이의 배수)에서 잰다. */
  ratios: [0.5, 1, 2, 3, 5, 10, 20],
  /** 이 과대평가 한계들에 대해 필요한 거리를 푼다. */
  targets: [0.10, 0.05, 0.01, 0.001],
  /** 점근사는 **언제나** 과대평가한다 — 비가 1 을 넘으면 유도가 틀린 것이다. */
  alwaysOver: true,
  /** d = 3L 에서 과대평가가 이보다 작다(느슨한 경계 — 정확한 값은 쪽이 잰다). */
  atThreeL_below: 0.01,
  /** d = L 에서 과대평가가 이보다 크다 — 「한 길이 떨어지면 된다」가 아니라는 증거. */
  atOneL_above: 0.05,
  steps: [
    "The exact ratio of the finite-source rate to the point-source rate is arctan(x)/x with x = L/(2d).",
    "It is below one everywhere and rises to one as the distance grows, so the point approximation overestimates — the safe direction for planning.",
    "At one source length away the overestimate is still several percent; it takes roughly three source lengths to get inside one percent.",
    "This is mathematics, not measurement: no external data is needed, and the report computes the table rather than quoting it.",
  ],
} as const;

/* ── 항등식 ──────────────────────────────────────────────────────────────── */

export interface IdentityCase {
  id: string; title: string;
  kind: "doubleDistance" | "roundTrip" | "rateLinear" | "tvlOverHvl" | "muInverse"
      | "stayInverse" | "collectiveSplit" | "collectiveScale";
  expect: number; steps: string[];
}

export const IDENTITY_CASES: IdentityCase[] = [
  { id: "A-ID-01", title: "Doubling the distance quarters the dose rate", kind: "doubleDistance", expect: 0.25,
    steps: [
      "The defining consequence of the inverse square law, and the reason distance is the first control.",
      "It is exactly 0.25 at any starting distance and any rate, so it is checked across a grid of both.",
      "A tool that had squared only one of the two distances would still be monotonic and would fail here.",
    ] },
  { id: "A-ID-02", title: "Solving for distance inverts the rate calculation", kind: "roundTrip", expect: 1,
    steps: [
      "Asking for the distance that yields a target rate, then asking for the rate at that distance, must return the target.",
      "The two are separate expressions in the engine, one with a square and one with a square root, so nothing forces them to agree.",
      "Checked over a grid of reference rates, reference distances and targets.",
    ] },
  { id: "A-ID-03", title: "The dose rate scales linearly with the source strength", kind: "rateLinear", expect: 3,
    steps: [
      "Geometry does not care how strong the source is: tripling the reference rate triples the rate at every distance.",
      "This separates the geometric factor from the source term, which is what makes the reference-rate input meaningful.",
      "It also means the tool never needs to know what the source is: a measured rate at a known distance carries everything, which is why this calculator asks for a reading rather than an activity.",
    ] },
  { id: "A-ID-04", title: "A tenth-value layer is log₂10 half-value layers", kind: "tvlOverHvl", expect: Math.log2(10),
    steps: [
      "ln10/ln2 = 3.3219…, with no dependence on µ or on the material.",
      "It is the cleanest check that both expressions come from the same exponential.",
      "The residual is not exactly zero in floating point — the report prints what it measures rather than claiming zero.",
    ] },
  { id: "A-ID-05", title: "Doubling µ halves both layers", kind: "muInverse", expect: 0.5,
    steps: [
      "Both thicknesses are inversely proportional to µ, so a material twice as absorbing needs half the thickness.",
      "Checked for the half-value and tenth-value layer separately, since they are separate expressions.",
      "It is the identity that fixes the units: µ in inverse centimetres gives a thickness in centimetres, and a coefficient entered per metre would pass every other check here and give an answer a hundred times wrong.",
    ] },
  { id: "A-ID-06", title: "Halving the dose rate doubles the stay time", kind: "stayInverse", expect: 2,
    steps: [
      "Stay time is the budget divided by the rate, so it is exactly inverse in the rate.",
      "It is the identity behind the two figures the screen shows next to the answer: at twice the distance, and behind one half-value layer.",
      "Both of those are this identity with the rate reduced by a factor from the geometry or the shielding.",
    ] },
  { id: "A-ID-07", title: "Splitting a task in two changes nothing", kind: "collectiveSplit", expect: 1,
    steps: [
      "Two rows of half the hours each must give the same collective dose as one row of the full hours.",
      "Additivity is the whole content of the quantity, and it is what makes person-millisieverts comparable between plans.",
      "Checked with an uneven split as well as an even one, so that a symmetric error would not cancel.",
    ] },
  { id: "A-ID-08", title: "Doubling the crew doubles the collective dose", kind: "collectiveScale", expect: 2,
    steps: [
      "Collective dose counts people, so twice the crew for the same work is twice the total — even though each person receives the same.",
      "That is the tension the quantity exists to expose: a job done by fewer people for longer has the same collective dose but a higher individual one.",
      "The calculator reports the total; the individual figure is the stay time above.",
      "Neither number is a judgement. Which plan is better depends on the individual limit as well as the total, and the tool supplies neither limit.",
    ] },
];

/* ── 손계산 ──────────────────────────────────────────────────────────────── */

export interface WorkedCase {
  id: string; title: string;
  kind: "rate" | "distance" | "stay" | "collective" | "hvl" | "tvl";
  input: Record<string, number>;
  tasks?: { workers: number; hours: number; rate: number }[];
  expect: number; unit: string;
  steps: string[];
}

export const WORKED_CASES: WorkedCase[] = [
  { id: "A-W-01", title: "Backing off from one metre to four",
    kind: "rate", input: { rate1: 2, d1: 1, d2: 4 }, expect: 1.25e-1, unit: "mSv/h",
    steps: [
      "The reference is 2 mSv/h at 1 m.",
      "Ḋ(4 m) = 2 × (1/4)² = 2/16 = 0.125 mSv/h.",
      "Three metres of floor removed 93.75% of the dose rate and cost nothing.",
      "If the source is a line 1 m long, the point approximation overstates this by about 2% at 4 m — see A-E-01.",
    ] },
  { id: "A-W-02", title: "How far to reach a working limit",
    kind: "distance", input: { rate1: 2, d1: 1, target: 0.02 }, expect: 1.0e1, unit: "m",
    steps: [
      "From 2 mSv/h at 1 m, the distance at which the rate is 0.02 mSv/h is d = 1 × √(2/0.02).",
      "√100 = 10, so d = 10 m.",
      "Check: 2 × (1/10)² = 0.02 mSv/h. The two expressions agree, which is identity A-ID-02.",
      "A hundredfold reduction in rate needs a tenfold increase in distance — the square root is why distance stops being cheap eventually.",
    ] },
  { id: "A-W-03", title: "Stay time on a one-millisievert budget",
    kind: "stay", input: { doseLimit: 1, doseRate: 0.125 }, expect: 8.0e0, unit: "h",
    steps: [
      "At the 4 m position from A-W-01 the rate is 0.125 mSv/h.",
      "A task budget of 1 mSv gives 1/0.125 = 8 hours.",
      "At 1 m it would have been 0.5 hours. The same job, the same budget, sixteen times the working time.",
      "This is a task budget set by the planner, not a regulatory limit; the calculator does not supply dose limits.",
    ] },
  { id: "A-W-04", title: "Collective dose for a two-task job",
    kind: "collective", input: {}, expect: 5.0e0, unit: "person·mSv",
    tasks: [{ workers: 3, hours: 2, rate: 0.5 }, { workers: 2, hours: 4, rate: 0.25 }],
    steps: [
      "Task one: 3 workers × 2 h × 0.5 mSv/h = 3 person·mSv.",
      "Task two: 2 workers × 4 h × 0.25 mSv/h = 2 person·mSv.",
      "Total 5 person·mSv.",
      "The two tasks contribute unequally despite the second taking more worker-hours, because the rate differs — which is the comparison the quantity is for.",
    ] },
  { id: "A-W-05", title: "Half-value layer from a measured attenuation coefficient",
    kind: "hvl", input: { mu: 1.2 }, expect: 5.7762265047e-1, unit: "cm",
    steps: [
      "A measured linear attenuation coefficient of 1.2 per centimetre.",
      "HVL = ln2/µ = 0.693 147 180 6 / 1.2 = 0.577 622 650 47 cm.",
      "This is narrow-beam: a real broad beam has scatter reaching the detector, so the observed thickness for half is larger.",
    ] },
  { id: "A-W-06", title: "Tenth-value layer from the same coefficient",
    kind: "tvl", input: { mu: 1.2 }, expect: 1.9188209108e0, unit: "cm",
    steps: [
      "TVL = ln10/µ = 2.302 585 093 / 1.2 = 1.918 820 910 8 cm.",
      "TVL/HVL = 1.918 820 910 8 / 0.577 622 650 47 = 3.321 928 094 9, which is log₂10.",
      "The ratio carries no µ, so it is the same for every material and every energy — identity A-ID-04.",
    ] },
];

/* ── 거부 ────────────────────────────────────────────────────────────────── */

export interface RefusalCase {
  id: string; title: string;
  kind: "rate" | "distance" | "stay" | "collective" | "hvl";
  args: Record<string, number>;
  tasks?: { workers: number; hours: number; rate: number }[];
  why: string;
}

/** ★★ 여덟 자리가 **2026-09-19 에 실제로 뚫려 있었다.**
 *  ★★★ A-R-04 가 이 라운드의 교훈이다 — 닷새 전에 **같은 결함의 절반만** 고쳤다. */
export const REFUSAL_CASES: RefusalCase[] = [
  { id: "A-R-01", title: "A negative reference dose rate", kind: "rate", args: { rate1: -10, d1: 1, d2: 2 },
    why: "Returned −2.5 mSv/h. A negative dose rate has no meaning and would flow into a negative stay time." },
  { id: "A-R-02", title: "A negative reference distance", kind: "distance", args: { rate1: 10, d1: -5, target: 0.5 },
    why: "Returned −22.36 m. Only the target was checked for sign; the reference distance was not." },
  { id: "A-R-03", title: "A reference rate of zero when solving for distance", kind: "distance", args: { rate1: 0, d1: 1, target: 0.5 },
    why: "Returned 0 m, which reads as “stand against the source”. The truth is the opposite: with no source there is no constraint and every distance satisfies it. A number that means the reverse of the truth is worse than none." },
  { id: "A-R-04", title: "A negative dose rate when computing stay time", kind: "stay", args: { doseLimit: 20, doseRate: -1 },
    why: "Returned infinity, which the screen renders as “unlimited”. The not-a-number case of this same guard was fixed on 2026-09-14, but a negative value falls down the same branch — a comparison with a negative is false for the same reason a comparison with a not-a-number is. Half the defect was fixed and half was left." },
  { id: "A-R-05", title: "A negative dose budget", kind: "stay", args: { doseLimit: -20, doseRate: 1 },
    why: "Returned −20 hours. A negative time is not a refusal; it is an answer that looks like one." },
  { id: "A-R-06", title: "A negative number of workers", kind: "collective", args: {},
    tasks: [{ workers: -3, hours: 2, rate: 1 }],
    why: "Returned −6 person·mSv. Worse than the sign alone: inside a list of several tasks a negative row silently cancels part of a legitimate one, and the total still looks like a total." },
  { id: "A-R-07", title: "A not-a-number in one task of several", kind: "collective", args: {},
    tasks: [{ workers: 3, hours: 2, rate: 0.5 }, { workers: 2, hours: NaN, rate: 0.25 }],
    why: "One unanswerable row makes the sum unanswerable. This one already behaved correctly and is kept so that it stays that way." },
  { id: "A-R-08", title: "A zero attenuation coefficient", kind: "hvl", args: { mu: 0 },
    why: "Returned an infinite half-value layer, which reads as “a very thick shield works”. The truth is that no thickness of a material that does not attenuate will halve the beam." },
  { id: "A-R-09", title: "A negative attenuation coefficient", kind: "hvl", args: { mu: -1 },
    why: "Returned −0.693 cm. A negative coefficient would describe a beam that grows as it passes through matter." },
];

/* ── 이 보고서가 세우지 못한 것 ──────────────────────────────────────────── */

export const UNVERIFIED = [
  { id: "A-N-01", what: "Anything against measurement",
    why: "This calculator uses no nuclear data, no empirical fit and no standard's constants, so there is no published table or worked example to reproduce. Everything here is derived, and the report says so rather than implying an external check took place." },
  { id: "A-N-02", what: "Air attenuation and scatter",
    why: "The inverse square law is applied in vacuum. Air absorption reduces the rate at long distances and scatter from floors, walls and equipment raises it; neither is modelled, and the two work in opposite directions so they do not cancel predictably." },
  { id: "A-N-03", what: "Source geometries other than a line",
    why: "The distance at which the point approximation becomes adequate is derived here for a uniform line source, which is the common case for a pipe or a weld. A disc, a volume or a shielded container has a different answer, and only the line case is computed." },
  { id: "A-N-04", what: "Dose limits",
    why: "The budget on this screen is the planner's own figure for a task. The calculator supplies no regulatory or recommended limit and does not check the number entered against one." },
  { id: "A-N-05", what: "Broad-beam shielding",
    why: "The half-value and tenth-value layers follow from narrow-beam attenuation. Behind a real shield, scattered photons reach the detector and more thickness is needed than these figures give — the direction that matters, since it is the unsafe one." },
] as const;
