/** 검출하한 — Currie(1968) 체계.  MARSSIM·NUREG-1507 이 쓰는 형태로 둔다.
 *  용어가 섞여 쓰이므로 화면에서 세 값을 모두 이름과 함께 보여 준다. */

/** 임계수준 L_C — "검출했다"고 말하는 문턱. 시료를 재기 전에 정해 둔다. */
export function criticalLevel(bgCounts: number, k = 1.645): number {
  return k * Math.sqrt(2 * bgCounts);
}

/** 검출하한 L_D — 그 문턱을 신뢰도 (1−β) 로 넘기는 참값. */
export function detectionLimit(bgCounts: number, k = 1.645): number {
  return k * k + 2 * criticalLevel(bgCounts, k);   // = k² + 2k√(2B)
}

/** MDA / MDC — L_D 를 활성도·농도로 환산한다.
 *  eff 는 소수(0.25 = 25%), countTimeS 초, yieldFrac 은 방출분율·화학수율. */
export function minimumDetectableActivity(opts: {
  bgCps: number; countTimeS: number; efficiency: number;
  yieldFrac?: number; sampleQty?: number; k?: number;
}): { lc: number; ld: number; mda: number; bgCounts: number } {
  const { bgCps, countTimeS, efficiency } = opts;
  const k = opts.k ?? 1.645, y = opts.yieldFrac ?? 1, q = opts.sampleQty ?? 1;
  const bgCounts = bgCps * countTimeS;
  const lc = criticalLevel(bgCounts, k);
  const ld = detectionLimit(bgCounts, k);
  const denom = efficiency * countTimeS * y * q;
  return { lc, ld, bgCounts, mda: denom > 0 ? ld / denom : NaN };
}

/** 스캔 MDC — MARSSIM 의 관찰자 효율이 들어간다.
 *  ★ 「이상 신호를 알아차릴 확률」이 조사원에 달려 있다는 것이 이 식의 요지다.
 *  d′ 는 탐지지수(표준 1.38 = 95% 참양성·25% 거짓양성), p 는 관찰자 효율(관행 0.5). */
export function scanMdc(opts: {
  bgCps: number; scanSpeedCmPerS: number; detectorWidthCm: number;
  efficiency: number; surfaceEfficiency?: number; probeAreaCm2?: number;
  dPrime?: number; observerEff?: number;
}): { observationIntervalS: number; mdcr: number; mdcrSurveyor: number; scanMdc: number } {
  const dP = opts.dPrime ?? 1.38, p = opts.observerEff ?? 0.5;
  const i = opts.scanSpeedCmPerS > 0 ? opts.detectorWidthCm / opts.scanSpeedCmPerS : NaN;
  const bi = opts.bgCps * i;                                  // 관측구간당 배경 계수
  const si = dP * Math.sqrt(bi);                              // 알아차릴 수 있는 최소 순계수
  const mdcr = (si / i) * 60;                                 // cpm
  const mdcrSurveyor = mdcr / Math.sqrt(p);                   // 관찰자 효율 보정
  const es = opts.surfaceEfficiency ?? 0.5;
  const area = opts.probeAreaCm2 ?? 100;
  const denom = opts.efficiency * es * (area / 100);
  return { observationIntervalS: i, mdcr, mdcrSurveyor, scanMdc: denom > 0 ? mdcrSurveyor / denom : NaN };
}
