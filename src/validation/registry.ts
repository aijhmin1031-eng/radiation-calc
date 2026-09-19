/** ★ 유효성 평가 보고서 등록부 — 정본이다. 허브 쪽이 여기서 그린다.
 *  ★★ **없는 것을 주장하지 않는다** — 보고서가 없는 도구는 없다고 적는다.
 *    도구 일곱 중 지금 하나만 평가돼 있고, 허브가 그것을 숨기면 그 쪽 자체가 거짓이 된다. */
export interface ValidationReport {
  /** `lib/tools.ts` 의 slug 와 같아야 한다 — 허브가 그것으로 짝을 맞춘다. */
  tool: string;
  status: "published" | "planned";
  /** 평가를 수행하고 원문을 대조한 날. 빌드 날짜가 아니다. */
  validatedOn?: string;
  /** 한 줄 요약 — 무엇을 어디까지 확인했는가.
   *  ★ **여기에 수를 적지 않는다** — 단위가 늘면 그 문장만 낡고 게이트는 산문을 못 본다.
   *    건수는 허브 쪽이 케이스 정본에서 **세어서** 그린다. */
  summary?: string;
}

export const REPORTS: ValidationReport[] = [
  { tool: "units", status: "published", validatedOn: "2026-09-17",
    summary: "Every unit the converter offers is derived by hand from its primary definition, and every conversion within a quantity is checked against those hand-derived factors." },
  { tool: "decay", status: "published", validatedOn: "2026-09-17",
    summary: "The decay law is checked as exact mathematics across half-lives spanning seventeen orders of magnitude, and the half-lives themselves are set against an independent evaluation that publishes uncertainties." },
  { tool: "gamma-shielding", status: "published", validatedOn: "2026-09-18",
    summary: "The unit chain is derived by hand, the interpolation is checked against every row of the attenuation tables, and the emission intensities are derived from an independent evaluation rather than compared with published gamma constants, which turn out to be a different quantity." },
  { tool: "beta", status: "published", validatedOn: "2026-09-19",
    summary: "The infinite-medium dose rate is derived exactly from conservation of energy; the three empirical fits behind the shielding mode are checked for form and domain and set against NIST electron data for the same quantity, not a similar one. What could not be established is listed rather than glossed." },
  { tool: "specific-activity", status: "published", validatedOn: "2026-09-18",
    summary: "Derived by hand from the definitions of the mole and the becquerel, with every molar mass set against the evaluated atomic masses. The report found that the calculator had been using mass numbers in place of molar masses, states the size of the error it caused, and records its removal." },
  { tool: "mda", status: "published", validatedOn: "2026-09-19",
    summary: "The three worked examples MARSSIM prints in its own text are reproduced by this engine, which is a stronger check than a derivation because it fails when the algebra is right and the answer is not. Where the calculator departs from the standard, the size and the direction of the departure are measured." },
  { tool: "alara", status: "published", validatedOn: "2026-09-19",
    summary: "A calculator with no data to compare against, so every expression is derived instead. The point-source assumption is turned into a distance criterion by solving the finite-source case exactly, and all nine inputs that have no answer are enumerated — every one of them was returning a number." },
];

export const reportFor = (tool: string) => REPORTS.find((r) => r.tool === tool);
