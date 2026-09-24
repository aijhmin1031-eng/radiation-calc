/**
 * 사이트맵의 `lastmod` — **쪽마다 그 내용이 마지막으로 바뀐 커밋 날짜**를 준다.
 *
 * ★★ **빌드 시각을 전 쪽에 똑같이 박지 않는다.** 그것은 사실이 아니고, 구글은 믿을 수 없는
 *    `lastmod` 를 **무시한다** — 하나가 거짓이면 넣은 것 전부가 무효가 된다.
 * ★★ **없으면 지어내지 않는다.** git 이 없는 빌드 환경에서는 `lastmod` 를 한 줄도 쓰지 않고,
 *    닿지 않는 주소도 비운다. 부분 `lastmod` 는 정상이다(크롤러는 주소마다 따로 읽는다).
 * ★★★ **얕은 클론(shallow)을 가려낸다.** 경계 커밋보다 오래된 변경은 전부 그 한 커밋으로
 *    뭉쳐 보여, 그대로 쓰면 **「전부 최근에 바뀌었다」는 거짓말**이 된다(2026-09-23 실측:
 *    RadiMeter 에서 33쪽 중 17쪽이 실제보다 5~10일 최신으로 나왔다). 경계 SHA 에 걸린
 *    파일은 **「모른다」로 버린다.**
 *
 * ★ **이 파일은 RadiMeter(`web/src/lib/lastmod.mjs`)와 같은 판단을 따로 둔 것이다** —
 *   레포가 갈려 있어 공유할 자리가 없다(`brand.ts` 처럼 한 레포 안을 도는 정본이 아니다).
 *   한쪽의 판단을 바꾸면 **양쪽을 함께 고친다.**
 *
 * ★ **무엇을 「그 쪽의 내용」으로 보는가**: 붙박이 쪽은 그 `.astro` 한 장, 핵종 낱장은
 *   **생성의 원천 셋**(데이터·산문 생성기·제목 생성기·라우트 본문). 핵종 낱장은 사람이 쓴
 *   글이 아니라 **생성물**이라 생성기가 바뀌면 147장의 글이 실제로 바뀐다 — 그래서 센다.
 *   틀(레이아웃·공통 컴포넌트)은 일부러 세지 않는다.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const git = (a) =>
  execFileSync("git", a, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"] });

function gitDates() {
  let out;
  try {
    // 한 번의 호출로 이력 전체를 받는다. 로그는 최신순이므로 **처음 본 커밋**이 마지막 변경이다.
    out = git(["log", "--name-only", "--format=%x00%H %cI", "--", "."]);
  } catch {
    return null;
  }
  let boundary = new Set();
  try {
    boundary = new Set(
      git(["rev-parse", "--is-shallow-repository"]).trim() === "true"
        ? readFileSync(join(ROOT, ".git/shallow"), "utf8").split("\n").map((x) => x.trim()).filter(Boolean)
        : [],
    );
  } catch { /* 얕지 않거나 .git 이 워크트리 파일이다 — 경계 없음 */ }

  const by = new Map();
  let sha = null, date = null;
  for (const line of out.split("\n")) {
    if (line.startsWith("\u0000")) {
      const [h, d] = line.slice(1).trim().split(" ");
      sha = h; date = d;
      continue;
    }
    const f = line.trim();
    if (!f || !date || by.has(f)) continue;
    by.set(f, boundary.has(sha) ? null : date);
  }
  return by.size ? by : null;
}

const DATES = gitDates();
const rel = (abs) => relative(ROOT, abs).split("\\").join("/");

function newest(paths) {
  if (!DATES) return null;
  let best = null;
  for (const p of paths) {
    const d = DATES.get(rel(p));
    if (d && (!best || d > best)) best = d;
  }
  return best;
}

const page = (...p) => join(ROOT, "src/pages", ...p);

/** 핵종 낱장 147장의 원천 — 데이터와 **생성기들**. */
const NUCLIDE_SOURCES = [
  join(ROOT, "src/data/nuclides.json"),
  join(ROOT, "src/lib/nuclide-prose.ts"),
  join(ROOT, "src/lib/nuclide-seo.ts"),
  page("nuclides/[slug].astro"),
];

/**
 * base 를 뗀 정본 경로(`/nuclides/co-60/`)를 받아 ISO 날짜나 `null` 을 돌려준다.
 * ★ 새 라우트를 만들면 여기에 한 줄 는다 — 안 늘리면 그 쪽만 `lastmod` 가 빠진다(거짓은 안 나간다).
 *   게이트가 깊은 클론에서 **전수**를 요구하므로 빠뜨린 것은 CI 에서 걸린다.
 * ★★ **갓 만든 쪽은 첫 커밋 전까지 `check-lastmod` 를 통과하지 못한다**(2026-09-24 실측).
 *   매핑이 틀려서가 아니라 **git 에 그 파일의 날짜가 아직 없기 때문**이다 — 커밋하면 풀린다.
 *   **지어내서 메우지 않는다**: 없는 날짜를 만들면 이 파일이 막으려는 바로 그 거짓이 된다.
 *   새 쪽을 세울 때는 **커밋한 뒤 게이트를 다시 돌리는 것**이 순서다.
 */
export function lastmodFor(path) {
  const seg = path.replace(/^\/|\/$/g, "").split("/").filter(Boolean);

  if (seg.length === 0) return newest([page("index.astro")]);

  if (seg[0] === "nuclides")
    return seg.length === 1
      ? newest([page("nuclides/index.astro"), join(ROOT, "src/data/nuclides.json")])
      : newest(NUCLIDE_SOURCES);

  if (seg[0] === "validation")
    return newest([page("validation", `${seg[1] ?? "index"}.astro`)]);

  if (seg.length === 1) return newest([page(`${seg[0]}.astro`)]);

  return null;
}

/** git 이 있었는가 — 빌드 로그가 「왜 비었는지」를 말할 수 있게 한다. */
export const HAS_GIT = DATES !== null;
