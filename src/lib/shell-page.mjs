/** 공통 셸 v3 에 이 lab 의 쪽이 자기를 어떻게 말하는가 — 머리글의 「현재」와 꼬리말의 공유 대상 (2026-10-28, T2).
 *
 *  ★ 정본 `radiation-lab/public/shell/render.mjs` 는 쪽에 대해 둘만 묻는다: `currentHref`(어느 칸이 「현재」인가)와
 *    `pageUrl`·`shareText`(공유 줄이 무엇을 권하는가). 그 답을 정하는 규칙이 이 파일이다.
 *  ★ **두 자리가 같은 함수를 부른다** — `Base.astro`(빌드 때 그린다)와 `gate/check-shell.mjs`(산출물이 그 출력과
 *    바이트 동일한지 잰다). 규칙을 한쪽에만 적으면 게이트가 자기 규칙으로 재어 늘 빨개지거나 늘 통과한다.
 *    그래서 Vite 와 node 가 둘 다 그대로 읽는 평문 .mjs 다(`lastmod.mjs` 와 같은 처방). */

/** 막대의 칸 셋은 **구역**이다 — 핵종 낱장에서는 「Nuclide data」, 유효성 평가 낱장에서는 「Validation」이 켜져야 한다.
 *  그전 머리글은 `startsWith` 로 그렇게 했고, render.mjs 는 주소 전체를 비교하므로 깊은 주소 대신 구역의 뿌리를 넘긴다.
 *  도구 쪽과 그 밖은 제 주소를 넘긴다 — Calculators 패널이 지금 도구를 표시한다. */
export const SECTION_ROOTS = ["/calc/nuclides/", "/calc/methods/", "/calc/validation/"];

/** @param {string} here  base 가 붙은 pathname(`/calc/nuclides/co-60/`)  @param {string} site  오리진(`https://radiation-lab.com`) */
export function currentHrefFor(here, site) {
  const root = SECTION_ROOTS.find((r) => here.startsWith(r));
  return new URL(root ?? here, site).href;
}

/** 공유할 주소가 없는 쪽(404 — canonical 이 없다)과 남에게 권할 쪽이 아닌 쪽(`share={false}` — 저장 목록)은
 *  **apex 홈**을 권한다. 공통 꼬리말은 모든 쪽에 공유 줄을 두므로 「없는 공유 줄」은 없고, 대신 권하는 대상을 바꾼다.
 *  우산의 404 가 홈을 권하는 것과 같은 처방(radiation-lab scripts/shell-pages.mjs). */
export const HOME_SHARE = "Radiation Lab — computational tools for radiation science and engineering";

/** @param {{ canonicalUrl?: string, title: string, share?: boolean }} page  @param {string} site */
export function shareFor({ canonicalUrl, title, share = true }, site) {
  if (!share || !canonicalUrl) return { pageUrl: new URL("/", site).href, shareText: HOME_SHARE };
  return { pageUrl: canonicalUrl, shareText: `${title} · Radiation Lab` };
}
