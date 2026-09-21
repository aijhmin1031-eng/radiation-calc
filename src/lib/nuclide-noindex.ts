import nuclides from "../data/nuclides.json";

/** ★★ **반감기가 1초에 못 미치는 이성질체는 색인에서 뺀다**(2026-09-21).
 *
 *  계기: Search Console 이 핵종 낱장 147장 가운데 대부분을 「발견됨 — 현재 색인이 생성되지
 *  않음」으로 두고 있었다(실측 2026-09-21: 색인 35 · 발견-미색인 171). 구글은 이 묶음을
 *  **크롤링할 값어치가 있는지부터** 재고 있고, 그 판단에 가장 불리한 표본이 여기 걸리는
 *  열 장이다 — Cd-109m2 는 10.6 µs 다.
 *
 *  ★ 왜 1초인가. 차폐는 **설계하는 데 시간이 걸리는 일**이다. 반감기가 1초에 못 미치면
 *    「납 몇 mm」라는 물음 자체가 성립하지 않는다 — 계산은 맞지만 답할 물음이 없다.
 *    18.75 초인 Sc-46m 은 남긴다: 그 정도면 시료를 옮기는 동안의 이야기가 된다.
 *  ★ 쪽을 **지우지 않는다.** 모핵종에서 붕괴 연쇄를 따라온 사람에게는 필요하고,
 *    `noindex,follow` 이므로 그 쪽이 든 링크는 계속 따라간다. 색인 대상에서만 뺀다.
 *  ★★ 사이트맵에서도 빠져야 한다 — `astro.config.mjs` 의 `sitemap({ filter })` 가
 *    이 파일의 `NOINDEX_SLUGS` 를 읽는다. **두 곳이 같은 목록을 보는 것**이 요점이다.
 *    (「noindex 인 쪽이 사이트맵에 새는 것은 이 레포들이 되풀이해 밟은 함정이다」)
 */
export const NOINDEX_BELOW_S = 1;

const T = nuclides as unknown as Record<string, { t_half_s: number }>;

/** ★ 슬러그 규칙은 `lib/nuclides.ts` 의 `slugOf` 와 같다(`key.toLowerCase()`).
 *  거기서 가져오지 않는 것은 그 모듈이 엔진과 감쇠 자료를 함께 끌고 오기 때문이다 —
 *  이 파일은 `astro.config.mjs` 가 **빌드 설정 단계에서** 읽는다. 규칙이 갈라지면
 *  사이트맵만 어긋나므로, 갈라지는 날에는 두 곳을 함께 고친다. */
export const isTooShortLived = (key: string) => T[key].t_half_s < NOINDEX_BELOW_S;

export const NOINDEX_SLUGS = Object.keys(T).filter(isTooShortLived).map((k) => k.toLowerCase());

