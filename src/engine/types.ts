export interface Nuclide {
  z: number; a: number; sym: string; iso: string;
  t_half_s: number; hl: string; hl_unit: string;
  decay: string | null;
  sa_bq_g: number;            // 비방사능 Bq/g
  gamma_const: number;        // 공기커마율상수 Γ  [mGy·m²/(GBq·h)] · δ=20 keV
  lines: [energyKeV: number, intensityPct: number][];
}
export type NuclideMap = Record<string, Nuclide>;
export type Material = "air" | "water" | "concrete" | "lead" | "iron" | "tungsten" | "aluminum" | "copper";
