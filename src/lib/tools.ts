/** ★ 도구 등록부 — 정본이다. 내비·허브·사이트맵·구조화 데이터가 전부 여기서 파생된다.
 *  도구를 늘릴 때 쪽마다 적지 않는다. */
export interface Tool {
  slug: string;
  /** 내비·카드에 그리는 **짧은** 이름. 화면에서 줄이 바뀌면 안 되므로 길게 쓰지 않는다. */
  name: string;
  /** ★★ 검색 결과에 나가는 제목(2026-09-16 소유주 지시 「제목 고치자. 사람이 유입이
   *  될 수 있도록」). **`name` 과 갈라 둔다** — 내비는 짧아야 하고 검색 제목은 사람이
   *  실제로 치는 낱말을 담아야 한다. 한 값으로 묶으면 둘 중 하나가 반드시 나빠진다.
   *  ★ 실측 근거: 라이브 10쪽 중 제목에 `calculator` 가 든 쪽이 **1개**뿐이었다.
   *    「Gamma dose rate and shielding」인데 사람들은 「gamma dose rate **calculator**」를 친다.
   *  ★ 새 주장을 만들지 않는다 — 전부 그 도구의 `blurb` 가 이미 말하는 범위 안이다. */
  seoTitle: string;
  /** 한 줄 — 카드와 meta description 이 함께 쓴다. */
  blurb: string;
  /** 「무엇을 답하는가」 — 사용자의 질문 형태로 적는다. 목록에서 고르는 근거가 된다. */
  question: string;
  needs: ("nuclide" | "shielding" | "counting" | "none")[];
  /** 로그인이 필요한가 — 기본 도구는 전부 false 다(유입의 핵심). */
  login: false;

  /* ─────────────────────────────────────────────────────────────────────────
     ★ 신뢰도 삼항(2026-09-14 소유주 지시 「신뢰도는 올려야지」).
     계산기를 믿을지는 **답이 아니라 답이 선 자리**를 보고 정한다. 그래서 도구 쪽
     우측 레일이 셋을 나란히 든다 — 무엇을 전제했나 · 무엇을 답하지 않나 · 어떻게 맞는지 봤나.

     ★ **「다루지 않는 것」을 함께 적는 것이 핵심이다.** 답만 내어 주는 계산기는 그 답이
       어디까지 유효한지 말하지 않아, 쓰는 사람이 **범위 밖에서 쓴 줄도 모른다.**
       경계를 먼저 밝히는 쪽이 신뢰를 얻는다.
     ★ 내용은 각 도구의 본문·경고에 이미 있는 것을 줄인 것이다 — **여기서 새 주장을
       만들지 않는다.** 새 주장을 적으면 본문과 어긋나는 판이 하나 더 생긴다.
     ───────────────────────────────────────────────────────────────────────── */
  /** 이 계산이 서 있는 전제. */
  assumes: string[];
  /** 이 도구가 답하지 않는 것 — 범위 밖에서 쓰이는 것을 막는다. */
  excludes: string[];
  /** 맞는지 어떻게 보았나 — 한 줄. */
  checked: string;
}

export const TOOLS: Tool[] = [
  { slug: "units", name: "Unit converter",
    seoTitle: "Radiation unit converter — activity, dose, exposure", needs: ["none"], login: false,
    question: "How many becquerels is 5 µCi? How many Bq/cm² is 6000 dpm/100 cm²?",
    blurb: "Activity, dose, dose equivalent, exposure, surface contamination and concentration — converted within each quantity, never across.",
    assumes: [
      "Conversions stay inside one quantity, using the exact SI definitions rather than rounded factors.",
      "Exposure to air kerma multiplies by W/e = 33.97 J/C, the average energy to make one ion pair in dry air.",
      "Activity per litre and activity per kilogram are separate quantities. Crossing between them takes a density you supply, not a fixed factor.",
    ],
    excludes: [
      "Gray to sievert. That step needs a radiation weighting factor that depends on the radiation type — there is no single factor.",
      "Activity to dose. That depends on the nuclide, the geometry and the distance.",
    ],
    checked: "Factors are defined constants, not measurements — 1 Ci = 3.7×10¹⁰ Bq exactly.",
  },
  { slug: "decay", name: "Decay and half-life",
    seoTitle: "Radioactive decay calculator — half-life and activity", needs: ["nuclide"], login: false,
    question: "How much is left after 18 months? When does this source drop below the limit?",
    blurb: "Activity after elapsed time, the time to reach a target, half-life from two measurements, and decay chains.",
    assumes: [
      "Pure exponential decay of one nuclide, with half-lives from the IAEA evaluated nuclear data.",
      "Nothing but decay removes activity between the two times.",
    ],
    excludes: [
      "Leakage, adsorption and detector drift. All three look exactly like a shorter half-life in a two-point fit.",
      "Dilution or concentration of the sample between measurements.",
    ],
    checked: "One half-life returns 50.00% of the starting activity.",
  },
  { slug: "gamma-shielding", name: "Gamma dose rate and shielding",
    seoTitle: "Gamma dose rate calculator and shielding", needs: ["nuclide", "shielding"], login: false,
    question: "What is the dose rate at 2 m from 37 GBq of Ir-192, and how much lead brings it under 20 µSv/h?",
    blurb: "Point-source dose rate from the emission spectrum, with attenuation and buildup, and the shield thickness solved backwards.",
    assumes: [
      "A point source radiating isotropically in air, with no capsule and no self-absorption in the source.",
      "Narrow-beam attenuation, unless you enter buildup coefficients yourself.",
    ],
    excludes: [
      "Scatter from room surfaces and skyshine.",
      "Extended sources — a tank, a pipe run or a contaminated floor falls off far more slowly than 1/d².",
      "Dose buildup in tissue. The result is air kerma at a point, not organ dose.",
    ],
    checked: "Constants computed from the spectrum agree with published values to within about 2%; 1 Ci of Co-60 at 1 m gives 11.31 mGy/h.",
  },
  { slug: "specific-activity", name: "Mass and activity",
    seoTitle: "Specific activity calculator — mass and activity", needs: ["nuclide"], login: false,
    question: "How many grams of Pu-239 is 1 GBq? What is the specific activity of Sr-90?",
    blurb: "Grams to becquerels and back for 147 nuclides, from half-life and mass number.",
    assumes: [
      "The pure isotope, with the molar mass approximated by the mass number.",
      "Specific activity derived from the half-life, not taken from a table.",
    ],
    excludes: [
      "Isotopic mixtures. Weapons- or reactor-grade plutonium and enriched uranium hold more total mass than this, and the other isotopes add their own activity.",
      "Chemical form. Compounds and alloys weigh more than the isotope they carry.",
    ],
    checked: "The mass-number approximation is within 0.03% of the true molar mass for every nuclide here.",
  },
  { slug: "mda", name: "Detection limits (MDA / MDC)",
    seoTitle: "MDA calculator — detection limits and scan MDC", needs: ["counting"], login: false,
    question: "What can this counter actually detect in a 10-minute count? How slowly must I scan?",
    blurb: "Critical level, detection limit and minimum detectable activity for fixed counting, plus scan MDC with observer efficiency.",
    assumes: [
      "Poisson counting statistics with a background measured for the same duration (the Currie formulation).",
      "The efficiency you enter already accounts for geometry and, where used, the fraction leaving the surface.",
      "Scan MDC follows MARSSIM, including the observer efficiency term.",
    ],
    excludes: [
      "Spectral interference and self-absorption inside the sample.",
      "Systematic error in the efficiency itself, which is often larger than the counting statistics.",
    ],
    checked: "The critical level L_C and the detection limit L_D are reported separately — reporting L_C alone understates what the instrument finds.",
  },
  { slug: "beta", name: "Beta dose rate and shielding",
    seoTitle: "Beta dose rate calculator and shielding", needs: ["nuclide", "shielding"], login: false,
    question: "How thick must acrylic be to stop Y-90 beta, and how much bremsstrahlung does lead make instead?",
    blurb: "Infinite-medium dose rate, Katz–Penfold range, transmission through absorbers, and bremsstrahlung yield by atomic number.",
    assumes: [
      "Katz–Penfold range, which depends on mass thickness rather than the material.",
      "The infinite-medium dose rate is exact by energy conservation — every beta deposits its energy locally.",
      "Bremsstrahlung yield is an approximation that scales with atomic number.",
    ],
    excludes: [
      "Skin dose from surface contamination. Doing it properly needs a point kernel over the source geometry, the air gap and any covering — use a dedicated code such as VARSKIN.",
      "The beta spectrum shape. Dose follows the mean energy, range follows the maximum.",
    ],
    checked: "Y-90 in acrylic gives a 9.2 mm range, matching the published value.",
  },
  { slug: "alara", name: "ALARA and job planning",
    seoTitle: "ALARA calculator — stay time and collective dose", needs: ["none"], login: false,
    question: "How long can two workers stay? How far back must the barrier go?",
    blurb: "Inverse square, stay time against a dose budget, collective dose across tasks, and half- and tenth-value layers.",
    assumes: [
      "Inverse square for a point source in open geometry.",
      "The dose rate stays constant for the whole stay.",
    ],
    excludes: [
      "Extended sources. Near a large plane the rate barely falls with distance at all.",
      "Scatter from surrounding surfaces, which sets a floor that distance alone does not reach.",
      "Individual limits. Collective dose adds people together, so it rewards using fewer workers for longer.",
    ],
    checked: "Stay time answers \"unknown\" rather than \"unlimited\" when the dose rate is missing.",
  },
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
