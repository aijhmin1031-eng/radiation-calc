/** ALARA — 작업계획. 데이터가 없고 전부 입력이라 틀릴 여지가 거의 없다. */

/** 역제곱: 기준거리의 선량률에서 다른 거리의 선량률. */
export function inverseSquare(rate1: number, d1: number, d2: number): number {
  if (d1 <= 0 || d2 <= 0) return NaN;
  return rate1 * (d1 * d1) / (d2 * d2);
}

/** 거리를 역산한다 — 「선량률을 X 이하로 두려면 몇 m 떨어져야 하나」 */
export const distanceForRate = (rate1: number, d1: number, target: number) =>
  target > 0 ? d1 * Math.sqrt(rate1 / target) : NaN;

/** 체류가능시간 [h] = 선량한도 / 선량률 */
/** ★ 「모름」과 「0」을 가른다 — `NaN > 0` 은 false 라 예전 판은 **선량률이 NaN 이어도
 *  Infinity 를 돌려주었고**, 화면은 그것을 체류시간 「unlimited」로 그렸다(2026-09-14 실측).
 *  선량률이 진짜 0 일 때만 무제한이고, 입력이 비었거나 무효이면 답이 없다(NaN). */
export const stayTime = (doseLimit: number, doseRate: number) =>
  !Number.isFinite(doseLimit) || !Number.isFinite(doseRate) ? NaN
    : doseRate > 0 ? doseLimit / doseRate : Infinity;

/** 작업 한 묶음의 집단선량 [person·mSv] */
export function collectiveDose(tasks: { workers: number; hours: number; rate: number }[]): number {
  return tasks.reduce((s, t) => s + t.workers * t.hours * t.rate, 0);
}

/** 반가층·십가층 — 실측한 투과율에서 되짚는다. */
export const hvlFromMu = (mu: number) => Math.LN2 / mu;
export const tvlFromMu = (mu: number) => Math.log(10) / mu;
