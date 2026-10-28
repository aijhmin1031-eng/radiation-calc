/** 타입 선언 — vendored `render.mjs`(정본 `radiation-lab/public/shell/render.mjs`, HEADER-SPEC v3)의 서명 (2026-10-28, T2).
 *
 *  ★ 이 파일만은 **이 저장소의 것**이다 — `npm run sync-shell` 이 받아 오는 사본이 아니다(사본은 shell.json · render.mjs ·
 *    shell.css · shell.js · fonts/). `astro check` 가 `.mjs` 의 인자 모양을 기본값(`= {}`)에서만 추론해 `pageUrl` 같은 칸을
 *    「없는 속성」으로 읽었다(ts 2353). 그래서 서명을 여기 적는다 — TS 는 같은 이름의 `.d.mts` 를 `.mjs` 보다 먼저 본다.
 *  ★ 정본의 서명이 바뀌면 이 파일이 **낡아서** `astro check` 가 빨개진다 — 그것이 뜻이다(사본만 갱신하고 호출을 안 고친 것을 잡는다).
 *    정본에 JSDoc 타입이 붙으면(정본 변경 요청 2026-10-28) 이 파일은 지워도 된다. */
export interface ShellSpec { version: number; [key: string]: unknown }

export function renderHeader(spec: ShellSpec, opts?: { section?: string; currentHref?: string; apex?: boolean }): string;
export function renderFooter(spec: ShellSpec, opts?: { section?: string; pageUrl?: string; shareText?: string; apex?: boolean; versionLabel?: string }): string;
export function renderBreadcrumb(spec: ShellSpec, opts: { section: string; trail?: { label: string; href?: string }[]; apex?: boolean }): string;
export function renderBackLine(spec: ShellSpec, opts: { section: string }): string;
export function renderNotFound(spec: ShellSpec, opts: { section: string }): string;
export function renderHeadAssets(spec: ShellSpec, opts?: { apex?: boolean; withThemeBoot?: boolean }): string;
export const SHELL_VERSION_ATTR: string;
