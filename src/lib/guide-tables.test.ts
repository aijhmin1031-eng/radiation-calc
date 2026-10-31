import { test } from "node:test";
import assert from "node:assert/strict";
import { layerTable, decayGrid, decayGridDays, dosingExamples, mm3, cm3, pct1, hMin, minutesTo } from "./guide-tables.ts";

/* ★ 가이드 글 두 편(/half-value-layers/, /radiopharmaceutical-decay/)의 숫자를 화면 문자열로 고정한다.
 *   글은 숫자를 글자로 적지 않고 이 함수들에서 읽으므로, 엔진·자료가 바뀌면 여기가 먼저 깨진다 —
 *   그때는 값을 고치기 전에 글의 산문(「첫 층이 다음 층보다 얇다」 등)이 아직 맞는지 다시 읽는다. */

test("반가층·십가층 표 — 납·철 mm, 콘크리트 cm (HVL/TVL/둘째 TVL)", () => {
  const want: Record<string, string> = {
    "Cs-137": "5.36/18.1/18.3 11.7/39.5/39.8 3.73/12.6/12.7",
    "Co-60": "10.3/34.4/34.6 16.5/54.8/54.9 5.20/17.3/17.3",
    "Ir-192": "2.25/9.02/13.1 8.97/30.6/32.2 3.01/10.2/10.5",
    "I-131": "2.34/8.79/13.4 8.91/30.7/32.2 2.97/10.2/10.5",
    "Tc-99m": "0.243/0.841/0.856 3.81/13.2/13.4 1.92/6.64/6.76",
    "Am-241": "0.0865/0.362/0.396 0.517/2.18/2.41 0.849/3.41/3.73",
  };
  const rows = layerTable();
  assert.deepEqual(rows.map((r) => r.k), Object.keys(want));
  for (const r of rows) {
    const got = (["lead", "iron", "concrete"] as const).map((m) => {
      const c = r.cells[m];
      const f = m === "concrete" ? cm3 : mm3;
      return `${f(c.hvlCm)}/${f(c.tvlCm)}/${f(c.tvl2Cm)}`;
    }).join(" ");
    assert.equal(got, want[r.k], r.k);
  }
});

test("굳어지는 스펙트럼 — Ir-192 납의 둘째 TVL 이 첫 TVL 보다 두껍다", () => {
  const ir = layerTable().find((r) => r.k === "Ir-192")!.cells.lead;
  assert.ok(ir.tvl2Cm > ir.tvlCm * 1.4);
});

test("Tc-99m 잔존 비율 표 — 0~12 h, 15분 간격", () => {
  const g = decayGrid("Tc-99m", 12);
  assert.equal(g.length, 13);
  assert.deepEqual(g[1].f.map(pct1), ["89.1", "86.6", "84.1", "81.7"]);
  assert.deepEqual(g[6].f.map(pct1), ["50.0", "48.6", "47.2", "45.9"]);
  assert.deepEqual(g[12].f.map(pct1), ["25.0"]);
  assert.equal(hMin(minutesTo("Tc-99m", 0.1)), "19 h 57 min");
});

test("F-18 잔존 비율 표 — 0~6 h, 15분 간격", () => {
  const g = decayGrid("F-18", 6);
  assert.equal(g.length, 7);
  assert.deepEqual(g[0].f.map(pct1), ["100.0", "91.0", "82.7", "75.3"]);
  assert.deepEqual(g[1].f.map(pct1), ["68.5", "62.3", "56.6", "51.5"]);
  assert.deepEqual(g[6].f.map(pct1), ["10.3"]);
});

test("Lu-177 잔존 비율 표 — 0~14일, 6시간 간격 (2^(-t/6.6443 d) 를 따로 계산한 값)", () => {
  /* 1 d → 90.09% · 3 d 12 h → 69.41% · 6 d 18 h → 49.45% · 7 d → 48.18% · 14 d → 23.21% */
  const g = decayGridDays("Lu-177", 14);
  assert.equal(g.length, 15);
  assert.equal(g[0].d, 0);
  assert.equal(pct1(g[0].f[0]), "100.0");
  assert.equal(pct1(g[1].f[0]), "90.1");
  assert.equal(pct1(g[3].f[2]), "69.4");
  assert.equal(pct1(g[6].f[3]), "49.5");
  assert.equal(pct1(g[7].f[0]), "48.2");
  assert.deepEqual(g[14].f.map(pct1), ["23.2"]);
  /* 9.0 GBq 가 7.4 GBq 로 — T½·log₂(9.0/7.4) = 1.8763 d = 2701.9 min. 「언제까지」라 분은 내림이다(`hMin`) */
  assert.equal(hMin(minutesTo("Lu-177", 7.4 / 9.0)), "45 h 1 min");
});

test("투여 시각 역산 예제 두 개", () => {
  const x = dosingExamples();
  assert.equal(x.tc.latest, "09:41");
  assert.equal(x.tc.span, "1 h 56 min");
  assert.equal(x.tc.at0930.toFixed(0), "756");
  assert.equal(x.tc.at1000.toFixed(0), "713");
  assert.equal(x.f18.earliest, "08:45");
  assert.equal(x.f18.latest, "09:16");
  assert.equal(x.f18.width, 31);
  assert.equal(x.f18.late45.toFixed(0), "278");
  assert.equal(x.f18.drawFor0945.toFixed(0), "492");
});
