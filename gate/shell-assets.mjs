/** 게이트의 로컬 서버가 공통 셸 자산 `/shell/*` 을 내주는 자리 — 정본 한 곳 (2026-10-28, 공통 셸 v3).
 *
 *  ★ 왜 필요한가: 쪽은 `/shell/shell.css?v=N` · `/shell/shell.js?v=N` 을 **오리진 루트**에서 읽는다. 라이브에서는
 *    같은 apex 의 우산 Worker 가 내준다(`/track.js` 와 같은 플랫폼 층). 게이트 서버는 `dist/calc/` 만 알므로 그대로
 *    두면 404 가 나고 — `check-render` 는 그 404 를 전 쪽의 「HTTP 404」 오류로 세어 통째로 빨개지고, 다른 게이트는
 *    토큰도 막대 CSS 도 없는 **벗은 쪽**을 재어 치수 · 색이 전부 어긋난다.
 *  ★ 어디서 내주나: `SHELL_DIR` 환경변수가 있으면 그 폴더(우산 저장소를 옆에 두고 일할 때
 *    `SHELL_DIR=../radiation-lab/public/shell` 로 **정본을 직접** 가리킨다). 없으면 이 저장소의 vendored 사본 `shell/` —
 *    `scripts/sync-shell.mjs` 가 apex 에서 받아 온 것이고, 빌드가 쓰는 shell.json · render.mjs 와 **같은 판**이다.
 *    CI 에는 우산 체크아웃이 없으므로 사본이 기본값이다.
 *  ★ 질의(`?v=N`)는 부르는 쪽이 이미 뗐다. 없는 파일은 404 — `npm run sync-shell` 을 권한다. */
import { readFileSync, existsSync } from "node:fs";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const SHELL_DIR = process.env.SHELL_DIR || join(dirname(fileURLToPath(import.meta.url)), "..", "shell");
const MIME = { ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json",
               ".woff2": "font/woff2", ".txt": "text/plain" };

/** `/shell/…` 이면 응답을 끝내고 true, 아니면 아무 일도 하지 않고 false. */
export function serveShell(p, r) {
  if (!p.startsWith("/shell/")) return false;
  const f = join(SHELL_DIR, p.slice("/shell/".length));
  if (!existsSync(f)) { r.writeHead(404); r.end("404 — shell asset missing; run `npm run sync-shell`"); return true; }
  r.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" });
  r.end(readFileSync(f));
  return true;
}
