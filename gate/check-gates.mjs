/** 게이트 자신을 재는 게이트 — **경로를 아는 자리가 하나인지** 본다.
 *
 *  ★ 왜 이것이 필요한가: 다른 게이트는 전부 **산출물**을 잰다. 게이트를 **시작조차 못 하는
 *    실패**는 어느 게이트도 못 본다 — 2026-09-20 에 원격 컨테이너에서 `npm run gate` 가
 *    둘째 게이트에서 죽었고, playwright 가 권한 것을 따르면 **브라우저를 새로 내려받는다**.
 *    경로를 아는 자리가 **열한 곳**이고 그중 하나만 미리 깔린 것을 찾았기 때문이었다.
 *  ★ 사람이 고쳐도 되풀이될 수 있는 모양이라 자로 막는다 — 새 게이트를 쓸 때 옆 파일을
 *    베끼면 그 파일이 어느 표기를 쓰느냐에 따라 **다시 갈린다**.
 *  ★ 이것은 **정적 검사**다(브라우저를 띄우지 않는다) — 그래서 `npm run gate` 의 **맨 앞**에
 *    둔다. 크로미움을 못 찾는 상태라면 그 사실이 **첫 줄에** 뜨는 것이 맞다.
 *
 *  역테스트 둘 — ① 한 게이트를 옛 표기(`process.env.CHROMIUM_PATH` 인라인)로 되돌리면 걸린다
 *               ② `gate/chromium.mjs` 임포트를 지우면 걸린다. 둘 다 **이름을 댄다**. */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const CANON = "gate/chromium.mjs";
/** ★ **자기 자신을 세지 않는다** — 이 파일의 정규식 안에 `playwright`·`CHROMIUM_PATH` 라는
 *  글자가 들어 있어서, 안 빼면 **자를 자기 자로 재어** 늘 빨개진다(첫 실행에서 실제로 그랬다). */
const SELF = "gate/check-gates.mjs";

const files = [
  ...readdirSync(join(ROOT, "gate")).map((f) => join("gate", f)),
  ...readdirSync(join(ROOT, "scripts")).map((f) => join("scripts", f)),
].filter((f) => f.endsWith(".mjs") && f !== CANON && f !== SELF);

const fail = [];
let launchers = 0;

for (const f of files) {
  const s = readFileSync(join(ROOT, f), "utf8");
  if (!/from "playwright"/.test(s)) {
    /* playwright 를 안 쓰는 파일이 경로 환경변수를 읽으면 그것도 두 벌이다 */
    if (/PW_CHROMIUM|CHROMIUM_PATH/.test(s)) fail.push(`${f} — playwright 를 안 쓰면서 크로미움 경로 환경변수를 읽는다`);
    continue;
  }
  launchers += 1;

  /** ★★ **`includes("chromium.mjs")` 로 재면 주석이 자를 속인다** — 역테스트 ② 에서 실제로
   *  그랬다. 임포트를 지웠는데 같은 파일 주석에 「정본은 `gate/chromium.mjs`」라고 적혀 있어
   *  게이트가 **초록으로 통과했다**. 문장이 아니라 **임포트문**을 본다. */
  if (!/^import \{[^}]*\bLAUNCH\b[^}]*\} from "\.{1,2}\/(?:gate\/)?chromium\.mjs";$/m.test(s))
    fail.push(`${f} — ${CANON} 에서 LAUNCH 를 임포트하지 않는다`);
  if (/PW_CHROMIUM|CHROMIUM_PATH/.test(s)) fail.push(`${f} — 크로미움 경로를 스스로 읽는다 (정본은 ${CANON})`);

  /* 넘기는 것이 정본의 LAUNCH 인지 — 인라인 객체를 만들면 걸린다 */
  for (const m of s.matchAll(/chromium\.launch\(([^)]*)\)/g)) {
    const arg = m[1].trim();
    if (arg !== "LAUNCH") fail.push(`${f} — chromium.launch(${arg || ""}) — LAUNCH 를 넘겨야 한다`);
  }
  if (!/chromium\.launch\(/.test(s)) fail.push(`${f} — playwright 를 임포트하고 launch 를 안 부른다`);
}

console.log(`\n① 크로미움 경로 정본 — playwright 를 쓰는 파일 ${launchers}개`);
const { CHROMIUM_EXE } = await import("./chromium.mjs");
console.log(`   ${CHROMIUM_EXE ? `경로 ${CHROMIUM_EXE}` : "경로 미지정 — playwright 기본값(CI)"}`);

if (fail.length) {
  console.error(`\n❌ 게이트 자기 점검 ${fail.length}건`);
  for (const m of fail) console.error("   " + m);
  process.exit(1);
}
console.log("\n✅ 게이트 자기 점검 통과");
