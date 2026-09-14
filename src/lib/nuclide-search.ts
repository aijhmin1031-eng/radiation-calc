import type { Nuclide, Emission } from "../engine/types";
import { emissionKinds } from "../engine/types";

export const flat = (s: string) => s.toLowerCase().replace(/[-\s]/g, "");

/** ★ 검색 순위 — 이성질체가 바닥상태를 가리는 것을 막는다.
 *  「co60」을 치면 Co-60m(10.5분, Γ 가 522배 작다)이 먼저 오던 실측 결함이 있었다.
 *  0 정확히 일치 · 1 앞에서 일치 · 2 포함. 같은 순위면 바닥상태가 먼저다. */
export function rankNuclide(key: string, needle: string): number {
  if (!needle) return 2;
  const f = flat(key);
  if (f === needle) return 0;
  return f.startsWith(needle) ? 1 : 2;
}

export function searchNuclides(
  nuclides: Record<string, Nuclide>, query: string, require?: Emission[],
): { k: string; n: Nuclide; kinds: Emission[] }[] {
  const all = Object.entries(nuclides).map(([k, n]) => ({ k, n, kinds: emissionKinds(n) }));
  const usable = require?.length ? all.filter((x) => x.kinds.some((c) => require.includes(c))) : all;
  const needle = flat(query);
  const hit = needle ? usable.filter((x) => flat(x.k).includes(needle)) : usable;
  return hit.sort((a, b) =>
    rankNuclide(a.k, needle) - rankNuclide(b.k, needle) ||
    (a.n.iso ? 1 : 0) - (b.n.iso ? 1 : 0) ||
    a.n.z - b.n.z || a.n.a - b.n.a ||
    a.k.localeCompare(b.k));
}
