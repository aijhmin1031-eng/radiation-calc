import { test } from "node:test";
import assert from "node:assert/strict";
import { decayExamples, luExamples, mdaExamples, lcWithRatio, ldWithRatio } from "./note-examples.ts";
import { decayGridDays, pct1 } from "./guide-tables.ts";
import { ARTICLES, ARTICLES_NEWEST } from "./articles.ts";
import { minimumDetectableActivity } from "../engine/mda.ts";

/* ★ `/notes/` 글 세 편의 숫자를 **화면에 찍히는 글자**로 고정한다. 글자는 전부 자료의 반감기로 따로 손계산한 값이다
 *   (대조표는 PR 보고). 엔진 · 자료가 움직이면 여기가 먼저 깨진다. 그때는 값을 고치기 전에 글의 산문이 아직 맞는지 다시 읽는다. */
const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps * Math.max(1, Math.abs(b)), `${a} ≉ ${b}`);

test("붕괴 — n 반감기 표는 2^(−n) 이다", () => {
  const { ladder } = decayExamples();
  assert.deepEqual(ladder.map((r) => r.pct.toPrecision(3)),
    ["70.7", "50.0", "35.4", "25.0", "12.5", "6.25", "3.13", "0.781", "0.0977"]);
  assert.deepEqual(ladder.filter((r) => Number.isInteger(r.n)).map((r) => r.exact),
    ["1/2", "1/4", "1/8", "1/16", "1/32", "1/128", "1/1024"]);
});

test("붕괴 — Ra-228: 문제의 5.8 y 는 1/8, 평가값 5.75 y 는 12.3%", () => {
  const { ra } = decayExamples();
  assert.equal(ra.givenPct.toFixed(1), "12.5");
  assert.equal(ra.pct.toFixed(1), "12.3");
  assert.equal(ra.n.toFixed(3), "3.026");
  assert.equal((ra.pct / 100).toFixed(4), "0.1228");
  assert.equal(ra.gap.toFixed(2), "0.22");
  assert.equal(ra.onePctY.toFixed(1), "38.2");      // 5.75 × log₂100
  assert.equal(ra.thY.toFixed(2), "1.91");
  assert.equal(ra.lowPct.toFixed(1), "12.1");       // 2^(−17.4/5.72)
  assert.equal(ra.highPct.toFixed(1), "12.4");      // 2^(−17.4/5.78)
  near(ra.pct, ra.ratioFromGiven, 1e-5);             // 엔진(자료 초)과 2^(−17.4/5.75) 가 같은 답이다
});

test("붕괴 — Cs-137 370 kBq, 2016-06-01 → 2026-11-01", () => {
  const { cs } = decayExamples();
  assert.equal(cs.days, 3805);
  assert.equal(cs.years.toFixed(3), "10.418");
  assert.equal(cs.halfLifeY.toFixed(2), "30.08");
  assert.equal((cs.years / cs.halfLifeY).toFixed(4), "0.3463");
  assert.equal(cs.f.toFixed(4), "0.7866");
  assert.equal(cs.kBq.toFixed(0), "291");
  assert.equal(cs.lostPct.toFixed(1), "21.3");
  assert.equal(String(Math.round(cs.meterToday / 10) * 10), "9440");
  assert.equal(cs.perYearPct.toFixed(2), "2.28");
  assert.equal(cs.monthSlipPct.toFixed(2), "0.19");
  assert.equal(cs.ddepY, 30.018);
  assert.equal(cs.ddepGapPct.toFixed(2), "0.05");
  assert.equal(cs.baM.toFixed(2), "2.55");
});

test("붕괴 — Co-60 거꾸로: 52.4 kBq, 2019-03-15 인증서 140 kBq", () => {
  const { co } = decayExamples();
  assert.equal(co.days, 2788);
  assert.equal(co.years.toFixed(3), "7.633");
  assert.equal(co.halfLifeY.toFixed(3), "5.271");
  assert.equal((co.years / co.halfLifeY).toFixed(4), "1.4481");
  assert.equal(co.f.toFixed(4), "0.3665");
  assert.equal(co.back.toFixed(1), "143.0");
  assert.equal(co.certGapPct.toFixed(1), "2.1");
  assert.equal(co.forward.toFixed(1), "51.3");
  assert.equal(co.wrong.toFixed(1), "19.2");
  assert.equal(co.to10kBqY.toFixed(1), "12.6");
});

test("Lu-177 — 표의 % 가 `/radiopharmaceutical-decay/#lu-177` 와 같고, 7일 · 14일 값이 맞다", () => {
  const X = luExamples();
  const g = decayGridDays("Lu-177", 14);
  for (const r of X.days) assert.equal(pct1(r.f), pct1(g[r.d].f[0]), `${r.d} d`);
  assert.deepEqual(X.days.map((r) => pct1(r.f)), ["100.0", "90.1", "81.2", "73.1", "48.2", "23.2"]);
  assert.deepEqual(X.days.map((r) => r.gbq.toFixed(2)), ["7.40", "6.67", "6.01", "5.41", "3.57", "1.72"]);
  assert.deepEqual(X.dispatch.map((r) => r.gbq.toFixed(2)), ["8.21", "9.12", "10.12", "11.23"]);
  assert.deepEqual(X.dispatch.map((r) => pct1(r.f)), ["90.1", "81.2", "73.1", "65.9"]);
});

test("Lu-177 — 예제 · 지연 · 창 · 시계 · 동위 이성질체", () => {
  const X = luExamples();
  assert.equal(X.tDays, 6.6443);
  assert.equal(X.tHours.toFixed(2), "159.46");
  assert.equal(X.mCi.toFixed(0), "200");
  assert.equal(X.perDayPct.toFixed(1), "9.9");
  assert.equal(X.perHourPct.toFixed(2), "0.43");
  assert.equal(X.labelGap14Pct.toFixed(2), "0.06");
  assert.equal(X.n3.toFixed(4), "0.4515");
  assert.equal(X.dispatch[2].f.toFixed(4), "0.7313");
  assert.equal(X.atThursday.toFixed(2), "7.39");
  assert.equal(X.atThursdayPct.toFixed(1), "99.8");
  /* 6.6443 × log₂(10.1/7.4) = 2.9818 d = 71.56 h → 월 10:00 에서 목 09:33:38, 가까운 분으로 09:34(글이 「about」이라 쓴다) */
  assert.equal(X.reachH.toFixed(2), "71.56");
  assert.equal(X.reachClock, "09:34");
  /* 벌크 2.0 GBq/mL × 0.7313 = 1.463 GBq/mL · 7.4/1.463 = 5.06 mL · 3.70 mL 를 그대로 뽑으면 5.41 GBq(26.9% 적다) */
  assert.equal(X.bulk.concNow.toFixed(3), "1.463");
  assert.equal(X.bulk.volNow.toFixed(2), "5.06");
  assert.equal(X.bulk.vol0.toFixed(2), "3.70");
  assert.equal(X.bulk.wrongGBq.toFixed(2), "5.41");
  assert.equal(X.bulk.wrongPct.toFixed(1), "26.9");
  assert.equal(X.twoHoursLate.toFixed(2), "7.34");
  assert.equal(X.twoHoursLatePct.toFixed(2), "0.87");
  assert.equal(X.dayLate.toFixed(2), "6.67");
  assert.equal(X.dayLatePct.toFixed(1), "9.9");
  assert.equal(X.low.toFixed(2), "6.66");
  assert.equal(X.high.toFixed(2), "8.14");
  assert.equal(X.earlyH.toFixed(1), "21.9");
  assert.equal(X.lateH.toFixed(1), "24.2");
  assert.equal((X.earlyH + X.lateH).toFixed(0), "46");
  assert.ok(X.dayLate > X.low, "「다음 날도 겨우 안에 든다」는 산문이 참이어야 한다");
  assert.equal(X.utc9AbovePct.toFixed(1), "4.0");
  assert.equal(X.utc5BelowPct.toFixed(1), "2.1");
  assert.equal((X.utc9AbovePct * 10).toFixed(0), "40");
  assert.equal(X.tenDays.toFixed(1), "66.4");
  assert.equal(X.tenLeftMBq.toFixed(2), "7.23");
  assert.equal(X.isoHalfLifeD, 160.4);
  assert.equal(X.isoLeftPct.toFixed(1), "75.0");
  assert.ok(X.luAloneLeftPct < 0.1, "「0.1% 아래」는 산문이 참이어야 한다");
});

test("MDA — 계산기의 식 그대로: L_C · L_D · MDA", () => {
  const X = mdaExamples();
  assert.equal(X.B, 120);
  assert.equal(X.sqrt2B.toFixed(2), "15.49");
  assert.equal(X.lc.toFixed(1), "25.5");
  assert.equal(X.k2.toFixed(3), "2.706");
  assert.equal(X.ld.toFixed(1), "53.7");
  assert.equal(X.yPct, 85.1);
  assert.equal(X.eKeV.toFixed(0), "662");
  assert.equal(X.denom.toFixed(1), "91.9");
  assert.equal(X.mda.toPrecision(3), "0.584");
  assert.equal(X.perKg.toPrecision(3), "1.17");
  /* 화면에는 수율 칸이 없다 — 곱한 값을 효율 칸에 넣어도 같은 답이어야 한다(글이 그렇게 시킨다). */
  assert.equal(X.formEffPct.toFixed(3), "2.553");
  near(X.mdaForm, X.mda);
  const form = minimumDetectableActivity({ bgCps: 2 / 60, countTimeS: 3600, efficiency: X.formEffPct / 100, k: 1.645 });
  near(form.mda, X.mda);
  assert.equal(form.lc.toFixed(1), "25.5");
  assert.equal(form.ld.toFixed(1), "53.7");
  /* 「L_D = 2.71 + 4.65√B」는 k=1.645 의 어림이다 — 표기 자리수까지 같다. */
  assert.equal((2.71 + 4.65 * Math.sqrt(120)).toFixed(1), "53.6");
  assert.ok(Math.abs(2.71 + 4.65 * Math.sqrt(120) - X.ld) < 0.1);
});

test("MDA — 결과 읽기 · 블랭크 · 흔한 실수", () => {
  const X = mdaExamples();
  assert.deepEqual(X.results.map((r) => r.bq.toPrecision(3)), ["0.218", "0.435", "0.762"]);
  const [a, b, c] = X.results;
  assert.ok(a.net < X.lc && b.net > X.lc && b.net < X.ld && c.net > X.ld, "표의 세 결론이 참이어야 한다");
  /* L_C 는 두 자리로 적는다 — 표의 L_D 가 적힌 L_C 에서 다시 나와야 한다(k² + 2L_C). */
  assert.deepEqual(X.blanks.map((r) => [r.lc.toFixed(2), r.ld.toFixed(1), r.mda.toPrecision(3)]),
    [["40.29", "83.3", "0.906"], ["25.48", "53.7", "0.584"], ["20.15", "43.0", "0.468"], ["18.02", "38.7", "0.422"]]);
  for (const r of X.blanks) assert.equal((2.706 + 2 * Number(r.lc.toFixed(2))).toFixed(1), r.ld.toFixed(1));
  assert.equal(X.shortBlankCounts, 30);
  assert.equal(X.shortLowPct.toFixed(0), "36");
  /* 짝 블랭크는 엔진 그대로, 잘 아는 블랭크는 Currie 표 I(1.64·√B, 2.71 + 3.29·√B) · MARLAP 식 20.11. */
  near(lcWithRatio(120, 1, 1.645), X.lc);
  near(ldWithRatio(120, 1, 1.645), X.ld);
  near(lcWithRatio(120, 0, 1.645), 1.645 * Math.sqrt(120));
  assert.ok(Math.abs(ldWithRatio(120, 0, 1.645) - (2.71 + 3.29 * Math.sqrt(120))) < 0.01);
  /* MARLAP 예제 20.1 — N_B 108, t_B 6000 s, t_S 3000 s, α 0.05 → 14.8 순계수(원문에 인쇄된 값). */
  assert.equal(lcWithRatio(108 * (3000 / 6000), 3000 / 6000, 1.645).toFixed(1), "14.8");
  assert.equal(X.lcAsMda.toPrecision(3), "0.277");
  assert.equal(X.lcRatio.toFixed(1), "2.1");
  assert.equal(X.noYield.toPrecision(3), "0.497");
  assert.equal(X.noYieldPct.toFixed(0), "15");
  assert.equal(X.wholeSpectrum.toPrecision(3), "5.58");
  assert.ok(X.wholeSpectrum / X.mda > 9 && X.wholeSpectrum / X.mda < 10, "「nearly ten times」가 참이어야 한다");
  assert.equal(X.four.toPrecision(3), "0.285");
  assert.equal(X.fourRatio.toFixed(2), "2.05");
  assert.equal(X.i131Factor.toFixed(2), "2.00");
  assert.equal(X.oneHalfAvgPct.toFixed(1), "72.1");
  assert.equal(X.marssimLd.toFixed(1), "54.0");
  assert.equal(X.marssimPct.toFixed(2), "0.55");
  assert.equal(X.k99.mda.toPrecision(3), "0.843");
});

test("등록부 — 주소 · 제목 · 설명 길이, 날짜, 새 글이 위, 설명 속 수치가 엔진과 같다", () => {
  const slugs = ARTICLES.map((a) => a.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const a of ARTICLES) {
    assert.match(a.slug, /^[a-z0-9-]+$/);
    assert.ok(`${a.title} · Radiation Lab`.length <= 60, `${a.slug} 제목 ${a.title.length + 16}자`);
    assert.ok(a.description.length >= 90 && a.description.length <= 155, `${a.slug} 설명 ${a.description.length}자`);
    assert.match(a.published, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(a.reviewed, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(a.reviewed >= a.published, `${a.slug} 검토일이 게시일보다 앞이다`);
    assert.ok(a.sources.length >= 2 && a.sources.every((s) => /^https:\/\//.test(s.href)), `${a.slug} 출처`);
    assert.ok(a.calculators.length >= 1, `${a.slug} 계산기 링크`);
  }
  for (let i = 1; i < ARTICLES_NEWEST.length; i++)
    assert.ok(ARTICLES_NEWEST[i - 1].published >= ARTICLES_NEWEST[i].published);
  const d = ARTICLES.find((a) => a.slug === "radioactive-decay-worked-examples")!;
  assert.ok(d.description.includes(`${decayExamples().ra.pct.toFixed(1)}%`), "설명의 Ra-228 값");
});
