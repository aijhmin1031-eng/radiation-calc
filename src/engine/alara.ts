/** ALARA — 작업계획. 자료도 경험식도 없고 **기하와 산술뿐**이다.
 *
 *  ★★ 그래서 이 파일에서 틀릴 수 있는 것은 식이 아니라 **답하지 말아야 할 때 답하는 것**이다.
 *    2026-09-19 유효성 평가에서 여덟 자리를 막았다 — 음의 선량률·음의 거리·음의 체류시간·
 *    음의 집단선량·μ=0 의 무한 반가층이 전부 **수처럼 생긴 채** 나오고 있었다.
 *
 *  ★★★ **이웃한 나쁜 입력을 같이 막아야 한다**(이 라운드의 교훈).
 *    2026-09-14 에 `stayTime` 이 **선량률 NaN 에서 Infinity** 를 내는 것을 고쳤는데
 *    (`NaN > 0` 이 false 라 무제한으로 떨어졌다), **음수는 그대로 남아 있었다** —
 *    `-1 > 0` 도 false 이므로 똑같이 「unlimited」가 됐다.
 *    **한 가지 나쁜 입력을 막을 때는 같은 분기로 떨어지는 나머지를 함께 센다.** */

/** 유한한 양수인가. */
const pos = (x: number) => Number.isFinite(x) && x > 0;
/** 유한하고 음이 아닌가 — 선량률은 0 일 수 있다(차폐 뒤·배경 없음). */
const nonNeg = (x: number) => Number.isFinite(x) && x >= 0;

/** 역제곱: 기준거리의 선량률에서 다른 거리의 선량률.
 *  ★ **점선원 가정이다** — 선원의 크기에 견주어 거리가 충분히 클 때만 성립한다.
 *    공기 감쇠·산란·축적을 넣지 않으므로 먼 거리에서는 과대, 넓은 빔에서는 과소가 된다.
 *    그 가정과 깨지는 자리는 `src/validation/alara.cases.ts` 가 적는다. */
export function inverseSquare(rate1: number, d1: number, d2: number): number {
  if (!nonNeg(rate1) || !pos(d1) || !pos(d2)) return NaN;
  return (rate1 * (d1 * d1)) / (d2 * d2);
}

/** 거리를 역산한다 — 「선량률을 X 이하로 두려면 몇 m 떨어져야 하나」
 *  ★ **기준거리도 양수여야 한다** — 그전에는 `target > 0` 만 보아, 기준거리 −5 m 에서
 *    **−22.4 m** 라는 거리가 나왔다.
 *  ★★ **기준 선량률이 0 이면 답이 없다.** 그전에는 0 을 돌려주어 「선원에 붙어 서라」로
 *    읽혔는데, 실제 뜻은 **어느 거리든 조건을 만족한다**(제약이 없다)는 것이다.
 *    둘은 정반대이고, 0 은 수처럼 생긴 거짓이다. */
export const distanceForRate = (rate1: number, d1: number, target: number) =>
  pos(rate1) && pos(d1) && pos(target) ? d1 * Math.sqrt(rate1 / target) : NaN;

/** 체류가능시간 [h] = 선량한도 / 선량률
 *  ★ 「모름」과 「0」을 가른다 — `NaN > 0` 은 false 라 예전 판은 **선량률이 NaN 이어도
 *  Infinity 를 돌려주었고**, 화면은 그것을 체류시간 「unlimited」로 그렸다(2026-09-14 실측).
 *  ★★ **음수도 같은 분기로 떨어진다**(2026-09-19). `-1 > 0` 역시 false 라 음의 선량률이
 *  「무제한」이 됐다 — 같은 결함을 절반만 고쳤던 것이다. 지금은 셋을 가른다:
 *  선량률이 **정확히 0 일 때만 무제한**, 음수·NaN·무한대는 **답 없음**, 그 외는 한도/선량률. */
export const stayTime = (doseLimit: number, doseRate: number) =>
  !nonNeg(doseLimit) || !nonNeg(doseRate) ? NaN
    : doseRate > 0 ? doseLimit / doseRate : Infinity;

/** 작업 한 묶음의 집단선량 [person·mSv]
 *  ★ 한 줄이라도 음수·NaN 이면 **합계를 내지 않는다** — 음의 집단선량은 「피폭을 되돌렸다」는
 *    뜻이 되고, 합계 안에 섞인 음수는 다른 줄을 조용히 상쇄한다. */
export function collectiveDose(tasks: { workers: number; hours: number; rate: number }[]): number {
  let sum = 0;
  for (const t of tasks) {
    if (!nonNeg(t.workers) || !nonNeg(t.hours) || !nonNeg(t.rate)) return NaN;
    sum += t.workers * t.hours * t.rate;
  }
  return sum;
}

/** 반가층·십가층 — 실측한 투과율에서 되짚는다.
 *  ★ μ 가 0 이면 아무것도 줄지 않으므로 반가층이 없다 — Infinity 는 「두께가 무한하다」로
 *    읽히지만 실제 뜻은 **그 물질로는 절반이 되지 않는다**이다. 음의 μ 는 증폭이라 없다. */
export const hvlFromMu = (mu: number) => (pos(mu) ? Math.LN2 / mu : NaN);
export const tvlFromMu = (mu: number) => (pos(mu) ? Math.log(10) / mu : NaN);
