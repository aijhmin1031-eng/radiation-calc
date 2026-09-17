/** ★★ 단위환산 유효성 평가 — **케이스 정본과 엔진의 전수 대조**.
 *  기대값은 전부 `units.cases.ts` 에서 온다. 그 파일은 엔진의 값을 하나도 들여오지 않으므로
 *  이 대조는 순환이 아니다(`gate/check-validation.mjs` ②가 그 독립성을 지킨다).
 *
 *  ★ `engine/units.test.ts` 와 층이 다르다 — 저쪽은 **엔진이 스스로 일관되는지**를 보고,
 *    이쪽은 **바깥 정의와 같은지**를 본다. 저쪽만 있으면 배율이 통째로 틀려도 조용하다
 *    (2026-09-16 에 실제로 그랬다). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { convert, UNITS, exposureToAirKerma, massConcFromVolConc, volConcFromMassConc,
         type Quantity } from "../engine/units.ts";
import { UNIT_CASES, COMPOSED_CASES, BRIDGE_CASES, REFUSAL_CASES,
         BASE_UNIT, TOLERANCE } from "./units.cases.ts";

/** 상대차. 기대값이 0 이면 절대차로 본다(0 을 분모로 두지 않는다). */
const rel = (got: number, want: number) =>
  want === 0 ? Math.abs(got) : Math.abs(got - want) / Math.abs(want);

/** 관측한 상대차의 최대 — 통과 로그에 찍는다.
 *  ★ 「통과」만 찍는 게이트는 **자가 얼마나 여유 있었는지**를 숨긴다. */
let worst = 0;
let worstWhat = "—";
const near = (got: number, want: number, what: string, tol = TOLERANCE) => {
  const r = rel(got, want);
  if (r > worst) { worst = r; worstWhat = what; }
  assert.ok(r < tol, `${what}: got ${got}, hand calculation ${want}, relative difference ${r}`);
};

test("케이스 정본이 도구의 단위를 빠짐없이 덮는다", () => {
  const ids = UNIT_CASES.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, "케이스 id 가 겹친다");

  let units = 0;
  for (const q of Object.keys(UNITS) as Quantity[]) {
    assert.equal(UNITS[q].base, BASE_UNIT[q], `${q} 의 기준단위가 케이스 정본과 다르다`);
    for (const u of Object.keys(UNITS[q].u)) {
      units += 1;
      const hits = UNIT_CASES.filter((c) => c.quantity === q && c.unit === u);
      assert.equal(hits.length, 1, `${q}/${u} 의 유효성 평가 케이스가 ${hits.length} 개다`);
    }
  }
  // 반대 방향 — 케이스에만 있고 도구에는 없는 단위를 잡는다(쪽이 없는 것을 주장하게 된다)
  for (const c of UNIT_CASES)
    assert.ok(c.unit in UNITS[c.quantity].u, `케이스 ${c.id} 의 ${c.unit} 이 도구에 없다`);

  assert.equal(UNIT_CASES.length, units, "케이스 수와 단위 수가 다르다");
  console.log(`  · 단위 ${units} 개 / 케이스 ${UNIT_CASES.length} 건 — 빠짐없이 짝이 맞는다`);
});

test("★ 배수 44개 — 손계산과 엔진이 같다", () => {
  for (const c of UNIT_CASES)
    near(convert(1, c.unit, BASE_UNIT[c.quantity], c.quantity), c.factor,
         `${c.id} 1 ${c.unit} → ${BASE_UNIT[c.quantity]}`);
  console.log(`  · 배수 ${UNIT_CASES.length} 건 전건 일치`);
});

/* ★★ **여기가 이 파일의 핵심이다.** 배수 44개를 손으로 확인했으므로, 같은 군 안의 순서쌍은
   그 배수들의 비로 전부 따라온다 — 그 논증이 실제로 성립하는지를 **표본이 아니라 전수**로 잰다.
   엔진은 자기 상수표로, 우리는 원문에서 옮긴 리터럴로 같은 수를 만들어 맞대 본다. */
test("★ 같은 군 안의 순서쌍 전수 — 기대값은 손계산 배수의 비다", () => {
  let pairs = 0;
  for (const q of Object.keys(UNITS) as Quantity[]) {
    const cases = UNIT_CASES.filter((c) => c.quantity === q);
    for (const a of cases)
      for (const b of cases) {
        if (a.unit === b.unit) continue;
        pairs += 1;
        near(convert(1, a.unit, b.unit, q), a.factor / b.factor, `${a.unit} → ${b.unit} (${q})`);
      }
  }
  console.log(`  · 순서쌍 ${pairs} 건 전건 일치`);
  assert.equal(pairs, 276, "순서쌍 수가 달라졌다 — 단위가 늘거나 줄었다면 쪽의 커버리지 문장도 고친다");
});

test("★ 값이 실려도 같다 — 환산은 입력에 선형이다", () => {
  for (const v of [0, 1, 7.3, 1234.5, 1e-9, 9.87e12])
    for (const q of Object.keys(UNITS) as Quantity[]) {
      const cases = UNIT_CASES.filter((c) => c.quantity === q);
      for (const a of cases)
        for (const b of cases) {
          if (a.unit === b.unit) continue;
          near(convert(v, a.unit, b.unit, q), (v * a.factor) / b.factor, `${v} ${a.unit} → ${b.unit}`);
        }
    }
});

test("★ 합성 환산 — 끝에서 끝까지 손계산과 같다", () => {
  for (const c of COMPOSED_CASES)
    near(convert(c.value, c.from, c.to, c.quantity), c.expect,
         `${c.id} ${c.value} ${c.from} → ${c.to}`);
  console.log(`  · 합성 ${COMPOSED_CASES.length} 건 전건 일치`);
});

test("★ 환산이 아닌 단계 — 화면이 내는 수와 손계산을 맞댄다", () => {
  for (const c of BRIDGE_CASES) {
    let got: number;
    if (c.kind === "exposureToAirKerma")
      // 화면이 그리는 수와 같은 식이다 — mGy 로 낸다
      got = exposureToAirKerma(convert(c.input.value, c.input.from, "C/kg", "exposure")) * 1000;
    else if (c.kind === "massFromVol")
      got = massConcFromVolConc(convert(c.input.value, c.input.from, "Bq/L", "volConc"),
                                c.input.density) * 1000;
    else
      got = volConcFromMassConc(convert(c.input.value, c.input.from, "Bq/g", "massConc"),
                                c.input.density);
    near(got, c.expect, `${c.id} ${c.title}`);
  }
  console.log(`  · 물리 단계 ${BRIDGE_CASES.length} 건 전건 일치`);
});

test("★ 거부 동작 — 막아야 할 자리에서 조용한 수를 내지 않는다", () => {
  for (const c of REFUSAL_CASES) {
    const got = c.kind === "convert"
      ? convert(c.call!.value, c.call!.from, c.call!.to, c.call!.quantity)
      : massConcFromVolConc(1, c.density);
    assert.ok(Number.isNaN(got), `${c.id} ${c.title}: NaN 이어야 하는데 ${got} 이 나왔다`);
  }
  console.log(`  · 거부 ${REFUSAL_CASES.length} 건 전건 NaN`);
});

test("관측한 최대 상대차를 남긴다", () => {
  console.log(`  · 최대 상대차 ${worst.toExponential(3)} (${worstWhat}) — 합격기준 ${TOLERANCE}`);
  assert.ok(worst < TOLERANCE, "합격기준을 넘었다");
});
