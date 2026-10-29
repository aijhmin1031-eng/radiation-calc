/**
 * v1.1.0 변경 기록의 전후 값 — **손으로 옮기지 않고 자료에서 계산한다**(T15).
 *
 * ★ 「전」은 T11(Kβ 이중 계산 제거 · β− 보충, 커밋 2f0b837) **바로 앞** 커밋의 `src/data/nuclides.json` 을 git 이력에서 읽고,
 *   「후」는 지금의 자료다. 둘 다 **지금의 엔진**(`gammaConstant` · `spectrumHVL`, δ 20 keV)으로 계산한다 — T11 은 자료만
 *   고쳤고 엔진은 그대로라 「전」이 그때 쪽에 찍히던 값과 같다(T11 보고 §5 와 대조했다).
 * ★ 결과는 `src/data/changes-1.1.0.json` 에 커밋한다. `src/lib/changes.test.ts` 가 「후」가 지금 엔진 값과 같은지 잰다 —
 *   자료가 다시 바뀌면 이 기록과 쪽이 어긋나는 것을 테스트가 잡는다.
 * 실행: npx tsx scripts/make-changes.mts
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gammaConstant, spectrumHVL, DELTA_DEFAULT_KEV } from "../src/engine/index.ts";
import type { Nuclide } from "../src/engine/types.ts";
import { PAGE_KEYS } from "../src/lib/nuclide-pages.ts";

const BEFORE_REF = "2f0b837^";
const before = JSON.parse(execFileSync("git", ["show", `${BEFORE_REF}:src/data/nuclides.json`], { encoding: "utf8", maxBuffer: 1 << 28 })) as Record<string, Nuclide>;
const after = JSON.parse(readFileSync("src/data/nuclides.json", "utf8")) as Record<string, Nuclide>;
const att = JSON.parse(readFileSync("src/data/attenuation.json", "utf8"));

const gOf = (n: Nuclide) => gammaConstant(n, att.air, DELTA_DEFAULT_KEV);
const hOf = (n: Nuclide) => (gOf(n) > 0 ? spectrumHVL(n.lines, att.air, att.lead, "lead") * 10 : null);  // mm
const sig = (x: number | null, d = 4) => (x == null || !Number.isFinite(x) ? null : Number(x.toPrecision(d)));

const gamma: { key: string; page: boolean; gBefore: number; gAfter: number; hvlBefore: number | null; hvlAfter: number | null }[] = [];
for (const k of Object.keys(after)) {
  const b = before[k], a = after[k];
  if (!b) continue;
  const gb = gOf(b), ga = gOf(a);
  if (!(gb > 0 || ga > 0)) continue;
  const hb = hOf(b), ha = hOf(a);
  const moved = Math.abs(ga - gb) > 1e-12 * Math.max(gb, ga) || (hb != null && ha != null && Math.abs(ha - hb) > 1e-9 * hb);
  if (!moved) continue;
  gamma.push({ key: k, page: PAGE_KEYS.includes(k), gBefore: sig(gb, 7)!, gAfter: sig(ga, 7)!, hvlBefore: sig(hb, 7), hvlAfter: sig(ha, 7) });
}
gamma.sort((x, y) => (x.gAfter / x.gBefore) - (y.gAfter / y.gBefore));
const betaAdded = Object.keys(after).filter((k) => before[k] && !before[k].beta?.length && after[k].beta?.length).sort();
/* 지운 광자선 — 전에는 있고 후에는 없는 [에너지, 세기] 줄(Kβ 전체 줄 · 부분 짝의 K′β1). 더해진 줄은 없어야 한다. */
let linesRemoved = 0, linesAdded = 0; const keysLinesRemoved: string[] = [];
for (const k of Object.keys(after)) {
  if (!before[k]) continue;
  const key = (l: [number, number]) => `${l[0]}|${l[1]}`;
  const a = new Map<string, number>(); for (const l of after[k].lines) a.set(key(l), (a.get(key(l)) ?? 0) + 1);
  const b = new Map<string, number>(); for (const l of before[k].lines) b.set(key(l), (b.get(key(l)) ?? 0) + 1);
  let gone = 0; for (const [x, c] of b) gone += Math.max(0, c - (a.get(x) ?? 0));
  for (const [x, c] of a) linesAdded += Math.max(0, c - (b.get(x) ?? 0));
  if (gone) { linesRemoved += gone; keysLinesRemoved.push(k); }
}

const out = {
  _comment: "v1.1.0 변경 기록의 전후 값 — scripts/make-changes.mts 가 git 이력(2f0b837^)과 지금 자료에서 계산했다. 손으로 고치지 않는다.",
  before: BEFORE_REF, deltaKeV: DELTA_DEFAULT_KEV, linesRemoved, linesAdded, keysLinesRemoved: keysLinesRemoved.length, gamma, betaAdded,
};
writeFileSync("src/data/changes-1.1.0.json", JSON.stringify(out, null, 1) + "\n");
console.log(`지운 광자선 ${linesRemoved}줄 · ${keysLinesRemoved.length}키 (더해진 줄 ${linesAdded}) · Γ 또는 납 HVL 이 바뀐 키 ${gamma.length}(쪽 ${gamma.filter((r) => r.page).length}) · β− 가지가 새로 선 키 ${betaAdded.length}`);
for (const r of gamma.filter((r) => r.page).slice(0, 8)) console.log(" ", r.key, r.gBefore, "→", r.gAfter, `${((r.gAfter / r.gBefore - 1) * 100).toFixed(2)}%`, r.hvlBefore, "→", r.hvlAfter);
