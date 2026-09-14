/** ★ 도구 등록부 — 정본이다. 내비·허브·사이트맵·구조화 데이터가 전부 여기서 파생된다.
 *  도구를 늘릴 때 쪽마다 적지 않는다. */
export interface Tool {
  slug: string;
  name: string;
  /** 한 줄 — 카드와 meta description 이 함께 쓴다. */
  blurb: string;
  /** 「무엇을 답하는가」 — 사용자의 질문 형태로 적는다. 목록에서 고르는 근거가 된다. */
  question: string;
  needs: ("nuclide" | "shielding" | "counting" | "none")[];
  /** 로그인이 필요한가 — 기본 도구는 전부 false 다(유입의 핵심). */
  login: false;
}

export const TOOLS: Tool[] = [
  { slug: "units", name: "Unit converter", needs: ["none"], login: false,
    question: "How many becquerels is 5 µCi? How many Bq/cm² is 6000 dpm/100 cm²?",
    blurb: "Activity, dose, dose equivalent, exposure and surface contamination — converted within each quantity, never across." },
  { slug: "decay", name: "Decay and half-life", needs: ["nuclide"], login: false,
    question: "How much is left after 18 months? When does this source drop below the limit?",
    blurb: "Activity after elapsed time, the time to reach a target, half-life from two measurements, and decay chains." },
  { slug: "gamma-shielding", name: "Gamma dose rate and shielding", needs: ["nuclide", "shielding"], login: false,
    question: "What is the dose rate at 2 m from 37 GBq of Ir-192, and how much lead brings it under 20 µSv/h?",
    blurb: "Point-source dose rate from the emission spectrum, with attenuation and buildup, and the shield thickness solved backwards." },
  { slug: "specific-activity", name: "Mass and activity", needs: ["nuclide"], login: false,
    question: "How many grams of Pu-239 is 1 GBq? What is the specific activity of Sr-90?",
    blurb: "Grams to becquerels and back for 147 nuclides, from half-life and mass number." },
  { slug: "mda", name: "Detection limits (MDA / MDC)", needs: ["counting"], login: false,
    question: "What can this counter actually detect in a 10-minute count? How slowly must I scan?",
    blurb: "Critical level, detection limit and minimum detectable activity for fixed counting, plus scan MDC with observer efficiency." },
  { slug: "beta", name: "Beta dose rate and shielding", needs: ["nuclide", "shielding"], login: false,
    question: "How thick must acrylic be to stop Y-90 beta, and how much bremsstrahlung does lead make instead?",
    blurb: "Infinite-medium dose rate, Katz–Penfold range, transmission through absorbers, and bremsstrahlung yield by atomic number." },
  { slug: "alara", name: "ALARA and job planning", needs: ["none"], login: false,
    question: "How long can two workers stay? How far back must the barrier go?",
    blurb: "Inverse square, stay time against a dose budget, collective dose across tasks, and half- and tenth-value layers." },
];

export const toolBySlug = (slug: string) => TOOLS.find((t) => t.slug === slug);
export const toolPath = (slug: string) => `/${slug}/`;

/** 고유번호의 도구 약자 — RC-**GAM**-20260914-0001.
 *  ★ 약자를 표로 두지 않는다. DB 의 `calc_tool_code()` 와 **같은 규칙**이고,
 *    둘이 어긋나면 화면이 DB 가 발급한 번호와 다른 코드를 보여 준다. */
export const toolCode = (slug: string) =>
  slug.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 3).toUpperCase();

/** 저장본 고유번호의 생김새 — 화면에서 붙여넣은 번호를 검사할 때 쓴다. */
export const REF_PATTERN = /^RC-[A-Z0-9]{2,3}-\d{8}-\d{4,}$/;
