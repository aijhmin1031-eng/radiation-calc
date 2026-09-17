import { test } from "node:test";
import assert from "node:assert/strict";
import { ALL_KEYS, NUCLIDES, nuclidePage } from "./nuclides.ts";
import { nuclideSeo, gammaLeadsFor, TITLE_MAX, DESC_MAX, DESC_MIN } from "./nuclide-seo.ts";

const ROWS = ALL_KEYS.map((key) => ({ key, p: nuclidePage(key), seo: nuclideSeo(nuclidePage(key)) }));

test("제목·설명이 검색 결과에서 잘리지 않는다", () => {
  /* ★ 잘린 제목은 **없는 것보다 나쁘다** — 문장이 끊긴 채 나간다. 그전 판은 58자였고
     브랜드 접미사까지 68자라 이미 잘리고 있었다. 자료가 늘어도 이 검사가 먼저 깨진다. */
  for (const { key, seo } of ROWS) {
    assert.ok(seo.title.length <= TITLE_MAX, `${key} 제목 ${seo.title.length}자 > ${TITLE_MAX}: ${seo.title}`);
    assert.ok(seo.description.length <= DESC_MAX, `${key} 설명 ${seo.description.length}자 > ${DESC_MAX}`);
    assert.ok(seo.description.length >= DESC_MIN, `${key} 설명 ${seo.description.length}자 < ${DESC_MIN} — 너무 얇다`);
  }
});

test("★ 없는 것을 광고하지 않는다 — 감마를 앞세운 쪽만 반가층을 말한다", () => {
  /* ★★ 이 lab 이 `Saved` 와 프리필에서 두 번 밟은 자리다. 제목이 약속한 것을 쪽이
     안 들고 있으면 찾아온 사람은 없는 것을 찾는다. 여기서는 **반대 방향**도 막는다 —
     감마가 0 인 핵종이 감마 각을 받는 일이 없어야 한다. */
  for (const { key, p, seo } of ROWS) {
    if (seo.angle !== "gamma") {
      assert.ok(!/half-value layer/i.test(seo.title), `${key}: 감마 각이 아닌데 제목이 반가층을 말한다`);
      assert.ok(!/Γ =/.test(seo.description), `${key}: 감마 각이 아닌데 설명이 Γ 를 든다`);
    } else {
      assert.ok(p.gamma > 0, `${key}: Γ 가 0 인데 감마 각을 받았다`);
      assert.ok(p.shields.length > 0, `${key}: 반가층을 말하는데 쪽에 차폐 표가 없다`);
    }
    if (seo.angle === "beta") assert.ok(NUCLIDES[key].beta?.length, `${key}: 베타 각인데 베타 가지가 없다`);
    if (seo.angle === "alpha") assert.ok(NUCLIDES[key].alpha?.length, `${key}: 알파 각인데 알파 선이 없다`);
  }
});

test("★ Γ > 0 을 제목의 자로 쓰지 않는다 — Pu-239 가 드러낸 자리", () => {
  /* ★★ Pu-239 의 Γ 는 8.23e-6 로 0 보다 크지만 아무도 Pu-239 를 감마로 막지 않는다.
     아래 두 목록은 **측정으로 갈린 것**이고(Cs-137 의 1/1000), 자료가 바뀌어 선을 넘나들면
     이 검사가 알려 준다 — 조용히 옮겨 가지 않게 한다. */
  const LEADS = ["Cs-137", "Co-60", "Ir-192", "Am-241", "U-235", "Ra-223", "Ra-226"];
  const TRAILS = ["Pu-239", "Pu-238", "Pu-240", "U-238", "U-234", "Cm-244", "Th-232", "Pm-147", "Sr-89", "Cl-36"];
  for (const k of LEADS) {
    assert.ok(gammaLeadsFor(k), `${k}: 감마로 재고 감마로 막는 핵종인데 감마가 앞서지 않는다`);
    assert.equal(nuclideSeo(nuclidePage(k)).angle, "gamma", `${k}: 제목 각이 gamma 가 아니다`);
  }
  for (const k of TRAILS) {
    assert.ok(nuclidePage(k).gamma > 0, `${k}: 이 검사의 전제는 Γ > 0 인데 0 이다`);
    assert.ok(!gammaLeadsFor(k), `${k}: Γ 가 Cs-137 의 1/1000 미만인데 감마가 앞선다`);
    assert.notEqual(nuclideSeo(nuclidePage(k)).angle, "gamma", `${k}: 감마를 앞세우면 안 된다`);
  }
});

test("제목이 핵종 이름으로 시작하고 147장이 서로 다르다", () => {
  const seen = new Map<string, string>();
  for (const { key, seo } of ROWS) {
    assert.ok(seo.title.startsWith(`${key} `), `${key}: 제목이 핵종으로 시작하지 않는다 — ${seo.title}`);
    assert.ok(seo.description.includes(`(${key})`), `${key}: 설명에 핵종 기호가 없다`);
    const prev = seen.get(seo.title);
    assert.equal(prev, undefined, `제목이 겹친다: ${key} 와 ${prev}`);
    seen.set(seo.title, key);
  }
  assert.equal(seen.size, ALL_KEYS.length);
});

test("★ 네 각이 전부 쓰인다 — 하나로 뭉개지면 겨냥이 사라진다", () => {
  /* ★ 틀이 넷인 것은 의도다(쪽마다 손으로 적지 않는다). 위험은 **넷이 하나로 주저앉는 것**
     이다 — 그러면 147장이 같은 말을 하고, 이웃 lab 이 애드센스에서 밟은 실패로 돌아간다. */
  const count = new Map<string, number>();
  for (const { seo } of ROWS) count.set(seo.angle, (count.get(seo.angle) ?? 0) + 1);
  for (const a of ["gamma", "beta", "alpha", "plain"])
    assert.ok((count.get(a) ?? 0) > 0, `${a} 각을 쓰는 쪽이 하나도 없다`);
  const biggest = Math.max(...count.values());
  assert.ok(biggest < ALL_KEYS.length, "한 각이 147장을 전부 먹었다");
});
