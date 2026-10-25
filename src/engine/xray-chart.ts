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

/** Pixel scales for the plot area. Fluence is relative (the peak of the shown spectrum is 1). */
export function scales(box: ChartBox, opts: { eMax: number; log: boolean }) {
  const x0 = box.padL;
  const x1 = box.w - box.padR;
  const y0 = box.h - box.padB;
  const y1 = box.padT;
  const sx = (e: number) => x0 + (e / opts.eMax) * (x1 - x0);
  const sy = (rel: number) => {
    if (opts.log) {
      const v = Math.max(rel, LOG_FLOOR);
      return y0 + ((Math.log10(v) - Math.log10(LOG_FLOOR)) / -Math.log10(LOG_FLOOR)) * (y1 - y0);
    }
    return y0 + rel * (y1 - y0);
  };
  return { sx, sy };
}

export function polylinePath(
  spec: SpectrumPoint[],
  box: ChartBox,
  opts: { eMax: number; fMax: number; log: boolean },
): string {
  const { sx, sy } = scales(box, opts);
  return spec
    .map((p, i) => `${i ? "L" : "M"}${sx(p.energy).toFixed(1)} ${sy(p.fluence / opts.fMax).toFixed(1)}`)
    .join(" ");
}

/** Energy-axis ticks: a 1-2-5 step giving at most eight intervals, from 0 up to the axis maximum. */
export function energyTicks(max: number): number[] {
  const steps = [1, 2, 5].flatMap((m) => [1, 10, 100].map((p) => m * p)).sort((a, b) => a - b);
  const step = steps.find((s) => max / s <= 8) ?? steps[steps.length - 1];
  const out: number[] = [];
  for (let v = 0; v <= max + 1e-9; v += step) out.push(v);
  return out;
}

/** Relative-fluence ticks: tenths on the linear axis, decades down to the floor on the log axis. */
export function fluenceTicks(log: boolean): number[] {
  if (log) {
    const n = -Math.log10(LOG_FLOOR);
    return Array.from({ length: n + 1 }, (_, i) => Number(`1e${i - n}`));
  }
  return [0, 0.2, 0.4, 0.6, 0.8, 1];
}
