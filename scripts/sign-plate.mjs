/**
 * 본문 삽화에 **도면 서명란**을 합성한다.
 *
 * ★★ **글자를 모델에게 맡기지 않는다**(정본 규칙). 생성 모델은 로고와 글자를 반드시
 *   뭉갠다 — 마크도 낱말도 여기서 **우리가 그려 얹는다.**
 * ★ 떠 있는 워터마크가 아니라 **서명란**이다. 이 판들은 연필 제도(製圖) 언어라,
 *   도면 귀퉁이의 표제란이 그 언어 안에 있고 떠 있는 로고는 밖에 있다.
 * ★★ **마크를 흑연 한 색으로 쓴다.** 파비콘의 마크는 기준선이 앰버인데, 판 안에서
 *   앰버는 **뜻을 가진 색**이다(정지점). 서명란에 두 번째 앰버가 생기면 읽는 사람이
 *   거기서 뜻을 찾는다 — DESIGN 규칙(앰버는 활성·포커스·기준선 전용)의 취지다.
 * ★ 다크에서 판 전체에 `brightness(.78)` 이 걸리므로(global.css) 서명도 함께 어두워진다.
 *   그래서 흑연을 충분히 진하게 쓴다 — 옅게 넣으면 다크에서 사라진다.
 *
 * ★ **원본을 레포에 둔다** — `art/plates/<이름>-raw.png`. `public/` 밖이라 서비스되지
 *   않고, 생성은 되풀이할 수 없으므로(같은 프롬프트가 같은 그림을 주지 않는다) 원본이
 *   없으면 서명을 고칠 때마다 새로 뽑아야 한다. 산출물은 `public/img/plates/` 의 webp 둘.
 *
 * 쓰기: node scripts/sign-plate.mjs <이름>
 *   art/plates/<이름>-raw.png → public/img/plates/<이름>.webp + <이름>-768.webp
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [name] = process.argv.slice(2);
if (!name) { console.error("쓰기: node scripts/sign-plate.mjs <이름>"); process.exit(1); }
const src = join(ROOT, `art/plates/${name}-raw.png`);

const FONT = "/home/user/radiation-lab/public/fonts/saira-600.woff2";
const b64 = (p) => readFileSync(p).toString("base64");

const W = 1536, H = 1024;
const html = `<!doctype html><meta charset="utf-8"><style>
@font-face { font-family: Saira; src: url(data:font/woff2;base64,${b64(FONT)}) format("woff2"); font-weight: 600 }
* { margin:0; padding:0; box-sizing:border-box }
body { width:${W}px; height:${H}px; position:relative; background:#fff }
img { width:100%; height:100%; display:block }
/* 서명란 — 오른쪽 아래. 얇은 윗선 + 마크 + 이름 + 주소. 도면 표제란의 최소형이다. */
.sig { position:absolute; right:34px; bottom:28px; display:flex; align-items:center; gap:11px;
       padding-top:9px; border-top:1px solid rgba(28,29,32,.34) }
.sig svg { width:26px; height:26px; display:block; opacity:.72 }
.t { font-family:Saira, sans-serif; font-weight:600; line-height:1.15; color:#1c1d20 }
.n { font-size:17px; letter-spacing:.01em; opacity:.80 }
.u { font-size:11.5px; letter-spacing:.055em; opacity:.52; margin-top:2px }
</style>
<img src="data:image/png;base64,${b64(resolve(src))}">
<div class="sig">
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <path fill="#1c1d20" d="M8 52 C 20 52, 26 40, 30 28 C 34 16, 40 10, 56 10 L 56 16 C 44 16, 39 20, 35 31 C 30 45, 22 58, 8 58 Z"/>
    <rect fill="#1c1d20" x="6" y="44" width="52" height="3.5" rx="1.75" opacity=".55"/>
  </svg>
  <div class="t"><div class="n">RadCalc</div><div class="u">RADIATION-LAB.COM</div></div>
</div>`;

const out = join(ROOT, "public/img/plates");
mkdirSync(out, { recursive: true });
const tmp = join(ROOT, ".sign.html");
writeFileSync(tmp, html);

const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await p.goto("file://" + tmp);
await p.evaluate(() => document.fonts.ready);
const shot = await p.screenshot({ type: "png" });
/* ★ 브라우저 안에는 이 파일의 변수가 없다 — 치수는 인자로 건넨다. */
const box = await p.$eval(".sig", (e, d) => { const r = e.getBoundingClientRect();
  return { w: Math.round(r.width), h: Math.round(r.height),
           right: Math.round(d.W - r.right), bottom: Math.round(d.H - r.bottom) }; }, { W, H });
await b.close();

writeFileSync(join(ROOT, ".signed.png"), shot);
const { execFileSync } = await import("node:child_process");
execFileSync("python3", ["-c", `
from PIL import Image
im = Image.open(${JSON.stringify(join(ROOT, ".signed.png"))}).convert("RGB")
import os
for w in (${W}, 768):
    o = im if w == im.width else im.resize((w, round(im.height*w/im.width)), Image.LANCZOS)
    n = ${JSON.stringify(out)} + "/${name}" + ("" if w == ${W} else "-768") + ".webp"
    o.save(n, "WEBP", quality=82, method=6)
    print("  %-52s %s  %s bytes" % (n, o.size, f"{os.path.getsize(n):,}"))
`], { stdio: "inherit" });
console.log(`  서명란 ${box.w}×${box.h}px · 오른쪽 ${box.right} · 아래 ${box.bottom} · 이미지 폭의 ${(box.w / W * 100).toFixed(1)}%`);
