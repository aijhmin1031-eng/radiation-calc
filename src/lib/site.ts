import { SITE_NAME, SITE_TAGLINE, SITE_URL_DEFAULT, BASE_PATH, UMBRELLA_NAME, DATA_SOURCES } from "../../brand";
export { SITE_NAME, SITE_TAGLINE, UMBRELLA_NAME, DATA_SOURCES, BASE_PATH };

export const SITE_URL = (import.meta.env.SITE_URL as string | undefined) || SITE_URL_DEFAULT;

/** 그릴 때 base 를 붙인다. ★ 멱등이다 — 두 번 걸어도 두 번 붙지 않는다. */
export function u(path: string): string {
  if (/^https?:|^mailto:|^#/.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  if (p === BASE_PATH || p.startsWith(BASE_PATH)) return p;
  return BASE_PATH.replace(/\/$/, "") + p;
}
/** 비교할 때 base 를 뗀다 — 사이트맵·OG 조회는 반드시 이쪽을 쓴다. */
export function canonicalPath(pathname: string): string {
  const b = BASE_PATH.replace(/\/$/, "");
  const p = pathname.startsWith(b) ? pathname.slice(b.length) : pathname;
  return p.startsWith("/") ? p : `/${p}`;
}
export const withSlash = (p: string) => (p.endsWith("/") ? p : `${p}/`);
export const canonical = (pathname: string) => new URL(withSlash(u(canonicalPath(pathname))), SITE_URL).href;
