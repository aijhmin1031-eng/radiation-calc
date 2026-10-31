import { NUCLIDES } from "./nuclides";
import attenuation from "../data/attenuation.json";
import type { Material } from "../engine/types";
import type { Row } from "../engine/interp";
import { spectrumLayer } from "../engine/spectrum";
import { decayActivity, elapsedFromRatio } from "../engine";
import { convert } from "../engine/units";

/** ★★ 가이드 글 두 편의 표 — 정본이다(2026-10-25 D5-2).
 *  쪽(`/hvl-tvl-gamma/`·`/radiopharmaceutical-decay/`)과 고정 시험(`guide-tables.test.ts`)이 **같은 함수**를
 *  읽는다. 쪽에서 따로 계산하면 시험이 지키는 숫자와 화면 숫자가 어긋날 수 있다.
 *  ★ 차폐는 **감쇠만**(좁은 빔, 축적 없음)이다 — `spectrumLayer` 가 그렇다. 글이 그것을 밝힌다. */
const ATTEN = attenuation as unknown as Record<string, Row[]>;

export const HVL_NUCLIDES = ["Cs-137", "Co-60", "Ir-192", "I-131", "Tc-99m", "Am-241"] as const;
export const HVL_MATERIALS: Material[] = ["lead", "iron", "concrete"];

export interface LayerCell { hvlCm: number; tvlCm: number; tvl2Cm: number }
export interface LayerRow { k: string; cells: Record<string, LayerCell> }

/** 첫 반가층·첫 십가층, 그리고 **둘째 십가층**(1/10 → 1/100 사이 두께) — 빔 경화를 보이는 값. */
export function layerTable(): LayerRow[] {
  return HVL_NUCLIDES.map((k) => {
    const n = NUCLIDES[k];
    const cells: Record<string, LayerCell> = {};
    for (const m of HVL_MATERIALS) {
      const at = (f: number) => spectrumLayer(n.lines, ATTEN.air, ATTEN[m], m, f);
      const tvlCm = at(0.1);
      cells[m] = { hvlCm: at(0.5), tvlCm, tvl2Cm: at(0.01) - tvlCm };
    }
    return { k, cells };
  });
}

/** 잔존 비율 표 — 15분 간격, `hours` 시간까지. 행은 정시, 열은 :00 :15 :30 :45. */
export function decayGrid(k: string, hours: number): { h: number; f: number[] }[] {
  const T = NUCLIDES[k].t_half_s;
  return Array.from({ length: hours + 1 }, (_, h) => ({
    h,
    f: (h === hours ? [0] : [0, 15, 30, 45]).map((m) => decayActivity(1, T, h * 3600 + m * 60)),
  }));
}

/** 잔존 비율 표 — 6시간 간격, `days` 일까지. 행은 날, 열은 +0 h · +6 h · +12 h · +18 h(Lu-177 처럼 날로 세는 핵종). */
export function decayGridDays(k: string, days: number): { d: number; f: number[] }[] {
  const T = NUCLIDES[k].t_half_s;
  return Array.from({ length: days + 1 }, (_, d) => ({
    d,
    f: (d === days ? [0] : [0, 6, 12, 18]).map((h) => decayActivity(1, T, d * 86400 + h * 3600)),
  }));
}

/** 남은 비율이 `ratio` 가 되는 데 걸리는 분. */
export const minutesTo = (k: string, ratio: number) => elapsedFromRatio(ratio, NUCLIDES[k].t_half_s) / 60;
/** `min` 분 뒤 남는 비율. */
export const fractionAfter = (k: string, min: number) => decayActivity(1, NUCLIDES[k].t_half_s, min * 60);

/** "HH:MM" 에 분을 더한 시각. 음수도 받는다.
 *  ★ 반올림 방향이 답을 바꾼다 — 「늦어도 언제」는 내림(`floor`), 「일러도 언제」는 올림(`ceil`)이라야
 *    그 분(分)이 창 안에 든다. 둘을 같은 방향으로 깎으면 창 끝의 1분이 허용 범위 밖이 된다. */
export function clockPlus(hhmm: string, min: number, round: "floor" | "ceil" = "floor"): string {
  const [h, m] = hhmm.split(":").map(Number);
  const t = (((h * 60 + m + Math[round](min)) % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

/** 1 mCi 의 MBq — 단위 표(`engine/units.ts`)에서 읽는다.
 *  ★ 2026-11-01 쪽에서 `BQ_PER_CI / 1e9 / 1000`(= 0.037, GBq/mCi)으로 직접 나누어 「1 mCi = 0 MBq」가 라이브에 나갔다. */
export const MBQ_PER_MCI = convert(1, "mCi", "MBq", "activity");

/** 표기 — 쪽과 시험이 같은 글자를 본다. */
export const mm3 = (cm: number) => (cm * 10).toPrecision(3);
export const cm3 = (cm: number) => cm.toPrecision(3);
export const pct1 = (f: number) => (f * 100).toFixed(1);
/** 분 → 「1 h 56 min」. */
export const hMin = (min: number) => {
  const m = Math.floor(min);
  return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`;
};

/** 투여 시각 역산 예제 — 값은 이 함수에서만 나온다. */
export function dosingExamples() {
  /* ① Tc-99m: 07:45 에 925 MBq 로 분주한 주사기, 처방 740 MBq — 늦어도 언제 투여해야 하는가. */
  const tcMin = minutesTo("Tc-99m", 740 / 925);
  /* ② F-18: 09:00 기준 370 MBq, 허용 ±10%(333–407 MBq) — 투여 가능한 시간 창, 그리고 45분 늦었을 때. */
  const fLate = minutesTo("F-18", 333 / 370);
  const fEarly = -minutesTo("F-18", 370 / 407);
  return {
    tc: { minutes: tcMin, latest: clockPlus("07:45", tcMin), span: hMin(tcMin),
          at0930: 925 * fractionAfter("Tc-99m", 105), at1000: 925 * fractionAfter("Tc-99m", 135) },
    f18: { earliest: clockPlus("09:00", fEarly, "ceil"), latest: clockPlus("09:00", fLate),
           width: Math.floor(fLate) - Math.ceil(fEarly) , late45: 370 * fractionAfter("F-18", 45),
           drawFor0945: 370 / fractionAfter("F-18", 45) },
  };
}
