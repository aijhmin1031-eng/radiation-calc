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
  { tool: "decay", status: "planned" },
  { tool: "gamma-shielding", status: "planned" },
  { tool: "beta", status: "planned" },
  { tool: "specific-activity", status: "planned" },
  { tool: "mda", status: "planned" },
  { tool: "alara", status: "planned" },
];

export const reportFor = (tool: string) => REPORTS.find((r) => r.tool === tool);
