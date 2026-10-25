// Tungsten bremsstrahlung spectrum engine.
// Loads the precomputed SpekPy table (src/data/xray-brem-W.json) and interpolates by kVp.
// JSON imported without an assertion, matching the repo's production convention (lib/nuclides.ts).
import table from "../data/xray-brem-W.json";

export interface SpectrumPoint {
  energy: number;
  fluence: number;
}

const GRID: number[] = table.kvpGrid;
export const KVP_MIN = GRID[0];
export const KVP_MAX = GRID[GRID.length - 1];
const EMAX = table.energyMaxKeV;
const FLUENCE = table.fluence as Record<string, number[]>;

const clamp = (kv: number) => Math.min(KVP_MAX, Math.max(KVP_MIN, kv));

/** Fluence row at an arbitrary kVp, linearly interpolated between grid rows. */
function row(kvp: number): number[] {
  const kv = clamp(kvp);
  const hi = GRID.findIndex((g) => g >= kv);
  if (hi <= 0) return FLUENCE[String(GRID[0])];
  const lo = hi - 1;
  const t = (kv - GRID[lo]) / (GRID[hi] - GRID[lo]);
  const a = FLUENCE[String(GRID[lo])];
  const b = FLUENCE[String(GRID[hi])];
  return a.map((av, i) => av + (b[i] - av) * t);
}

export function bremSpectrum(kvp: number): SpectrumPoint[] {
  const kv = clamp(kvp);
  const r = row(kv);
  const top = Math.floor(kv);
  const out: SpectrumPoint[] = [];
  for (let e = 0; e <= Math.min(EMAX, top); e++) {
    out.push({ energy: e, fluence: Math.max(0, r[e]) });
  }
  return out;
}

export function meanEnergy(spec: SpectrumPoint[]): number {
  let num = 0;
  let den = 0;
  for (const p of spec) {
    num += p.energy * p.fluence;
    den += p.fluence;
  }
  return den > 0 ? num / den : 0;
}
