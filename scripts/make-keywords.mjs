/** 도구 키워드 낱말 — 아웃라인 좌표를 만든다.
 *
 *  ★★ 계기(2026-09-15 소유주 지시 「키워드로 단어 하나씩 넣자. 단어 폰트는 별도로
 *    디자인하여 정성들여서.. 디테일 살려서」). 각판화 판 아래에 붙는 **도판 캡션**이다.
 *
 *  ★ **웹폰트를 불러오지 않는다.** 이 사이트는 제3자 폰트 요청이 0건이고 그것을
 *    `check-adsense` 가 지킨다(자매 lab). 그래서 글자를 **경로로 떠서** 굽는다 —
 *    기기마다 다른 얼굴로 그려지지 않고, `currentColor` 대신 고정 잉크색을 쓰며,
 *    어떤 크기에서도 또렷하다.
 *
 *  ★ 활자는 **Libre Caslon Text**(OFL). 1배 13px 로 네 후보를 구워 눈으로 골랐다 —
 *    Caslon 은 이 도판들이 나온 영국 책의 활자이고, **텍스트용 컷**이라 작은 크기에서
 *    획이 죽지 않는다. Playfair 는 헤어라인이 얇아지고 EB Garamond 는 한 끗 가늘다.
 *
 *  ★★ **`toPathData` 를 쓰지 않는다.** opentype.js 2.0.0 의 `roundDecimal` 이 소수부를
 *    문자열로 이어 붙여 반올림해서, 좌표가 정수 바로 위(385.00000000000006)에 떨어지면
 *    지수 표기가 되어 **NaN** 이 되고 SVG 파서가 그 자리에서 멎어 **뒤를 통째로 버린다**.
 *    자매 lab 에서 낱말이 「RadMete」로 잘린 적이 있다. 명령 배열을 직접 조판한다.
 *
 *  쓰는 법: `npm run make-keywords` → `src/data/keywords.ts` 를 덮어쓴다(커밋한다).
 */
import opentype from "opentype.js";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const FONT = fileURLToPath(new URL(
  "../node_modules/@fontsource/libre-caslon-text/files/libre-caslon-text-latin-400-normal.woff",
  import.meta.url));
const OUT = fileURLToPath(new URL("../src/data/keywords.ts", import.meta.url));

/** 도구별 키워드 — 카드 제목이 이미 이름을 말하므로, 여기서는 **그 도구가 하는 일**을 한 낱말로. */
export const KEYWORDS = {
  units: "CONVERT",
  decay: "DECAY",
  "gamma-shielding": "SHIELD",
  "specific-activity": "MASS",
  mda: "DETECT",
  beta: "ABSORB",
  alara: "PLAN",
};

/** 자간 — em/1000. ★ 각판 캡션은 **넓게 벌린다**: 좁으면 그냥 본문 글자로 보이고,
 *  넓혀야 「새겨 넣은 표제」로 읽힌다. 120 은 낱말이 판 폭 안에 들어오는 한계에서 고른 값이다. */
const TRACK = 120;

const num = (v, dp = 2) => {
  if (!Number.isFinite(v)) throw new Error(`유한하지 않은 좌표: ${v}`);
  let s = v.toFixed(dp);
  if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s === "-0" ? "0" : s;
};

const pathData = (cmds, dp = 2) => {
  const n = (v) => num(v, dp);
  return cmds.map((c) => {
    switch (c.type) {
      case "M": return `M${n(c.x)} ${n(c.y)}`;
      case "L": return `L${n(c.x)} ${n(c.y)}`;
      case "Q": return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
      case "C": return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
      case "Z": return "Z";
      default: throw new Error(`모르는 명령: ${c.type}`);
    }
  }).join("");
};

/** 낱말 하나를 **cap = 100 좌표계**로 뜬다. 베이스라인 y=0, 글자는 y<0. */
function outline(font, word) {
  const upem = font.unitsPerEm;
  const cap = font.tables.os2?.sCapHeight
    ?? Math.max(...font.charToGlyph("H").path.commands.filter((c) => c.y !== undefined).map((c) => c.y));
  const s = 100 / cap;
  const track = (TRACK / 1000) * upem * s;
  let x = 0;
  const out = [];
  for (const ch of word) {
    const g = font.charToGlyph(ch);
    const X = (v) => x + v * s, Y = (v) => -v * s;
    for (const c of g.path.commands) {
      if (c.type === "M" || c.type === "L") out.push({ type: c.type, x: X(c.x), y: Y(c.y) });
      else if (c.type === "Q") out.push({ type: "Q", x1: X(c.x1), y1: Y(c.y1), x: X(c.x), y: Y(c.y) });
      else if (c.type === "C") out.push({ type: "C", x1: X(c.x1), y1: Y(c.y1), x2: X(c.x2), y2: Y(c.y2), x: X(c.x), y: Y(c.y) });
      else out.push({ type: "Z" });
    }
    x += g.advanceWidth * s + track;
  }
  /* ★ **마지막 글자 뒤의 자간은 뺀다** — 안 빼면 낱말이 왼쪽으로 치우쳐 보인다.
     가운데 맞춤은 「글자가 실제로 차지한 폭」을 기준으로 해야 한다. */
  return { d: pathData(out), w: x - track };
}

const font = opentype.parse(readFileSync(FONT).buffer);
const rows = Object.entries(KEYWORDS).map(([slug, word]) => {
  const o = outline(font, word);
  return `  "${slug}": { word: ${JSON.stringify(word)}, w: ${num(o.w)}, d: ${JSON.stringify(o.d)} },`;
});

writeFileSync(OUT, `/** 생성 파일 — 손으로 고치지 말 것. \`npm run make-keywords\` 가 만든다.
 *  정본은 \`scripts/make-keywords.mjs\`(활자 · 자간 · 낱말). */
export interface Keyword { word: string; w: number; d: string }

/** cap = 100 좌표계. 베이스라인 y = 0, 글자는 y < 0. \`w\` 는 낱말이 실제로 차지한 폭. */
export const KEYWORD: Record<string, Keyword> = {
${rows.join("\n")}
};
`);
console.log(`키워드 ${rows.length}개 → ${OUT}`);
for (const [slug, word] of Object.entries(KEYWORDS)) {
  const o = outline(font, word);
  console.log(`  ${slug.padEnd(18)} ${word.padEnd(8)} 폭 ${num(o.w).padStart(6)} (cap100) → cap 12px 에서 ${Math.round(o.w * 0.12)}px`);
}
