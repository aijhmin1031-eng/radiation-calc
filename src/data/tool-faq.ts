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
      a: "The half-life T½ is the time for half of the atoms to decay; the mean life τ = 1/λ = T½/ln 2 is the average time an atom survives, about 1.443 half-lives. After one mean life the activity has fallen to 1/e, about 37% of the start.",
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
};
