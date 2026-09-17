/** 유효성 평가 쪽의 수 표기 — **보고서용이라 도구 화면(`fmt`, 6자리)보다 자릿수가 많다.**
 *  ★ 자릿수를 줄이면 **자릿수가 감추는 차이**가 생긴다. 1/60 을 6자리로 쓰면
 *    「1.66667 × 10⁻²」이 되어 손계산과 도구가 같은지 다른지 쪽에서 볼 수 없다.
 *    유효성 평가에서 보여 줄 것은 반올림한 값이 아니라 **실제로 든 값**이다. */
const SUP = "⁻⁰¹²³⁴⁵⁶⁷⁸⁹";
const sup = (n: number) =>
  (n < 0 ? SUP[0] : "") + String(Math.abs(n)).split("").map((d) => SUP[Number(d) + 1]).join("");

/** 유효숫자 `sig` 자리로 자르고 **의미 없는 뒤 0 을 떼어** 과학표기로 낸다.
 *  ★★ **표 안에서는 표기를 섞지 않는다.** 처음에 「지수가 작으면 십진」으로 뒀더니
 *    같은 열에 `1000` 과 `1 × 10⁶` 이 나란히 서서, 두 수가 같은 자릿수 규칙으로 적힌 것인지
 *    읽는 사람이 알 수 없었다. 유효성 평가표는 **눈으로 대조하는 표**이므로 한 가지로 적는다. */
export function sci(v: number, sig = 12): string {
  if (!Number.isFinite(v)) return Number.isNaN(v) ? "NaN" : "∞";
  if (v === 0) return "0";
  const [mRaw, eRaw] = v.toExponential(sig - 1).split("e");
  const m = mRaw.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  return `${m} × 10${sup(Number(eRaw))}`;
}

/** 사람이 읽는 라벨용 십진 표기 — 「5 µCi → Bq」처럼 **입력값을 말할 때** 쓴다.
 *  표의 대조 열에는 쓰지 않는다(위 sci 가 그 자리다). */
export const plain = (v: number): string =>
  Number.isFinite(v) ? String(Number(v.toPrecision(12))) : "—";

/** 상대차 — 0 이면 「0」이라고 분명히 적는다(「0.00e+0」은 0 인지 작은지 안 보인다). */
export function relDiff(got: number, want: number): string {
  if (got === want) return "0";
  const r = want === 0 ? Math.abs(got) : Math.abs(got - want) / Math.abs(want);
  return r.toExponential(2).replace("e", " × 10^").replace(/\^([+-]?\d+)/, (_, d) => sup(Number(d)));
}

/** 상대차의 수치 — 합격 판정과 커버리지 집계가 쓴다. */
export const relValue = (got: number, want: number) =>
  want === 0 ? Math.abs(got) : Math.abs(got - want) / Math.abs(want);
