/** 붕괴 연쇄 판정 — T13 에서 넓힌 두 가지(여러 걸음 연쇄 · 자발 핵분열 목록)를 고정한다. 쪽의 문장은 `check-progeny` 가 잰다. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { chainLeavesDataset, CHAIN_TRUNCATED, dominantProgeny } from "./decay-chain.ts";
import { SPONTANEOUS_FISSION } from "./nuclides.ts";

test("여러 걸음 연쇄 — Th-232 는 Ra-228 을 지나 이 자료 밖(Ac-228)으로 이어진다", () => {
  assert.equal(dominantProgeny("Th-232"), null, "한 걸음 판정은 Th-232 를 못 잡는다 — 그래서 넓혔다");
  assert.ok(!CHAIN_TRUNCATED.includes("Th-232"), "딸 Ra-228 이 자료에 있어 잘린 연쇄로도 안 잡힌다");
  assert.equal(chainLeavesDataset("Th-232"), true);
  for (const k of ["Ra-228", "Np-237", "Am-243", "Ra-224"]) assert.equal(chainLeavesDataset(k), true, k);
  // 실리지 않은 딸(Cm-248)의 반감기는 알 수 없어 Z 만 본다 — Cf-252 도 걸린다(그 쪽은 자발 핵분열 갈래가 먼저 정한다)
  assert.equal(chainLeavesDataset("Cf-252"), true);
});

test("여러 걸음 연쇄 — 다음 딸이 작업 눈금 안에 안 자라면 잡지 않는다", () => {
  // 다음 실린 딸이 수천 ~ 수십만 년이라 손에 쥐는 선원에 없다
  for (const k of ["U-234", "Pu-238", "Pu-240", "Cm-244", "U-233", "Th-230"]) assert.equal(chainLeavesDataset(k), false, k);
  // 딸이 안정 핵종이거나(Z < 84) 연쇄가 이 자료 안에서 끝난다
  for (const k of ["Co-60", "Cs-137", "Sr-90", "Pb-210", "Po-210"]) assert.equal(chainLeavesDataset(k), false, k);
});

test("자발 핵분열 목록 — Cf-252 · Cm-244(ENSDF 몫)", () => {
  assert.equal(SPONTANEOUS_FISSION["Cf-252"], 3.102);
  assert.equal(SPONTANEOUS_FISSION["Cm-244"], 1.37e-4);
  assert.equal(Object.keys(SPONTANEOUS_FISSION).length, 2);
});
