// Pure SVG scale + path helpers for the X-ray spectrum chart.
// Kept out of the React component so the fidelity rules (straight segments, log floor) are unit-tested.
import type { SpectrumPoint } from "./xray";

export interface ChartBox {
  w: number;
  h: number;
  padL: number;
  padR: number;
  padT: number;
  padB: number;
}

const LOG_FLOOR = 1e-6; // relative floor for the log axis

export function polylinePath(
  spec: SpectrumPoint[],
  box: ChartBox,
  opts: { eMax: number; fMax: number; log: boolean },
): string {
  const x0 = box.padL;
  const x1 = box.w - box.padR;
  const y0 = box.h - box.padB;
  const y1 = box.padT;
  const sx = (e: number) => x0 + (e / opts.eMax) * (x1 - x0);
  const floor = opts.fMax * LOG_FLOOR;
  const sy = (f: number) => {
    if (opts.log) {
      const v = Math.max(f, floor);
      const r = (Math.log10(v) - Math.log10(floor)) / (Math.log10(opts.fMax) - Math.log10(floor));
      return y0 + r * (y1 - y0);
    }
    return y0 + (f / opts.fMax) * (y1 - y0);
  };
  return spec
    .map((p, i) => `${i ? "L" : "M"}${sx(p.energy).toFixed(1)} ${sy(p.fluence).toFixed(1)}`)
    .join(" ");
}

export function niceTicks(max: number, n: number): number[] {
  const step = Math.max(1, Math.round(max / n));
  const out: number[] = [];
  for (let v = 0; v <= max + 1e-9; v += step) out.push(v);
  return out;
}
