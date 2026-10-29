/** RadCalc 의 판 — **한 곳에서 정한다**(T15, 소유주 결정 2026-10-29).
 *
 *  ★ 번호 규칙: 계산값 · 자료가 바뀌면 가운데 자리(1.0 → 1.1), 글만 고치면 끝자리(1.1.0 → 1.1.1).
 *  ★ 쪽마다의 판 줄(`layouts/Base.astro`) · 변경 기록(`/changelog/`) · 검증 보고서 머리가 여기서 읽는다.
 *    `CITATION.cff`(version · date-released) · `.zenodo.json`(version · publication_date) · README 는 같은 값을 **글자로** 들고,
 *    `version.test.ts` 가 넷이 같은지 잰다 — 판을 올리면 넷을 함께 고친다(어긋나면 `npm test` 가 멈춘다).
 *  ★ v1.1.0 은 Zenodo 새 판(릴리스 태그)과 같은 번호다. 태그는 감독이 소유주 확인을 받고 만든다. */
export interface Release { version: string; date: string }

/** 최신이 위. 변경 기록 쪽의 절 머리가 이 목록에서 나온다. */
export const RELEASES: readonly Release[] = [
  { version: "1.1.1", date: "2026-10-29" },
  { version: "1.1.0", date: "2026-10-29" },
  { version: "1.0.1", date: "2026-09-16" },
];
export const VERSION: Release = RELEASES[0];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** 「29 October 2026」 — 영국식 날짜(사이트의 다른 글과 같다). */
export const dateText = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};
