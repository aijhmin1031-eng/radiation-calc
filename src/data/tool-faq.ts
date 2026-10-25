/** 도구 쪽의 자주 묻는 질문 — 2026-10-25 D3.
 *
 *  ★ 이 배열 하나가 **화면의 FAQ 절**(`components/Faq.astro`)과 **`FAQPage` 구조화 데이터**
 *    (`layouts/Base.astro`)를 함께 만든다. 화면에 없는 문답을 구조화 데이터에만 싣지 않는다.
 *  ★ 답은 2~4문장, 공식이나 출처 하나에 닿게 쓴다. 답 속 수치는 `EX` 에서 가져온다 —
 *    엔진 테스트가 지키는 값이다. 답은 그대로 JSON-LD 의 text 가 되므로 HTML 을 넣지 않는다. */
import { EX } from "./worked-examples";

export interface FaqItem { q: string; a: string }

export const TOOL_FAQ: Record<string, readonly FaqItem[]> = {
  "gamma-shielding": [
    {
      q: "What is the gamma constant of Cs-137?",
      a: `Computed from the 662 keV line and the NIST energy-absorption coefficients of air, with a 20 keV cutoff, the air kerma rate constant of Cs-137 is ${EX.gamma.csConst} mGy·m²/(GBq·h). The same method gives ${EX.gamma.coConst} for Co-60 and ${EX.gamma.irConst} for Ir-192. Older tables quoted in R·m²/(Ci·h) or as dose-equivalent constants look different because they describe a different quantity, not because the physics differs.`,
    },
    {
      q: "How do I calculate the dose rate from a point source?",
      a: "Multiply the gamma constant by the activity and divide by the square of the distance: dose rate = Γ·A/d². The formula assumes a source small compared with the distance; at a distance of only a few source lengths it no longer holds and a line or area source model is needed.",
    },
    {
      q: "What is the half-value layer of lead for Cs-137?",
      a: `At 662 keV the NIST attenuation coefficient and a lead density of 11.35 g/cm³ give a half-value layer of about ${EX.gamma.leadHvlCs} cm, from HVL = ln 2/µ. That is a narrow-beam figure. Behind a real slab, scattered photons add to the transmitted beam, so the effective half-value layer of a broad beam is larger and the first few centimetres remove less than this suggests.`,
    },
    {
      q: "Why does my survey meter read more than the calculator?",
      a: "The calculator gives air kerma rate in gray, while most survey meters read ambient dose equivalent H*(10) in sievert, which is about 20% higher for Cs-137 photons according to the conversion coefficients in ICRP Publication 74. Scatter from walls, floor and the source holder adds more, and meters also have their own energy response.",
    },
    {
      q: "Can the attenuation-only result be used for shielding design?",
      a: "No. Attenuation alone counts only photons that pass through without interacting, so it understates the dose behind any thick shield. For design, use the buildup option, B = 1 + a·µx·exp(b·µx), with coefficients from a published source for the material and energy, and confirm the finished shield with a survey.",
    },
  ],
  decay: [
    {
      q: "How do I calculate the remaining activity after a given time?",
      a: "Use A = A₀·exp(−λt) with λ = ln 2/T½, which is the same as A = A₀·2^(−t/T½). Time and half-life must be in the same unit. The formula is exact for a single nuclide with no parent feeding it.",
    },
    {
      q: "How long does it take for activity to fall to one thousandth?",
      a: `About ten half-lives, because 2¹⁰ = 1024. For I-131 that is ${EX.decay.i131ThousandthD} days. Decay-in-storage rules such as US 10 CFR 35.92, which covers nuclides with half-lives up to 120 days, do not fix a number of half-lives; they require that the waste cannot be distinguished from background in a survey before it is released.`,
    },
    {
      q: "What is the difference between half-life and mean life?",
      a: "The half-life T½ is the time for half of the atoms to decay; the mean life τ = 1/λ = T½/ln 2 is the average time an atom survives, about 1.443 half-lives. After one mean life the activity has fallen to 1/e, about 37% of the start. Neither should be confused with the effective half-life used in nuclear medicine, which also counts biological removal: 1/T_eff = 1/T_phys + 1/T_bio.",
    },
    {
      q: "Why does my half-life from two measurements come out wrong?",
      a: "The two count rates must be net of background, taken in the same geometry and corrected for dead time, and the interval should be a large fraction of a half-life. Over a short interval the ratio is close to one and a small counting error moves the result a lot. A mixture of nuclides gives an apparent half-life that drifts as the shorter-lived component disappears.",
    },
    {
      q: "Can temperature, pressure or chemistry change a half-life?",
      a: "Not measurably for alpha and beta emitters. For nuclides that decay by electron capture, such as Be-7, the chemical form changes the half-life by a fraction of a percent at most, because the decay depends on electron density at the nucleus. The evaluated half-life is the right value for any practical calculation.",
    },
  ],
  units: [
    {
      q: "How many becquerels are in a curie?",
      a: `One curie is 3.7 × 10¹⁰ Bq, or 37 GBq, by definition. Each prefix step down keeps the factor 37: one millicurie is 37 MBq and one microcurie is 37 kBq, so a 10 mCi source holds ${EX.units.mCi10} MBq.`,
    },
    {
      q: "How do I convert dpm/100 cm² to Bq/cm²?",
      a: "Divide by 6000. One becquerel is 60 disintegrations per minute, and the reading is spread over 100 square centimetres, so 60 × 100 = 6000. To go the other way, multiply by 6000.",
    },
    {
      q: "How do I convert roentgen to gray?",
      a: `Multiply the exposure in C/kg (one roentgen is 2.58 × 10⁻⁴ C/kg) by the mean energy needed to make an ion pair in dry air, 33.97 J/C in ICRU Report 90. One roentgen therefore corresponds to ${EX.units.rMGy} mGy of air kerma. Dose to tissue needs a further factor that depends on photon energy.`,
    },
    {
      q: "How do I convert mrem to µSv?",
      a: "One millirem is 10 µSv, because one rem is exactly 0.01 Sv. So 100 mrem is 1 mSv, the annual effective dose limit for members of the public recommended in ICRP Publication 103.",
    },
    {
      q: "Is Bq/L the same as Bq/kg for water?",
      a: "Numerically yes, because a litre of water has a mass of one kilogram to within a fraction of a percent at room temperature. For any other liquid, divide the volume concentration by the density in kg/L to get Bq/kg. Soils and solids are reported per mass, so a volume figure there needs the bulk density.",
    },
    {
      q: "Is a gray the same as a sievert?",
      a: "Both units equal one joule per kilogram, but they measure different quantities. The gray is used for absorbed dose and kerma; the sievert is used for equivalent and effective dose, which apply the radiation and tissue weighting factors of ICRP Publication 103. For photons the radiation weighting factor is one, yet converting air kerma to a sievert quantity still needs an energy-dependent coefficient.",
    },
  ],
  mda: [
    {
      q: "What is the formula for minimum detectable activity?",
      a: "With paired background and sample counts of equal length and 5% false-positive and false-negative rates, Currie's detection limit is L_D = 2.71 + 4.65·√B counts, where B is the expected background count. Dividing by efficiency, count time, yield and sample size gives MDA = L_D/(ε·t·Y·q). The derivation is in L. A. Currie, Analytical Chemistry 40 (1968) 586.",
    },
    {
      q: "What is the difference between the critical level and the MDA?",
      a: "The critical level L_C = 1.645·√(2B) is the decision threshold: a net count above it is reported as detected. The detection limit L_D is the true signal that will exceed L_C 95% of the time, and the MDA is L_D expressed as activity. L_D is roughly twice L_C, so quoting L_C as the detection limit overstates the method by about a factor of two.",
    },
    {
      q: "How can I lower the MDA?",
      a: `When background dominates, the MDA falls with the square root of the counting time, so counting ten times as long lowers it about threefold; in the wipe example on this page it goes from ${EX.mda.wipeMda} to ${EX.mda.wipeMda600} Bq. Raising efficiency or sample size lowers it in direct proportion, which is usually the cheaper route. Lowering the background helps only through its square root.`,
    },
    {
      q: "Is MDA the same as LLD?",
      a: "Lower limit of detection (LLD) is the older name used in US NRC guidance, for example Regulatory Guide 4.16, for the same Currie detection limit expressed as activity or concentration. Both are a priori figures: they describe what the method can detect before a sample is counted, and they do not change with the sample result.",
    },
    {
      q: "Should results below the MDA be reported as zero?",
      a: "No. The MDA describes the measurement, not the sample, so a result below it is still a measured value with an uncertainty. ISO 11929 recommends reporting the measured value and its uncertainty together with the decision threshold and detection limit, which keeps averages and trends unbiased; replacing low results with zero or with the MDA distorts them.",
    },
  ],
  beta: [
    {
      q: "How thick does a beta shield need to be?",
      a: `At least the maximum range of the betas, which depends on the endpoint energy and is nearly the same in g/cm² for any light material. Divide by the density to get a thickness: Y-90 needs ${EX.beta.y90RangeGcm2} g/cm², or ${EX.beta.y90AcrylicMm} mm of acrylic. The range used here is the Katz–Penfold fit to aluminium absorption data.`,
    },
    {
      q: "Why not use lead to shield beta emitters?",
      a: `Lead stops betas in a very thin layer, but the fraction of their energy turned into bremsstrahlung X-rays rises with atomic number. For Y-90 it is about ${EX.beta.brPbPct}% in lead against ${EX.beta.brAcrPct}% in acrylic, and those photons are far more penetrating than the betas. Use a low-Z material first and add lead outside it only if the photon dose rate needs it.`,
    },
    {
      q: "What is the difference between maximum and mean beta energy?",
      a: "Beta decay shares its energy with a neutrino, so the electrons come out with a spectrum from zero up to the endpoint, Emax. The endpoint sets the range and therefore the shield thickness; the mean energy, typically between a third and two-fifths of Emax, sets the dose because it is the energy actually deposited per decay.",
    },
    {
      q: "Can this calculator give skin dose from a contamination spot?",
      a: "No. Skin dose depends on the source size, any air gap or covering, and the depth of the basal layer at 7 mg/cm², and a single number without those would be misleading. Use a code built for it, such as VARSKIN. The calculator gives only the exact infinite-medium dose rate and its half at a plane surface.",
    },
    {
      q: "How do I get the total dose from a beta emitter that decays away?",
      a: `Multiply the starting dose rate by the mean life, T½/ln 2, which is the integral of the decay curve. For Y-90 the mean life is ${EX.beta.y90MeanLifeH} hours, so 1 GBq spread uniformly through 1 kg of tissue delivers ${EX.beta.y90GyPerGBqKg} Gy in total.`,
    },
  ],
  alara: [
    {
      q: "How do I calculate the stay time in a radiation area?",
      a: `Divide the dose you are prepared to accept by the dose rate where the work is done: t = D / Ḋ. With a 0.5 mSv budget at 1.8 mSv/h that is ${EX.alara.stay1m} minutes. Use a measured dose rate at the actual working position, and leave a margin for the time spent getting in and out.`,
    },
    {
      q: "Does doubling the distance really cut the dose rate to a quarter?",
      a: "For a source that is small compared with the distance, yes: the inverse square law gives Ḋ₂ = Ḋ₁ × (d₁/d₂)². Close to an extended source such as a pipe, a tank or a contaminated floor the rate falls more slowly, so measure at the new position instead of relying on the law.",
    },
    {
      q: "What is collective dose and what is it used for?",
      a: "Collective dose is the sum of individual doses for a group, in person·mSv, here worked out as workers × hours × dose rate for each task. It is a planning tool for comparing ways of doing the same job. ICRP Publication 103 advises against using it to estimate health effects from very small doses spread over many people.",
    },
    {
      q: "Which of time, distance and shielding should I try first?",
      a: "Usually distance and time, because they cost the least: long-handled tools, rehearsing the job away from the source and moving people out of the area between steps. Shielding takes time and dose to put in place, so it pays off mainly for long jobs or high dose rates. The job-dose mode shows which task carries most of the collective dose, which is where any of the three matters most.",
    },
    {
      q: "Is a dose under the legal limit automatically ALARA?",
      a: "No. Dose limits are a ceiling, not a target. ALARA asks whether the dose could reasonably be lower, taking cost and practicality into account, and many organisations set lower dose constraints or investigation levels for that reason.",
    },
  ],
  "specific-activity": [
    {
      q: "How is specific activity calculated?",
      a: "Specific activity is the activity per gram of the pure nuclide: SA = λ·N_A / M = ln 2 · N_A / (T½ · M), with T½ in seconds, N_A Avogadro's number and M the molar mass in g/mol. This calculator uses the AME2020 atomic mass rather than the mass number, which changes the result by up to a few tenths of a percent.",
    },
    {
      q: "How many grams are in one curie of a radionuclide?",
      a: `One curie is 3.7 × 10¹⁰ Bq, so the mass is 3.7 × 10¹⁰ divided by the specific activity in Bq/g. For Cs-137 that is ${EX.specificActivity.cs1CiMg} mg; for radium-226 it is very close to 1 g, because the curie was originally defined from radium.`,
    },
    {
      q: "Why does the source I bought weigh far more than the calculated mass?",
      a: "The calculation is for the pure nuclide. Real sources contain the nuclide in a chemical compound, mixed with stable isotopes of the same element, a carrier and the capsule itself. The calculated mass is a lower limit on the material, and the nuclide's specific activity is an upper limit on what the source can reach.",
    },
    {
      q: "Why is plutonium so much more active than uranium per gram?",
      a: `Specific activity is inversely proportional to half-life. Pu-239 has a half-life of about 24 100 years against 4.47 billion years for U-238, so a gram of it is about ${EX.specificActivity.puURatio} times more active: ${EX.specificActivity.pu239GBq} GBq against ${EX.specificActivity.u238KBq} kBq.`,
    },
    {
      q: "Does the specific activity of natural uranium match U-238?",
      a: "No. Natural uranium also contains U-234 in radioactive equilibrium with U-238 and about 0.72% U-235, so its specific activity is roughly twice that of U-238 alone, before counting any decay products. For a mixture, add the activity of each nuclide in proportion to its mass fraction.",
    },
  ],
};
