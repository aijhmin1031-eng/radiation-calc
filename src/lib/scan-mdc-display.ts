import { scanMdc } from "../engine/mda";
import { fmt } from "../components/ui/Result";

/** 스캔 MDC 결과 화면의 숫자와 단위 — Mda.tsx 가 이것을 그대로 그린다.
 *  ★★ **엔진의 `scanMdc` 는 dpm/100 cm² 를 낸다**(MARSSIM 식 그대로, 검증 사례 M-P-03 이 755.9).
 *    화면이 그 값을 「Bq/cm²」라고 적고, 「In dpm/100 cm²」 줄은 거기에 ×6000 을 곱해
 *    **6000 배 큰 수**를 보여 주고 있었다(2026-10-25 D3 조사 중 발견). 단위를 화면 코드에서
 *    따로 적지 않고 여기 한 곳에 모아, 테스트가 화면 문자열 자체를 고정한다.
 *  ★ 1 Bq/cm² = 60 dpm/cm² = 6000 dpm/100 cm² — 그래서 Bq/cm² 는 **÷6000** 이다. */
export const SCAN_UNIT = "dpm/100 cm²";
export const DPM100_PER_BQ_CM2 = 6000;

export type ScanInputs = Parameters<typeof scanMdc>[0];

export function scanMdcDisplay(opts: ScanInputs) {
  const r = scanMdc(opts);
  const halved = scanMdc({ ...opts, scanSpeedCmPerS: opts.scanSpeedCmPerS / 2 }).scanMdc;
  return {
    result: r,
    headline: { value: fmt(r.scanMdc), unit: SCAN_UNIT },
    inBqCm2: `${fmt(r.scanMdc / DPM100_PER_BQ_CM2, 4)} Bq/cm²`,
    halvedSpeed: `${fmt(halved, 4)} ${SCAN_UNIT}`,
  };
}
