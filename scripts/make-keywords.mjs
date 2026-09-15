/** 도구 키워드 낱말 — 아웃라인 좌표를 만든다(광학 자간 + 부풀린 괘선).
 *
 *  ★★ 계기(2026-09-15 소유주 지시 「키워드로 단어 하나씩 넣자. 단어 폰트는 별도로
 *    디자인하여 정성들여서.. 디테일 살려서」). 각판화 판 아래에 새기는 **도판 캡션**이다.
 *
 *  ★ **웹폰트를 불러오지 않는다.** 이 사이트는 제3자 폰트 요청이 0건이다 — 불러오면 기기마다
 *    얼굴이 달라진다. 활자에서 **윤곽을 떠서** 좌표로 굽고 커밋한다(로고와 같은 방식).
 *
 *  ★ 활자는 **Libre Caslon Text**(OFL). **1배 13px 로 네 후보를 구워 눈으로 골랐다** —
 *    EB Garamond · Playfair Display · Libre Caslon Text · Spectral. Caslon 은 이 도판들이
 *    나온 영국 책의 활자이고, **텍스트용 컷**이라 작은 크기에서 획이 죽지 않는다.
 *    Playfair 는 헤어라인이 얇아지고 EB Garamond 는 한 끗 가늘다.
 *
 *  ★★ **`toPathData` 를 쓰지 않는다.** opentype.js 2.0.0 의 `roundDecimal` 이 소수부를 문자열로
 *    이어 붙여 반올림해서, 좌표가 정수 바로 위에 떨어지면 지수 표기가 되어 **NaN** 이 되고
 *    SVG 파서가 그 자리에서 멎어 **뒤를 통째로 버린다**(자매 lab 에서 「RadMete」로 잘렸다).
 *    명령 배열을 직접 조판한다 — `num()` 이 지수 표기를 절대 내지 않고, 비유한 값이면 던진다.
 *
 *  쓰는 법: `npm run make-keywords` → `src/data/keywords.ts` 를 덮어쓴다(커밋한다).
 *  ★ Chromium 이 필요하다 — 자간을 **실측**하기 때문이다(아래 참조). CI 에서는 돌리지 않는다.
 */
import { createRequire } from "node:module";
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const require_ = createRequire(import.meta.url);
const opentype = require_("opentype.js");

const FONT = fileURLToPath(new URL(
  "../node_modules/@fontsource/libre-caslon-text/files/libre-caslon-text-latin-400-normal.woff",
  import.meta.url));
const OUT = fileURLToPath(new URL("../src/data/keywords.ts", import.meta.url));

/** 도구별 키워드 — 카드 제목이 이미 이름을 말하므로 여기서는 **핵심 기능**을 한 낱말로. */
const KEYWORDS = {
  units: "CONVERT",
  decay: "DECAY",
  "gamma-shielding": "SHIELD",
  "specific-activity": "MASS",
  mda: "DETECT",
  beta: "ABSORB",
  alara: "PLAN",
};

/* ── 조판 상수. 전부 cap = 100 좌표계다(베이스라인 y=0, 글자는 y<0). ── */
const TRACK = 120;      // 기준 자간(em/1000). 각판 캡션은 넓게 벌려야 「새긴 표제」로 읽힌다
const CLAMP = 55;       // 흰 폭 상한 — L 아래 같은 깊은 빈 곳이 면적을 독차지하지 않게
const RULE_T = 7.2;     // 괘선 최대 두께. 4.5·7.2·10 을 **12px 로 구워 비교**해 골랐다
const RULE_END = 0.16;  // × RULE_T — 끝을 0 으로 모으면 1배에서 선이 잘린 듯 보인다
const RULE_W = 0.58;    // × 낱말 폭 — 같거나 넓으면 괘선이 주인공이 된다
const RULE_Y = -126;    // 베이스라인 위. cap(100) 보다 26 더 위

const num = (v, dp = 2) => {
  if (!Number.isFinite(v)) throw new Error(`유한하지 않은 좌표: ${v}`);
  let s = v.toFixed(dp);
  if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s === "-0" ? "0" : s;
};

const pathData = (cmds) => cmds.map((c) => {
  const n = num;
  switch (c.type) {
    case "M": return `M${n(c.x)} ${n(c.y)}`;
    case "L": return `L${n(c.x)} ${n(c.y)}`;
    case "Q": return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
    case "C": return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
    case "Z": return "Z";
    default: throw new Error(`모르는 명령: ${c.type}`);
  }
}).join("");

const font = opentype.parse(readFileSync(FONT).buffer);
const upem = font.unitsPerEm;
const capUnits = font.tables.os2?.sCapHeight
  ?? Math.max(...font.charToGlyph("H").path.commands.filter((c) => c.y !== undefined).map((c) => c.y));
const S = 100 / capUnits;
const BASE_GAP = (TRACK / 1000) * upem * S;

const place = (glyph, ox) => glyph.path.commands.map((c) => {
  const X = (v) => ox + v * S, Y = (v) => -v * S;
  switch (c.type) {
    case "M": case "L": return { type: c.type, x: X(c.x), y: Y(c.y) };
    case "Q": return { type: "Q", x1: X(c.x1), y1: Y(c.y1), x: X(c.x), y: Y(c.y) };
    case "C": return { type: "C", x1: X(c.x1), y1: Y(c.y1), x2: X(c.x2), y2: Y(c.y2), x: X(c.x), y: Y(c.y) };
    case "Z": return { type: "Z" };
    default: throw new Error(`모르는 명령: ${c.type}`);
  }
});

/** ★★ 글자 윤곽을 **캔버스에 그려 스캔라인으로 읽는다.**
 *  활자의 기본 자간은 소문자 낱말용이라, 대문자를 넓게 벌리면 쌍마다 흰 면적이 들쭉날쭉하다 —
 *  `HI` 는 반듯한 기둥 둘이라 좁아 보이고 `LD` 는 L 아래가 비어 넓어 보인다.
 *  쌍마다 **흰 폭의 평균**이 같아지도록 자간을 이분법으로 푼다. 레터링 장인이 손으로 하는 보정이다. */
async function profiles(chars) {
  const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage();
  const specs = chars.map((ch) => ({ ch, d: pathData(place(font.charToGlyph(ch), 0)) }));
  const out = await page.evaluate((specs) => {
    const H = 200, PAD = 40, W = 400;           // cap100 → 200px(2배)로 그려 정밀도를 올린다
    const c = document.createElement("canvas");
    c.width = W; c.height = H + 2 * PAD;
    const x = c.getContext("2d", { willReadFrequently: true });
    return specs.map((sp) => {
      x.clearRect(0, 0, c.width, c.height);
      x.save(); x.translate(PAD, PAD + H); x.scale(2, 2);
      x.fillStyle = "#000"; x.fill(new Path2D(sp.d)); x.restore();
      const im = x.getImageData(0, 0, c.width, c.height).data;
      const left = [], right = [];
      for (let yy = PAD; yy < PAD + H; yy++) {
        let l = null, r = null;
        for (let xx = 0; xx < c.width; xx++) {
          if (im[(yy * c.width + xx) * 4 + 3] > 40) { if (l === null) l = xx; r = xx; }
        }
        left.push(l === null ? null : (l - PAD) / 2);
        right.push(r === null ? null : (r - PAD) / 2);
      }
      return { ch: sp.ch, left, right };
    });
  }, specs);
  await browser.close();
  const map = new Map();
  out.forEach((p) => { p.adv = font.charToGlyph(p.ch).advanceWidth * S; map.set(p.ch, p); });
  return map;
}

const whiteWidth = (a, b, gap) => {
  let sum = 0, n = 0;
  for (let i = 0; i < a.right.length; i++) {
    const r = a.right[i], l = b.left[i];
    if (r === null || l === null) continue;
    sum += Math.min(CLAMP, (a.adv - r) + gap + l); n++;
  }
  return n ? sum / n : 0;
};

/** 가운데가 두껍고 끝이 바늘처럼 가늘어지는 렌즈꼴 — 19세기 표제지의 관용 장식.
 *  직선 한 줄보다 **손으로 판 것**처럼 읽힌다. */
function swelledRule(W, ox, oy) {
  const t = RULE_T, e = RULE_T * RULE_END, h = W / 2, c = 0.56;
  /* ★ **절대 좌표로 낸다.** 처음에 `M x y` 뒤에 상대 경로를 이어 붙였더니 파서가 다르게 읽어
     **괘선이 통째로 사라졌다**(화면으로 잡았다 — 빌드도 통과하고 `d` 속성도 온전했다). */
  const X = (v) => num(ox + v), Y = (v) => num(oy + v);
  return `M${X(0)} ${Y(-e / 2)}`
    + `C${X(h * c * 0.55)} ${Y(-t * 0.31)} ${X(h * c)} ${Y(-t / 2)} ${X(h)} ${Y(-t / 2)}`
    + `C${X(W - h * c)} ${Y(-t / 2)} ${X(W - h * c * 0.55)} ${Y(-t * 0.31)} ${X(W)} ${Y(-e / 2)}`
    + `C${X(W - h * c * 0.55)} ${Y(t * 0.31)} ${X(W - h * c)} ${Y(t / 2)} ${X(h)} ${Y(t / 2)}`
    + `C${X(h * c)} ${Y(t / 2)} ${X(h * c * 0.55)} ${Y(t * 0.31)} ${X(0)} ${Y(e / 2)}Z`;
}

const chars = [...new Set(Object.values(KEYWORDS).join(""))];
const prof = await profiles(chars);

const rows = [];
const report = [];
for (const [slug, word] of Object.entries(KEYWORDS)) {
  const gs = [...word].map((ch) => prof.get(ch));
  /* 기준 흰 폭 = 이 낱말의 모든 쌍을 기본 자간으로 놓았을 때의 평균 */
  const pairs = gs.slice(0, -1).map((a, i) => [a, gs[i + 1]]);
  const target = pairs.reduce((t, [a, b]) => t + whiteWidth(a, b, BASE_GAP), 0) / (pairs.length || 1);
  const gaps = pairs.map(([a, b]) => {
    let lo = -40, hi = 200;
    for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2; if (whiteWidth(a, b, m) < target) lo = m; else hi = m; }
    return (lo + hi) / 2;
  });

  let x = 0; const cmds = [];
  [...word].forEach((ch, i) => {
    cmds.push(...place(font.charToGlyph(ch), x));
    /* ★ 마지막 글자 뒤에는 자간을 주지 않는다 — 주면 가운데 맞춤이 왼쪽으로 치우친다. */
    x += prof.get(ch).adv + (i < gaps.length ? gaps[i] : 0);
  });
  const w = x;

  /* 글자의 실제 경계 — `D` 처럼 둥근 글자는 베이스라인 아래로 조금 넘친다(오버슛). */
  const ys = cmds.flatMap((c) => [c.y, c.y1, c.y2].filter((v) => v !== undefined));
  const pad = 6, top = RULE_Y - RULE_T / 2 - 2, bottom = Math.max(...ys) + 2;
  const vb = `${num(-pad)} ${num(top)} ${num(w + pad * 2)} ${num(bottom - top)}`;

  const ruleW = w * RULE_W;
  rows.push(`  "${slug}": {\n    word: ${JSON.stringify(word)}, w: ${num(w)}, vb: ${JSON.stringify(vb)},\n`
    + `    rule: ${JSON.stringify(swelledRule(ruleW, (w - ruleW) / 2, RULE_Y))},\n`
    + `    d: ${JSON.stringify(pathData(cmds))},\n  },`);
  report.push({ slug, word, w, gaps, target });
}

writeFileSync(OUT, `/** 생성 파일 — 손으로 고치지 말 것. \`npm run make-keywords\` 가 만든다.
 *  정본은 \`scripts/make-keywords.mjs\`(활자 · 광학 자간 · 괘선 지오메트리). */
export interface Keyword {
  /** 낱말 자체 — 검사와 디버깅용. 화면에는 경로만 그린다. */
  word: string;
  /** 낱말이 실제로 차지한 폭(cap = 100 좌표계). */
  w: number;
  /** SVG viewBox — 괘선 위부터 글자 오버슛 아래까지. */
  vb: string;
  /** 부풀린 괘선. 이미 제자리에 놓여 있다. */
  rule: string;
  /** 글자들. 베이스라인 y = 0, 글자는 y < 0. */
  d: string;
}

export const KEYWORD: Record<string, Keyword> = {
${rows.join("\n")}
};
`);

console.log(`키워드 ${rows.length}개 → ${OUT}`);
console.log(`기준 자간 ${num(BASE_GAP, 1)} (${TRACK}/1000 em)\n`);
for (const r of report) {
  console.log(`  ${r.slug.padEnd(18)} ${r.word.padEnd(8)} 폭 ${num(r.w, 1).padStart(6)} → cap 12px 에서 ${Math.round(r.w * 0.12)}px`);
  const pairs = [...r.word].slice(0, -1).map((c, i) => `${c}${r.word[i + 1]} ${num(r.gaps[i] - BASE_GAP, 1)}`);
  console.log(`  ${" ".repeat(18)} 기본 대비 보정: ${pairs.join(" · ")}`);
}
