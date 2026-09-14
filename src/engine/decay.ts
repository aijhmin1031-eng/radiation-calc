import { LN2, N_A } from "./constants";

export const lambda = (tHalfS: number) => LN2 / tHalfS;

/** A(t) = A₀·e^(−λt) */
export function decayActivity(a0: number, tHalfS: number, elapsedS: number): number {
  return a0 * Math.exp(-lambda(tHalfS) * elapsedS);
}

/** 남은 비율에서 경과시간을 역산한다:  t = −ln(A/A₀)/λ */
export function elapsedFromRatio(ratio: number, tHalfS: number): number {
  if (ratio <= 0 || ratio > 1) return NaN;
  return -Math.log(ratio) / lambda(tHalfS);
}

/** 두 시점의 측정값에서 반감기를 역산한다. */
export function halfLifeFromTwoPoints(a0: number, a1: number, elapsedS: number): number {
  if (a0 <= 0 || a1 <= 0 || a1 >= a0 || elapsedS <= 0) return NaN;
  return (LN2 * elapsedS) / Math.log(a0 / a1);
}

/** 비방사능  a = ln2·N_A/(T½·M)  [Bq/g] — M 은 g/mol, 질량수로 근사한다(0.03% 이내). */
export function specificActivity(tHalfS: number, molarMass: number): number {
  return (LN2 * N_A) / (tHalfS * molarMass);
}

/** 활성도 ↔ 질량. Pu·U 계량이 이 한 줄이다. */
export const massFromActivity = (bq: number, saBqPerG: number) => bq / saBqPerG;
export const activityFromMass = (grams: number, saBqPerG: number) => grams * saBqPerG;

/** Bateman — 직렬 붕괴연쇄 (분기비 없는 단순 연쇄).
 *  ★ 분모 Π(λⱼ−λᵢ) 가 0 이 되면 ±Infinity 가 난다 — 같은 반감기가 섞이는 경우다
 *    (실제로 있다: 평형 근처의 이성질체 쌍, 사용자가 같은 핵종을 두 번 고르는 경우).
 *    참해는 t·e^(−λt) 항을 갖지만, **겹친 값을 미세하게 떼어 놓는 것**으로 같은 답에
 *    1e-6 이내로 수렴한다. 떼어 놓을 때는 **이미 떼어 놓은 값과** 비교해야 한다 —
 *    원본 배열과 비교하면 두 번째·세 번째가 같은 자리로 떨어져 다시 0 이 된다(실측으로 잡았다). */
export function batemanChain(n0: number, lambdas: number[], t: number): number[] {
  const EPS = 1e-6;
  const L: number[] = [];
  for (const l of lambdas) {
    let v = l;
    let guard = 0;
    while (L.some((p) => Math.abs(v - p) <= EPS * Math.max(Math.abs(v), 1e-300)) && guard++ < 64) {
      v *= 1 + EPS * 2;
    }
    L.push(v);
  }
  const out: number[] = [];
  for (let k = 0; k < L.length; k++) {
    let sum = 0;
    for (let i = 0; i <= k; i++) {
      let denom = 1;
      for (let j = 0; j <= k; j++) if (j !== i) denom *= L[j] - L[i];
      sum += Math.exp(-L[i] * t) / denom;
    }
    let prod = 1;
    for (let j = 0; j < k; j++) prod *= L[j];
    out.push(n0 * prod * sum);
  }
  return out.map((n, k) => n * L[k]);   // 활성도 A = λN
}
