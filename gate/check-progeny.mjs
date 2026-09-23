/**
 * 붕괴 연쇄 게이트 — **막아야 할 것이 딸핵종인 쪽이 그것을 말하는가.**
 *
 * ★★★ 계기(2026-09-23 실측): 낱장이 딸핵종을 한 번도 말하지 않아 Ru-106 쪽이
 *   「0.0215 mm 의 아크릴이면 종점을 멈춘다」고 적고 있었다. Rh-106(30초, 3.54 MeV)과는
 *   예외 없이 평형이라 실제로는 **15.0 mm** — **697배**다. Sr-90 은 5.9배, Pb-210 은 81배.
 *   **숫자는 하나도 틀리지 않았고 결론이 틀렸다.** 면책 문구로 덮을 수 있는 종류가 아니다.
 *
 * ★ 이 게이트가 무는 자리 셋 —
 *   ① 목록에 있는 쪽이 **딸핵종의 이름**을 본문에 드는가
 *   ② `present` 인 쪽이 **딸에 맞춘 수치**(두께나 감마상수)까지 적는가 —
 *      이름만 부르고 넘어가면 결론은 여전히 모핵종의 것이다
 *   ③ 목록 **밖의 쪽이 남의 딸 이야기를 하지 않는가**(147장에 되풀이되면 그것이 틀이다)
 *
 * ★ **못 보는 것**: 문장이 **맞는가**는 재지 않는다 — 두께가 0 이어도 「mm」만 있으면 통과한다.
 *   조립된 문장은 사람이 읽는다(그렇게 해서 「7.0e+2×」·「0.0448 MeV 베타」·이성질체에
 *   「chemically separated」 셋을 잡았다). 그리고 **한 걸음짜리 검사**다 —
 *   여러 걸음 연쇄(Th-230·U-232)는 `src/lib/decay-chain.ts` 가 밝힌 대로 범위 밖이다.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist/calc/nuclides");

const { WITH_DOMINANT_PROGENY } = await import("../src/lib/decay-chain.ts");
const { NUCLIDES } = await import("../src/lib/nuclides.ts");

const flat = (x) => x.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gu, " ").replace(/\s+/g, " ");
const main = (slug) => {
  const f = join(DIST, slug, "index.html");
  if (!existsSync(f)) return null;
  const h = readFileSync(f, "utf8");
  const m = /<main[\s\S]*?<\/main>/.exec(h);
  return m ? m[0] : h;
};
const body = (slug) => { const m = main(slug); return m === null ? null : flat(m); };
/** ★★ **문단 단위로 좁힌다.** 첫 판은 딸 이름 이후 **쪽 끝까지**를 봤는데, 아래 표에 있는
 *  **모핵종의** 「1.57 mm of acrylic」이 걸려 **수치를 지워도 통과**했다(역테스트에서 드러났다).
 *  「시야에 넣었다」와 「재고 있다」는 다른 층이다 — 이 레포가 `/account/` 에서 밟은 그 함정이다. */
const paraWith = (slug, needle) => {
  const m = main(slug);
  if (m === null) return null;
  for (const p of m.match(/<p[\s\S]*?<\/p>/g) ?? []) {
    const t = flat(p);
    if (t.includes(needle)) return t;
  }
  return null;
};

const fail = [];
const listed = new Map(WITH_DOMINANT_PROGENY);

for (const [key, prog] of WITH_DOMINANT_PROGENY) {
  const t = body(key.toLowerCase());
  if (t === null) { fail.push(`${key}: 산출물이 없다`); continue; }
  if (!t.includes(prog.key)) {
    fail.push(`${key}: 딸핵종 ${prog.key} 를 본문에서 한 번도 부르지 않는다 — 차폐 결론이 모핵종의 것이다`);
    continue;
  }
  if (prog.presence !== "present") continue;
  // 이름만 부르고 끝나면 결론은 바뀌지 않는다 — 딸에 맞춘 수치가 있어야 한다
  const para = paraWith(key.toLowerCase(), prog.key);
  if (!para) { fail.push(`${key}: ${prog.key} 가 본문 문단 밖에만 있다`); continue; }
  const hasNumber = prog.betaHotter ? /\d[\d.]*\s*mm of acrylic/.test(para)
                                    : /mGy·m²\/\(GBq·h\)/.test(para);
  if (!hasNumber)
    fail.push(`${key}: ${prog.key} 를 부르기만 하고 ${prog.betaHotter ? "두께" : "감마상수"} 를 안 적는다`);
}

// ③ 목록 밖의 쪽이 남의 딸 이야기를 들고 있지 않은가
const MARKERS = ["does not stand alone", "grows in beneath", "The photon field around"];
let strays = 0;
for (const key of Object.keys(NUCLIDES)) {
  if (listed.has(key)) continue;
  const t = body(key.toLowerCase());
  if (t && MARKERS.some((m) => t.includes(m))) { strays++; fail.push(`${key}: 목록 밖인데 연쇄 문장을 들고 있다`); }
}

if (fail.length) {
  console.error("check-progeny   ❌\n  - " + fail.join("\n  - "));
  process.exit(1);
}
const present = WITH_DOMINANT_PROGENY.filter(([, g]) => g.presence === "present").length;
console.log(
  `check-progeny   ✅ 붕괴 연쇄 점검 통과 — 결론을 딸이 정하는 쪽 ${WITH_DOMINANT_PROGENY.length}장` +
  `(평형 ${present} · 자라는 중 ${WITH_DOMINANT_PROGENY.length - present}) · 전부 딸을 부르고 수치까지 적는다` +
  ` · 목록 밖에서 새어 나온 연쇄 문장 ${strays}건` +
  `\n                ※ 못 보는 것: 문장이 맞는지 · **하한값이 맞는지**(그것은 decay-chain.ts 의 정의다) · 여러 걸음 연쇄`,
);
