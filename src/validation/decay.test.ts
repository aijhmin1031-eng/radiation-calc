/** ★★ 붕괴 계산기 유효성 평가 — 케이스 정본과 엔진의 대조.
 *  ★ 층을 갈라 잰다: ① 수학 항등식(정확) ② 반감기(측정값 — 불확도로 판정)
 *    ③ 끝에서 끝까지 산술 ④ 거부 동작 ⑤ 해 규약. 섞으면 어느 층이 틀렸는지 알 수 없다. */
import { test } from "node:test";
import assert from "node:assert/strict";
import nuc from "../data/nuclides.json" with { type: "json" };
import type { NuclideMap } from "../engine/types.ts";
import { decayActivity, elapsedFromRatio, halfLifeFromTwoPoints, lambda } from "../engine/decay.ts";
import { TIME_S } from "../engine/constants.ts";
import {
  IDENTITY_CASES, HALF_LIVES_S, HALFLIFE_REFS, WORKED_CASES, REFUSAL_CASES, YEAR_CASE, YEAR_S,
  refSeconds, refUncSeconds, TOLERANCE_IDENTITY, TOLERANCE_WORKED, SIGMA_LIMIT,
} from "./decay.cases.ts";

const N = nuc as unknown as NuclideMap;
/* ★★ **도구가 실제로 쓰는 상수를 읽는다 — 사본을 두지 않는다**(2026-09-17).
   처음에는 여기에 `365.2425 * 86400` 을 적어 두고 그것과 견주었는데, 역테스트로 화면의 해를
   율리우스년으로 바꿔 보니 **테스트도 게이트도 안 걸렸다** — 테스트는 자기 사본과 비교하고 있었고,
   화면 실측은 4자리 표시라 0.002% 가 묻혔다. 「무엇과 비교하는가」를 틀리면 검사가 죽는다. */
const TIME_Y = TIME_S.y;
const UNIT_S: Record<string, number> = { s: 1, min: 60, h: 3600, d: 86400, y: TIME_Y };

const rel = (g: number, w: number) => (w === 0 ? Math.abs(g) : Math.abs(g - w) / Math.abs(w));
let worstId = 0, worstIdWhat = "—";
const near = (g: number, w: number, what: string, tol: number) => {
  const r = rel(g, w);
  if (tol === TOLERANCE_IDENTITY && r > worstId) { worstId = r; worstIdWhat = what; }
  assert.ok(r < tol, `${what}: 도구 ${g}, 손계산 ${w}, 상대차 ${r} (허용 ${tol})`);
};

/* ───────── ① 항등식 — 반감기가 무엇이든 성립해야 한다 ───────── */
test("★ 항등식 — 17자릿수에 걸친 반감기 다섯에서 전부", () => {
  let checks = 0;
  for (const c of IDENTITY_CASES)
    for (const T of HALF_LIVES_S) {
      checks += 1;
      const what = `${c.id} ${c.title} @T½=${T}s`;
      if (c.kind === "remaining")
        near(decayActivity(1, T, c.halves! * T), c.expect, what, TOLERANCE_IDENTITY);
      else if (c.kind === "lambda")
        near(lambda(T) * T, c.expect, what, TOLERANCE_IDENTITY);
      else if (c.kind === "elapsed")
        near(elapsedFromRatio(c.ratio!, T) / T, c.expect, what, TOLERANCE_IDENTITY);
      else if (c.kind === "halfLife")
        // A₁ = A₀·2^(−halves) 를 **정확한 분수로** 준다 — 엔진으로 만들면 순환이 된다
        near(halfLifeFromTwoPoints(1, 2 ** -c.halves!, 1000) / 1000, c.expect, what, TOLERANCE_IDENTITY);
      else if (c.kind === "multiplicative") {
        const t1 = c.halves! * T, t2 = 0.8 * T;
        const once = decayActivity(1, T, t1 + t2);
        const twice = decayActivity(decayActivity(1, T, t1), T, t2);
        near(once / twice, c.expect, what, TOLERANCE_IDENTITY);
      } else {
        const t = c.halves! * T;
        near(elapsedFromRatio(decayActivity(1, T, t), T) / t, c.expect, what, TOLERANCE_IDENTITY);
      }
    }
  console.log(`  · 항등식 ${IDENTITY_CASES.length}종 × 반감기 ${HALF_LIVES_S.length}개 = ${checks}건 · 최대 상대차 ${worstId.toExponential(3)} (${worstIdWhat})`);
});

/* ───────── ② 반감기 — 독립 평가(DDEP)와 얼마나 벌어지는가 ───────── */
test("★ 반감기 — DDEP 표준불확도의 3배 안에 든다", () => {
  const sig: [string, number, number][] = [];
  for (const r of HALFLIFE_REFS) {
    const n = N[r.nuclide];
    assert.ok(n, `${r.nuclide} 가 자료에 없다 — 보고서가 없는 핵종을 평가했다고 주장하게 된다`);
    const ref = refSeconds(r), u = refUncSeconds(r);
    assert.ok(u > 0, `${r.id} 의 불확도가 0 이다 — σ 판정이 성립하지 않는다`);
    const s = Math.abs(n.t_half_s - ref) / u;
    sig.push([r.nuclide, s, (n.t_half_s - ref) / ref * 100]);
    assert.ok(s < SIGMA_LIMIT,
      `${r.id} ${r.nuclide}: 우리 ${n.t_half_s} s · DDEP ${ref} ± ${u} s · ${s.toFixed(2)}σ (한도 ${SIGMA_LIMIT}σ)`);
  }
  sig.sort((a, b) => b[1] - a[1]);
  const med = [...sig].map((x) => Math.abs(x[2])).sort((a, b) => a - b)[Math.floor(sig.length / 2)];
  console.log(`  · 반감기 ${HALFLIFE_REFS.length}종 · 최대 ${sig[0][1].toFixed(2)}σ (${sig[0][0]}, ${sig[0][2].toFixed(4)}%) · 중앙값 |차이| ${med.toFixed(4)}%`);
});

/* ───────── ③ 끝에서 끝까지 ───────── */
test("★ 손계산 케이스 — 화면의 세 갈래를 하나씩", () => {
  for (const c of WORKED_CASES) {
    const T = N[c.nuclide].t_half_s;
    const secs = (c.input.t ?? 0) * UNIT_S[c.input.tu ?? "s"];
    let got: number;
    if (c.mode === "remaining") got = decayActivity(c.input.a0, T, secs);
    else if (c.mode === "when") got = elapsedFromRatio(c.input.target! / c.input.a0, T);
    else got = halfLifeFromTwoPoints(c.input.a0, c.input.a1!, secs);
    near(got, c.expect, `${c.id} ${c.mode}`, TOLERANCE_WORKED);

    // 도구가 함께 그리는 검산용 수치도 같이 잰다 — 으뜸 답만 보면 그 자리가 시야 밖이다
    const second = c.secondary.kind === "halves"
      ? (c.mode === "when" ? got / T : secs / T)
      : ((got - T) / T) * 100;
    near(second, c.secondary.expect, `${c.id} ${c.secondary.kind}`, TOLERANCE_WORKED);
  }
  console.log(`  · 손계산 ${WORKED_CASES.length}건 (으뜸 답 + 검산 수치)`);
});

/* ───────── ④ 거부 동작 ───────── */
test("★ 거부 — 답이 없는 자리에서 수를 내지 않는다", () => {
  for (const c of REFUSAL_CASES) {
    const got = c.kind === "elapsed"
      ? elapsedFromRatio(c.ratio!, 1000)
      : halfLifeFromTwoPoints(c.two![0], c.two![1], c.two![2]);
    assert.ok(Number.isNaN(got), `${c.id} ${c.title}: NaN 이어야 하는데 ${got} 이 나왔다`);
  }
  console.log(`  · 거부 ${REFUSAL_CASES.length}건 전건 NaN`);
});

/* ───────── ⑤ 해 규약 — 자료의 해와 화면의 해가 같은 해인가 ───────── */
test("★ 자료의 초와 도구의 연 입력이 같은 해를 쓴다", () => {
  const rows = YEAR_CASE.nuclides.map((k) => {
    const r = HALFLIFE_REFS.find((x) => x.nuclide === k)!;
    const ours = N[k].t_half_s;
    return {
      k,
      greg: Math.abs(ours - refSeconds(r, YEAR_S.gregorian)) / refSeconds(r, YEAR_S.gregorian),
      jul: Math.abs(ours - refSeconds(r, YEAR_S.julian)) / refSeconds(r, YEAR_S.julian),
    };
  });
  for (const r of rows) {
    assert.ok(r.greg < YEAR_CASE.tolerance,
      `${r.k}: 그레고리력으로 맞춰도 ${r.greg.toExponential(2)} 벌어진다 — 자료의 해 규약이 바뀌었을 수 있다`);
    assert.ok(r.jul > r.greg * 5,
      `${r.k}: 두 규약이 구별되지 않는다 (그레고리 ${r.greg.toExponential(2)} · 율리우스 ${r.jul.toExponential(2)}) — 이 검사가 죽었다`);
  }
  // 화면의 연 입력이 자료와 같은 해인가 — 여기가 어긋나면 「5 y」가 자료의 5 년이 아니다
  assert.equal(TIME_Y, YEAR_S.gregorian,
    "도구가 쓰는 해가 자료의 해와 다르다 — engine/constants.ts 의 TIME_S.y 를 본다");
  const g = Math.max(...rows.map((r) => r.greg)), j = Math.min(...rows.map((r) => r.jul));
  console.log(`  · 해 규약 — 그레고리력 잔차 ≤ ${g.toExponential(2)} · 율리우스년이면 ≥ ${j.toExponential(2)} · 화면의 연 ${TIME_Y} s`);
});
