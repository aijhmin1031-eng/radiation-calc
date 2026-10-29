/** v1.1.0 변경 기록의 전후 값(`data/changes-1.1.0.json`) — 「후」가 지금 엔진 값과 같아야 한다. 자료가 다시 바뀌면 이 기록과
 *  쪽이 어긋나므로 여기서 멈춘다(그때는 판을 올리고 새 기록을 만든다). */
import { test } from "node:test";
import assert from "node:assert/strict";
import CHANGES from "../data/changes-1.1.0.json" with { type: "json" };
import { NUCLIDES, ATTEN } from "./nuclides.ts";
import { gammaConstant, spectrumHVL, spectrumTVL, DELTA_DEFAULT_KEV } from "../engine/index.ts";

const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);

test("변경 기록의 「후」 Γ · 납 HVL 이 지금 엔진 값과 같다", () => {
  assert.ok(CHANGES.gamma.length > 0);
  for (const r of CHANGES.gamma) {
    const n = NUCLIDES[r.key];
    assert.ok(n, r.key);
    assert.ok(rel(gammaConstant(n, ATTEN.air, DELTA_DEFAULT_KEV), r.gAfter) < 1e-6, `${r.key} Γ`);
    if (r.hvlAfter != null) assert.ok(rel(spectrumHVL(n.lines, ATTEN.air, ATTEN.lead, "lead") * 10, r.hvlAfter) < 1e-6, `${r.key} HVL`);
    if (r.tvlAfter != null) assert.ok(rel(spectrumTVL(n.lines, ATTEN.air, ATTEN.lead, "lead") * 10, r.tvlAfter) < 1e-6, `${r.key} TVL`);
  }
});

test("변경 기록 — T11 보고와 같은 규모(79줄 · 70키 · β− 27키), Co-60 은 바뀌지 않았다", () => {
  assert.equal(CHANGES.linesRemoved, 79);
  assert.equal(CHANGES.keysLinesRemoved, 70);
  assert.equal(CHANGES.linesAdded, 0);
  assert.equal(CHANGES.betaAdded.length, 27);
  for (const k of CHANGES.betaAdded) assert.ok(NUCLIDES[k].beta?.length, k);
  assert.ok(!CHANGES.gamma.some((r) => r.key === "Co-60"));
});
