/** ★★ 크로미움 경로 **정본 한 곳**. 게이트 아홉과 생성기 둘이 **같은 파일**을 읽는다.
 *
 *  ★ 그전에는 열한 자리가 **같은 뜻을 네 가지로** 적고 있었다 —
 *    `check-lockup` 만 `PW_CHROMIUM` → `CHROMIUM_PATH` → **미리 깔린 것 자동 탐지**까지 했고,
 *    나머지 열은 `CHROMIUM_PATH` 를 **손으로 넣어 주지 않으면** 기본 경로를 찾다 죽었다.
 *    그래서 원격 컨테이너에서 `npm run gate` 가 **둘째 게이트에서 멈췄다**(2026-09-20 실측):
 *    playwright 1.63 은 `chromium_headless_shell-1243` 을 찾는데 깔려 있는 것은 1194 다.
 *  ★★ **죽는 방식이 나빴다** — playwright 가 「`npx playwright install` 을 돌려라」라고 권하고
 *    그것을 따르면 **브라우저를 새로 내려받는다**(원격 컨테이너는 그것을 금한다).
 *    고쳐야 할 것은 판이 아니라 **경로를 아는 자리가 열한 곳이라는 것**이었다.
 *  ★ 자동 탐지가 **CI 를 건드리지 않는다** — CI 는 `npx playwright install` 로 기본 경로에
 *    받으므로 `/opt/pw-browsers/chromium` 이 없고, 그때는 `executablePath` 를 주지 않는다.
 *  지키는 것은 `gate/check-gates.mjs` 다(역테스트 둘로 확인). */
import { existsSync } from "node:fs";

const PREINSTALLED = "/opt/pw-browsers/chromium";

export const CHROMIUM_EXE = process.env.PW_CHROMIUM || process.env.CHROMIUM_PATH
  || (existsSync(PREINSTALLED) ? PREINSTALLED : undefined);

/** `chromium.launch(LAUNCH)` — 경로를 못 찾으면 빈 객체라 playwright 기본값이 쓰인다. */
export const LAUNCH = CHROMIUM_EXE ? { executablePath: CHROMIUM_EXE } : {};
