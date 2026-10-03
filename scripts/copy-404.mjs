/** 빌드 끝에 404 쪽을 **산출 루트**로 올린다 (2026-10-03).
 *
 *  ★★ Astro 는 `outDir`(`dist/calc`) 아래에 `404.html` 을 굽는데, Vercel 이 없는 주소에 내주는
 *    404 쪽은 **산출 루트의 `404.html`** 뿐이다(`outputDirectory: dist`). 그래서 `src/pages/404.astro`
 *    가 있어도 라이브에서는 평문 `NOT_FOUND` 가 나갔다 — 이웃 lab(RadiMeter)이 `404.astro` 를 두고도
 *    같은 평문이 나가고 있던 것이 그 증거다(2026-10-03 라이브 실측, 84 B).
 *  ★ 복사본은 그대로 쓸 수 있다 — 쪽 안의 주소는 전부 `/calc/…` 절대 경로라 어디서 열려도 맞는다.
 *  ★ 없으면 **빌드를 실패시킨다** — 조용히 넘어가면 다음에 또 평문이 나간다. `check-output` ⑧ 이 산출물에서
 *    한 번 더 잰다(복사가 누락된 빌드가 CI 를 통과하지 못하게). */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(ROOT, "dist", "calc", "404.html");
const dst = join(ROOT, "dist", "404.html");
if (!existsSync(src)) {
  console.error("❌ dist/calc/404.html 이 없다 — src/pages/404.astro 가 사라졌거나 빌드가 그것을 굽지 않았다");
  process.exit(1);
}
mkdirSync(dirname(dst), { recursive: true });
copyFileSync(src, dst);
console.log("✅ 404 쪽을 산출 루트로 올렸다 — dist/404.html (Vercel 이 없는 주소에 내주는 자리)");
