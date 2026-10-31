import { NUCLIDES } from "./nuclides";
import { decayActivity, elapsedFromRatio, lambda } from "../engine/decay";
import { criticalLevel, detectionLimit, minimumDetectableActivity } from "../engine/mda";
import { TIME_S } from "../engine/constants";
import { convert } from "../engine/units";
import { HALFLIFE_REFS, refSeconds } from "../validation/decay.cases";
import { clockPlus, decayGridDays } from "./guide-tables";

/** ★★ `/notes/` 글 세 편의 수치 — 정본이다(2026-11-01, 판 1.1.5).
 *  `guide-tables.ts` 와 같은 방식이다: 쪽은 숫자를 글자로 적지 않고 여기서 읽고, `note-examples.test.ts` 가 **손으로 따로 계산한
 *  글자**를 고정한다. 엔진 · 자료가 움직이면 시험이 먼저 깨진다 — 그때는 값을 고치기 전에 글의 산문이 아직 맞는지 다시 읽는다.
 *  ★ 엔진의 식과 자료는 건드리지 않는다. 이 파일은 엔진을 **부르기만** 한다. */

const DAY = TIME_S.d;
const YEAR = TIME_S.y;
const T = (k: string) => NUCLIDES[k].t_half_s;
/** 달력 두 날짜 사이의 날 수 — 시간대에 흔들리지 않게 UTC 로 센다. */
const daysBetween = (a: string, b: string) => (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000;
const frac = (k: string, s: number) => decayActivity(1, T(k), s);

/* ── a. 붕괴 풀이 ───────────────────────────────────────────── */
export function decayExamples() {
  /* 「n 반감기 뒤」 — 반감기 하나를 1 로 두면 경과가 곧 n 이다. */
  const ladder = [0.5, 1, 1.5, 2, 3, 4, 5, 7, 10].map((n) => ({
    n,
    /** 정수 n 은 분수로 읽는 것이 쉽다 — 1/2ⁿ */
    exact: Number.isInteger(n) ? `1/${2 ** n}` : "—",
    pct: decayActivity(100, 1, n),
  }));

  /* Search Console 실제 질의 — 문제가 준 5.8 y 와 자료의 평가값. */
  const given = decayActivity(1, 5.8, 17.4);
  const raT = T("Ra-228");
  const raN = (17.4 * YEAR) / raT;
  const raF = frac("Ra-228", 17.4 * YEAR);
  const raOnePctY = elapsedFromRatio(0.01, raT) / YEAR;
  const thY = T("Th-228") / YEAR;

  /* 점검용 선원 — Cs-137 370 kBq, 2016-06-01 교정, 2026-11-01 사용. */
  const csDays = daysBetween("2016-06-01", "2026-11-01");
  const csF = frac("Cs-137", csDays * DAY);
  const csY = T("Cs-137") / YEAR;
  const ddepRef = HALFLIFE_REFS.find((r) => r.nuclide === "Cs-137")!;
  const csDdepF = decayActivity(1, refSeconds(ddepRef), csDays * DAY);
  const baM = T("Ba-137m") / TIME_S.min;

  /* 거꾸로 — Co-60 오늘 52.4 kBq, 인증서 2019-03-15 에 140 kBq. */
  const coDays = daysBetween("2019-03-15", "2026-11-01");
  const coF = frac("Co-60", coDays * DAY);

  return {
    ladder,
    ra: { givenPct: given * 100, n: raN, pct: raF * 100, gap: (given - raF) * 100,
          onePctY: raOnePctY, thY, ratioFromGiven: 2 ** (-17.4 / 5.75) * 100,
          /* Livechart 의 5.75(3) y — 평가값의 불확도가 답을 얼마나 벌리는가. 자료에는 불확도가 없어 글자로 둔다(2026-11-01 Livechart 확인). */
          lowPct: decayActivity(100, 5.72, 17.4), highPct: decayActivity(100, 5.78, 17.4) },
    cs: { days: csDays, years: (csDays * DAY) / YEAR, halfLifeY: csY, f: csF,
          kBq: 370 * csF, lostPct: (1 - csF) * 100,
          perYearPct: (1 - frac("Cs-137", YEAR)) * 100,
          meterToday: 12000 * csF,
          ddepY: ddepRef.value, ddepGapPct: Math.abs(csDdepF / csF - 1) * 100,
          monthSlipPct: (1 - frac("Cs-137", 30 * DAY)) * 100, baM },
    co: { days: coDays, years: (coDays * DAY) / YEAR, halfLifeY: T("Co-60") / YEAR, f: coF,
          back: 52.4 / coF, forward: 140 * coF, wrong: 52.4 * coF,
          certGapPct: (52.4 / coF / 140 - 1) * 100,
          to10kBqY: elapsedFromRatio(10 / 52.4, T("Co-60")) / YEAR },
  };
}

/* ── b. Lu-177 ─────────────────────────────────────────────── */
export const LU_DOSE_GBQ = 7.4;
export function luExamples() {
  const k = "Lu-177";
  const lu = T(k);
  const grid = decayGridDays(k, 14);
  /** `/radiopharmaceutical-decay/#lu-177` 표의 칸을 그대로 읽는다 — 같은 함수이므로 두 쪽의 숫자가 갈릴 수 없다. */
  const cell = (d: number) => grid[d].f[0];
  const days = [0, 1, 2, 3, 7, 14].map((d) => ({ d, f: cell(d), gbq: LU_DOSE_GBQ * cell(d) }));
  const dispatch = [1, 2, 3, 4].map((d) => ({ h: d * 24, f: cell(d), gbq: LU_DOSE_GBQ / cell(d) }));

  const delay = (h: number) => frac(k, h * 3600);
  const lateH = elapsedFromRatio(0.9, lu) / 3600;
  const earlyH = elapsedFromRatio(1 / 1.1, lu) / 3600;
  const tenS = 10 * lu;
  const isoF = frac("Lu-177m", tenS);

  return {
    tDays: lu / DAY, tHours: lu / 3600,
    perDayPct: (1 - frac(k, DAY)) * 100, perHourPct: (1 - frac(k, 3600)) * 100,
    lambdaPerDay: lambda(lu) * DAY,
    mCi: convert(LU_DOSE_GBQ, "GBq", "mCi", "activity"),
    days, dispatch,
    n3: (3 * DAY) / lu,
    /* 월요일 10:00 교정 10.1 GBq 로 주문 → 목요일 10:00 */
    ordered: 10.1, atThursday: 10.1 * cell(3), atThursdayPct: (10.1 * cell(3)) / LU_DOSE_GBQ * 100,
    /* 10.1 GBq 가 처방값까지 떨어지는 때 — 「When does it reach」 모드가 내는 값. 시각은 월요일 10:00 에 더한다. */
    reachH: elapsedFromRatio(LU_DOSE_GBQ / 10.1, lu) / 3600,
    reachClock: clockPlus("10:00", (elapsedFromRatio(LU_DOSE_GBQ / 10.1, lu) / 60)),
    /* 벌크 바이알 2.0 GBq/mL(월요일 교정)에서 목요일에 7.4 GBq 분주 — 농도만 줄고 부피는 그대로다. */
    bulk: { conc0: 2.0, concNow: 2.0 * cell(3), volNow: LU_DOSE_GBQ / (2.0 * cell(3)), vol0: LU_DOSE_GBQ / 2.0,
            wrongGBq: (LU_DOSE_GBQ / 2.0) * 2.0 * cell(3), wrongPct: (1 - cell(3)) * 100 },
    twoHoursLate: LU_DOSE_GBQ * delay(2), twoHoursLatePct: (1 - delay(2)) * 100,
    dayLate: LU_DOSE_GBQ * delay(24), dayLatePct: (1 - delay(24)) * 100,
    low: LU_DOSE_GBQ * 0.9, high: LU_DOSE_GBQ * 1.1,
    lateH, earlyH,
    /* UTC 로 적힌 교정 시각을 현지 시각으로 읽으면: UTC+9 는 실제 교정이 9시간 뒤라 계산보다 **많이** 들어 있고, UTC−5 는 5시간 앞이라 **적게** 들어 있다. */
    utc9AbovePct: (1 / delay(9) - 1) * 100,
    utc5BelowPct: (1 - delay(5)) * 100,
    /* 라벨 6.647 d 와 자료 6.6443 d — 14일 뒤 차이. 비교용일 뿐 계산은 자료 값을 쓴다. */
    labelGap14Pct: (decayActivity(1, 6.647 * DAY, 14 * DAY) / cell(14) - 1) * 100,
    weekIsNotHalf: cell(7) * 100,
    tenDays: tenS / DAY, tenLeftMBq: LU_DOSE_GBQ * 1000 * frac(k, tenS),
    isoHalfLifeD: T("Lu-177m") / DAY, isoLeftPct: isoF * 100, luAloneLeftPct: frac(k, tenS) * 100,
  };
}

/* ── c. MDA ────────────────────────────────────────────────── */
export const MDA_INPUT = { bgCpm: 2, minutes: 60, effPct: 3, massKg: 0.5, k: 1.645 } as const;

/** 블랭크 계수 시간이 다를 때 — 영(0)가설의 분산이 B(1 + t_S/t_B)(MARLAP 식 20.11).
 *  ★ 엔진의 `criticalLevel(b)` 는 k√(2b) 다. b = B(1 + r)/2 를 넣으면 k√(B(1 + r)) 이 되므로 **엔진을 고치지 않고** 쓴다.
 *    r = 1 이 짝 블랭크(엔진 그대로), r → 0 이 「잘 아는 블랭크」(Currie 표 I: 1.64·√B, 2.71 + 3.29·√B)다. */
export const lcWithRatio = (b: number, r: number, k: number) => criticalLevel((b * (1 + r)) / 2, k);
export const ldWithRatio = (b: number, r: number, k: number) => detectionLimit((b * (1 + r)) / 2, k);

export function mdaExamples() {
  const { bgCpm, minutes, effPct, massKg, k } = MDA_INPUT;
  const t = minutes * 60;
  const eps = effPct / 100;
  const line = NUCLIDES["Cs-137"].lines.reduce((a, b) => (b[1] > a[1] ? b : a));
  const yPct = line[1], y = yPct / 100;
  const r = minimumDetectableActivity({ bgCps: bgCpm / 60, countTimeS: t, efficiency: eps, yieldFrac: y, k });
  const denom = eps * y * t;
  /** 화면에는 수율 칸이 없다 — 곱해서 효율 칸에 넣는다. 같은 답이 나와야 한다. */
  const onForm = minimumDetectableActivity({ bgCps: bgCpm / 60, countTimeS: t, efficiency: eps * y, k });
  const at = (x: number) => x / denom;

  /* 짧은 블랭크 · 짝 · 긴 블랭크 · 잘 아는 블랭크. 계산기는 r = 1 만 한다 — 짧은 블랭크에서는 계산기 값이 낮게 나온다. */
  const blanks = [4, 1, 1 / 4, 0].map((ratio) => {
    const lc = lcWithRatio(r.bgCounts, ratio, k), ld = ldWithRatio(r.bgCounts, ratio, k);
    return { ratio, lc, ld, mda: at(ld) };
  });
  const four = minimumDetectableActivity({ bgCps: bgCpm / 60, countTimeS: 4 * t, efficiency: eps, yieldFrac: y, k });
  const k99 = minimumDetectableActivity({ bgCps: bgCpm / 60, countTimeS: t, efficiency: eps, yieldFrac: y, k: 2.326 });
  const noYield = minimumDetectableActivity({ bgCps: bgCpm / 60, countTimeS: t, efficiency: eps, k });
  const oneHalf = (1 - decayActivity(1, 1, 1)) / lambda(1);

  return {
    t, eKeV: line[0], yPct, formEffPct: effPct * y,
    B: r.bgCounts, lc: r.lc, ld: r.ld, mda: r.mda, mdaForm: onForm.mda, denom,
    perKg: r.mda / massKg, massKg,
    sqrt2B: Math.sqrt(2 * r.bgCounts), k2: k * k, marssimLd: 3 + 2 * r.lc,
    marssimPct: ((3 + 2 * r.lc) / r.ld - 1) * 100,
    results: [20, 40, 70].map((net) => ({ net, bq: at(net) })),
    blanks, shortLowPct: (1 - r.mda / blanks[0].mda) * 100,
    four: four.mda, fourRatio: r.mda / four.mda,
    k99: { lc: k99.lc, ld: k99.ld, mda: k99.mda },
    lcAsMda: at(r.lc), lcRatio: r.ld / r.lc,
    noYield: noYield.mda, noYieldPct: (1 - noYield.mda / r.mda) * 100,
    wholeSpectrum: minimumDetectableActivity({ bgCps: 200 / 60, countTimeS: t, efficiency: eps, yieldFrac: y, k }).mda,
    i131Factor: 1 / frac("I-131", 8 * DAY), i131Days: 8,
    oneHalfAvgPct: oneHalf * 100,
  };
}
