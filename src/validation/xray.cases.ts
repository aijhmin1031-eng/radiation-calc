// Reference mean energies of the raw tungsten bremsstrahlung (no filter, 20deg, char off),
// generated with SpekPy 2.5.4 (MIT), physics=casim, dk=1.0 keV. SpekPy values — not ISO.
// 65/150/250 are OFF the 10 kV precompute grid, so they also test the engine's interpolation.
export const XRAY_CASES: { kvp: number; meanEnergyKeV: number; tol: number }[] = [
  { kvp: 30, meanEnergyKeV: 9.8, tol: 0.01 },
  { kvp: 65, meanEnergyKeV: 20.07, tol: 0.01 },
  { kvp: 100, meanEnergyKeV: 30.09, tol: 0.01 },
  { kvp: 150, meanEnergyKeV: 43.23, tol: 0.01 },
  { kvp: 250, meanEnergyKeV: 65.84, tol: 0.01 },
];
