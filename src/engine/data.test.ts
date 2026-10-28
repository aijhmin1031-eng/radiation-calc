import { test } from "node:test";
import assert from "node:assert/strict";
import nuc from "../data/nuclides.json" with { type: "json" };
import att from "../data/attenuation.json" with { type: "json" };
import type { NuclideMap } from "./types.ts";
import type { Row } from "./interp.ts";
import { specificActivity, emissionKinds } from "./index.ts";
const N = nuc as unknown as NuclideMap;
const A = att as unknown as Record<string, Row[]>;
const near = (g: number, w: number, pct: number, what: string) =>
  assert.ok(Math.abs(g - w) / Math.abs(w) * 100 < pct, `${what}: ${g.toPrecision(6)} vs ${w}`);

test("등록부가 비어 있지 않고 모든 항목이 온전하다", () => {
  const keys = Object.keys(N);
  assert.ok(keys.length >= 140, `핵종 수 ${keys.length}`);
  for (const [k, v] of Object.entries(N)) {
    assert.ok(v.t_half_s > 0, `${k}: 반감기`);
    assert.ok(v.a > 0 && v.z > 0, `${k}: A·Z`);
    assert.ok(v.sa_bq_g > 0 && Number.isFinite(v.sa_bq_g), `${k}: 비방사능`);
    assert.ok(v.gamma_const >= 0, `${k}: Γ 는 음수가 될 수 없다`);
    // ★ 방출자료가 없는 것도 **정상이다** — Ni-59·Ca-41·Ra-228 은 저에너지 EC·약한 β 라
    //   ENSDF 가 선을 싣지 않는다. 반감기만 있으면 붕괴·비방사능 계산에는 쓸 수 있다.
    //   다만 그런 것이 소수여야 한다(대량이면 수확이 깨진 것이다).
  }
});

test("방출자료가 없는 핵종은 소수다 — 많으면 수확이 깨진 것이다", () => {
  const empty = Object.entries(N).filter(([, v]) => emissionKinds(v).length === 0);
  assert.ok(empty.length <= 5,
    `방출자료 없는 핵종 ${empty.length}종: ${empty.map(([k]) => k).join(", ")}`);
});

test("★ EC 핵종은 Γ=0 이지만 X선을 낸다 — 분류에서 빠지면 안 된다", () => {
  for (const k of ["Fe-55", "Ge-68"]) {
    assert.ok(N[k], `${k} 없음`);
    assert.equal(N[k].gamma_const, 0, `${k}: 모든 선이 δ 아래라 Γ=0 이다`);
    assert.ok(N[k].lines.length > 0, `${k}: 선은 있어야 한다`);
    assert.ok(emissionKinds(N[k]).includes("xray"), `${k}: xray 로 분류돼야 한다`);
  }
});

test("저장된 비방사능이 반감기·몰 질량과 어긋나지 않는다", () => {
  for (const [k, v] of Object.entries(N))
    near(v.sa_bq_g, specificActivity(v.t_half_s, v.m_u), 1e-6, `비방사능(${k})`);
});

// ★★ **질량수를 넣던 자리다**(2026-09-18). 이 테스트가 `v.a` 를 쓰고 있었으므로
//   **질량수 근사가 스스로를 검증하고 있었다** — 데이터도 테스트도 같은 근사를 썼으니
//   영원히 통과한다. 근사가 0.5% 틀렸다는 것은 **바깥 자료(AME2020)를 들여야만** 보인다.
test("원자질량이 질량수와 다르다 — 근사를 되돌리면 여기서 걸린다", () => {
  const off = Object.values(N).map((v) => Math.abs(v.m_u - v.a) / v.a);
  assert.ok(Math.max(...off) > 5e-3, `최대 편차 ${Math.max(...off)}`);
  assert.ok(off.filter((r) => r > 3e-4).length > 90, "0.03% 초과 핵종 수");
});

// ★ 이 레포에서 세 번 되풀이된 버그 — 이성질체 부모가 섞여 들어온다.
//   섞이면 방출강도 합이 100% 를 크게 넘는 것으로 먼저 드러난다.
test("★ 이성질체 혼입 — 베타 방출강도 합이 105% 를 넘지 않는다", () => {
  for (const [k, v] of Object.entries(N)) {
    if (!v.beta_yield_pct) continue;
    assert.ok(v.beta_yield_pct <= 105,
      `${k}: β 방출강도 합 ${v.beta_yield_pct}% — 이성질체가 섞였을 것이다(p_energy 필터 확인)`);
  }
});

test("★ 이성질체 혼입 — 알파 방출강도 합이 105% 를 넘지 않는다", () => {
  for (const [k, v] of Object.entries(N)) {
    if (!v.alpha_yield_pct) continue;
    assert.ok(v.alpha_yield_pct <= 105, `${k}: α 방출강도 합 ${v.alpha_yield_pct}%`);
  }
});

test("베타 가지는 평균 ≤ 최대 이고 방출강도가 양수다", () => {
  for (const [k, v] of Object.entries(N))
    for (const b of v.beta ?? []) {
      assert.ok(b.i > 0, `${k}: 방출강도`);
      assert.ok(b.mean > 0, `${k}: 평균 에너지`);
      if (b.max !== null) assert.ok(b.mean <= b.max, `${k}: 평균 ${b.mean} > 최대 ${b.max}`);
    }
});

test("★ 선을 1 keV 까지 싣는다 — δ 를 데이터에 구워 넣으면 화면 손잡이가 죽는다", () => {
  const low = Object.entries(N).filter(([, v]) => v.lines.some((l) => l[0] < 20));
  assert.ok(low.length >= 10,
    `20 keV 미만 선을 가진 핵종이 ${low.length}종뿐이다 — 데이터를 잘라 저장하고 있다`);
  assert.ok(N["Am-241"].lines.some((l) => l[0] < 20), "Am-241 의 17 keV 선이 있어야 한다");
});

test("순수 베타·알파 방출체가 충분히 실려 있다", () => {
  const pure = Object.entries(N).filter(([, v]) => v.gamma_const === 0 && (v.beta || v.alpha));
  assert.ok(pure.length >= 40, `순수 방출체 ${pure.length}종`);
  for (const k of ["H-3", "C-14", "Ni-63", "Sr-90", "Y-90", "Tc-99", "Pu-241",
                   "Po-210", "Pu-242", "Cm-245", "Np-237", "I-129", "Zr-93", "Se-79"])
    assert.ok(N[k], `${k} 가 없다 — 폐기물·해체에서 실제로 세는 핵종이다`);
});

// ★★ Kβ 이중 계산(2026-10-29, scripts/clean-dataset.mjs) — 수확이 Kβ 전체 줄과 그 구성 줄(K′β1 · K′β2)을 함께 실어
//   I-125 의 Γ 가 12.5% 높았다. 일반 규칙은 원천 이름표가 있어야 서므로(수치만으로는 Kα1 ≈ Kα2 + Kβ 가 우연히 맞는다)
//   여기서는 **확인된 사례를 고정한다** — 다시 수확해 되살아나면 여기서 걸린다.
test("★ Kβ 전체 줄이 구성 줄 옆에 다시 실리지 않는다", () => {
  const has = (k: string, e: number) => N[k].lines.some((l) => Math.abs(l[0] - e) < 5e-4);
  for (const [k, total, parts] of [["I-125", 31.359, [31.093, 31.698]], ["Cs-137", 36.827, [36.482, 37.255]],
                                    ["Tl-201", 81.285, [80.316, 82.477]], ["Cd-109", 25.211, [25.03, 25.454]]] as const) {
    assert.ok(!has(k, total), `${k}: Kβ 전체 줄 ${total} keV 가 다시 실렸다 — 구성 줄과 함께 두 번 센다`);
    for (const e of parts) assert.ok(has(k, e), `${k}: 구성 줄 ${e} keV 가 없다 — 지울 것은 전체 줄이다`);
  }
  // ★ 가벼운 원소는 원천이 KB 와 K′β1 을 같은 줄로 낸다 — 그 한 줄은 지우면 안 된다(첫 판이 13줄을 지웠다)
  for (const [k, e] of [["Co-57", 7.082], ["Fe-55", 6.512], ["Mn-54", 5.966]] as const)
    assert.ok(has(k, e), `${k}: 유일한 Kβ 줄 ${e} keV 가 지워졌다`);
});

test("★ β− 가 붕괴의 주된 몫인 핵종은 β 가지를 갖는다 — 가지가 비면 사정거리 · 제동복사 표가 안 선다", () => {
  for (const k of ["Cs-137", "Ir-192", "Lu-177", "Sm-153", "Re-188", "Xe-133", "Cs-134", "Sb-124", "Eu-154", "K-40", "Au-198", "Ra-228"])
    assert.ok(N[k].beta?.length && (N[k].beta_yield_pct ?? 0) > 85, `${k}: β 가지가 없거나 몫이 작다`);
  near(N["Eu-152"].beta_yield_pct!, 27.9, 1, "Eu-152 β− 몫(나머지는 전자포획)");
});

// ★ NIST 쪽은 같은 표를 두 번 낸다(인쇄용). 자르지 않으면 표가 두 벌이 되는데
//   보간이 앞쪽에서 끝나므로 **값은 맞고 조용하다** — 에너지축 단조성으로만 드러난다.
test("감쇠계수 표가 단조 증가하는 에너지축을 갖는다 (표가 두 벌이 아니다)", () => {
  for (const [m, rows] of Object.entries(A)) {
    assert.ok(rows.length >= 30, `${m}: ${rows.length}행`);
    for (let i = 1; i < rows.length; i++)
      assert.ok(rows[i][0] >= rows[i - 1][0], `${m}: ${i}행에서 에너지가 거꾸로 간다`);
    for (const r of rows) assert.ok(r[1] > 0 && r[2] > 0, `${m}: 계수가 양수여야 한다`);
  }
});
