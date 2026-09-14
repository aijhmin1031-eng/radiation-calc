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

test("저장된 비방사능이 반감기·질량수와 어긋나지 않는다", () => {
  for (const [k, v] of Object.entries(N))
    near(v.sa_bq_g, specificActivity(v.t_half_s, v.a), 1e-6, `비방사능(${k})`);
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
