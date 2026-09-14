/** 로그-로그 보간 — 감쇠계수는 수 자릿수를 가로지르므로 선형 보간은 크게 틀린다. */
export type Row = [energyMeV: number, muOverRho: number, muEnOverRho: number];

export function logInterp(rows: Row[], E: number, col: 1 | 2): number {
  if (rows.length === 0) return NaN;
  if (E <= rows[0][0]) return rows[0][col];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] >= E) {
      const [x0, x1] = [rows[i - 1][0], rows[i][0]];
      const [y0, y1] = [rows[i - 1][col], rows[i][col]];
      // 흡수단에서 같은 에너지가 두 번 나온다 — 위쪽 가지를 쓴다
      if (x0 === x1 || y0 <= 0 || y1 <= 0) return y1;
      const f = (Math.log(E) - Math.log(x0)) / (Math.log(x1) - Math.log(x0));
      return Math.exp(Math.log(y0) + f * (Math.log(y1) - Math.log(y0)));
    }
  }
  return rows[rows.length - 1][col];
}
