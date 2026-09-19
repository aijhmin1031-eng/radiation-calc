/** 검출하한 — Currie(1968) 체계.  MARSSIM(NUREG-1575) 이 쓰는 형태로 둔다.
 *  용어가 섞여 쓰이므로 화면에서 세 값을 모두 이름과 함께 보여 준다.
 *
 *  ★★ **분율 셋은 0 초과 1 이하다**(2026-09-19 유효성 평가에서 막았다) —
 *    검출효율은 「방출 하나당 계수」, 표면효율은 「표면을 떠나는 분율」, 관찰자 효율은
 *    「이상 관찰자 성능의 몇 분의 몇」이다. 셋 다 1 을 넘을 수 없는데 막혀 있지 않아
 *    효율 1.5 가 답을 냈고, 관찰자 효율 0 은 **Infinity** 를 냈다. */

/** 분율(0 < x ≤ 1)인가 — 화면의 세 효율이 전부 이 꼴이다. */
const isFraction = (x: number) => Number.isFinite(x) && x > 0 && x <= 1;
/** 양수이고 유한한가. */
const pos = (x: number) => Number.isFinite(x) && x > 0;
/** 음이 아니고 유한한가 — 배경은 0 일 수 있다. */
const nonNeg = (x: number) => Number.isFinite(x) && x >= 0;

/** 임계수준 L_C — "검출했다"고 말하는 문턱. 시료를 재기 전에 정해 둔다.
 *  ★ k 가 음수면 **음의 임계수준**이 나왔다 — 막는다. */
export function criticalLevel(bgCounts: number, k = 1.645): number {
  if (!nonNeg(bgCounts) || !pos(k)) return NaN;
  return k * Math.sqrt(2 * bgCounts);
}

/** 검출하한 L_D — 그 문턱을 신뢰도 (1−β) 로 넘기는 참값.
 *  ★★ **MARSSIM 은 k² 자리에 3 을 쓴다**(2026-09-19 원문 확인, Rev 1 6-34쪽):
 *    「Currie 의 유도에서 L_D 의 상수항은 2.71 이었으나, 그 뒤 3 이 더 적절하다는 것이
 *    밝혀졌고(Brodsky 1992) 일반적으로 받아들여진다.」
 *    ★ 그런데 **이 도구는 k 를 사용자가 고른다**(1.645 · 1.96 · 2.326). 「3」은 k=1.645
 *      전용 값이라 일반화되지 않으므로, 여기서는 Currie 의 **k²** 를 그대로 둔다.
 *      차이는 k=1.645 에서 **0.294 계수**이고 배경이 클수록 작아진다(B=0 에서 10.86%,
 *      B=100 에서 0.597%, B=10⁴ 에서 0.063%). **MARSSIM 쪽이 더 보수적**이다 —
 *      즉 우리가 검출하한을 **조금 낮게** 내므로, 그 방향까지 보고서가 적는다. */
export function detectionLimit(bgCounts: number, k = 1.645): number {
  const lc = criticalLevel(bgCounts, k);
  if (!Number.isFinite(lc)) return NaN;
  return k * k + 2 * lc;   // = k² + 2k√(2B)
}

/** MDA / MDC — L_D 를 활성도·농도로 환산한다.
 *  eff 는 소수(0.25 = 25%), countTimeS 초, yieldFrac 은 방출분율·화학수율. */
export function minimumDetectableActivity(opts: {
  bgCps: number; countTimeS: number; efficiency: number;
  yieldFrac?: number; sampleQty?: number; k?: number;
}): { lc: number; ld: number; mda: number; bgCounts: number } {
  const { bgCps, countTimeS, efficiency } = opts;
  const k = opts.k ?? 1.645, y = opts.yieldFrac ?? 1, q = opts.sampleQty ?? 1;
  const bad = { lc: NaN, ld: NaN, mda: NaN, bgCounts: NaN };
  if (!nonNeg(bgCps) || !pos(countTimeS) || !isFraction(efficiency)
      || !isFraction(y) || !pos(q) || !pos(k)) return bad;
  const bgCounts = bgCps * countTimeS;
  const lc = criticalLevel(bgCounts, k);
  const ld = detectionLimit(bgCounts, k);
  if (!Number.isFinite(ld)) return bad;
  return { lc, ld, bgCounts, mda: ld / (efficiency * countTimeS * y * q) };
}

/** 스캔 MDC — MARSSIM 의 관찰자 효율이 들어간다.
 *  ★ 「이상 신호를 알아차릴 확률」이 조사원에 달려 있다는 것이 이 식의 요지다.
 *  ★★ **d′ = 1.38 은 「참양성 95% · 거짓양성 60%」다**(MARSSIM Rev 1 표 6.5, 6-40쪽).
 *    그전에 코드 주석과 **화면 도움말이 「거짓양성 25%」라고 적고 있었다** — 그 칸의 값은
 *    2.32 다. 1단계 스캔은 **거짓양성을 많이 허용하고** 2단계에서 걸러내는 것이 MARSSIM 의
 *    설계라, 이 숫자를 잘못 적으면 방법 자체를 오해하게 만든다.
 *  d′ 는 탐지지수, p 는 관찰자 효율(MARSSIM 관행 0.5).
 *  ★ **배경이 0 이면 답이 없다** — s_i = d′√0 = 0 이라 MDC 가 0 으로 무너지는데,
 *    그것은 「아무리 작은 양도 검출한다」는 뜻이라 수처럼 생긴 거짓이다. */
export function scanMdc(opts: {
  bgCps: number; scanSpeedCmPerS: number; detectorWidthCm: number;
  efficiency: number; surfaceEfficiency?: number; probeAreaCm2?: number;
  dPrime?: number; observerEff?: number;
}): { observationIntervalS: number; mdcr: number; mdcrSurveyor: number; scanMdc: number } {
  const dP = opts.dPrime ?? 1.38, p = opts.observerEff ?? 0.5;
  const es = opts.surfaceEfficiency ?? 0.5, area = opts.probeAreaCm2 ?? 100;
  const bad = { observationIntervalS: NaN, mdcr: NaN, mdcrSurveyor: NaN, scanMdc: NaN };
  if (!pos(opts.bgCps) || !pos(opts.scanSpeedCmPerS) || !pos(opts.detectorWidthCm)
      || !isFraction(opts.efficiency) || !isFraction(es) || !isFraction(p)
      || !pos(area) || !pos(dP)) return bad;
  const i = opts.detectorWidthCm / opts.scanSpeedCmPerS;      // 관측구간 [s]
  const bi = opts.bgCps * i;                                  // 관측구간당 배경 계수
  const si = dP * Math.sqrt(bi);                              // 알아차릴 수 있는 최소 순계수
  const mdcr = (si / i) * 60;                                 // cpm
  const mdcrSurveyor = mdcr / Math.sqrt(p);                   // 관찰자 효율 보정
  return { observationIntervalS: i, mdcr, mdcrSurveyor,
           scanMdc: mdcrSurveyor / (opts.efficiency * es * (area / 100)) };
}
