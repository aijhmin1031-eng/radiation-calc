# scripts/gen-xray-brem.py  —  run locally: <venv>/python scripts/gen-xray-brem.py
# Requires SpekPy 2.5.4 in the active environment. Output committed; browser/CI never run this.
import json, datetime, numpy as np, spekpy as sp

ANODE_ANGLE = 20          # deg, ideal matched-field take-off
EMAX = 300                # keV grid ceiling
KVP_GRID = list(range(20, 301, 10))   # 20..300 kV, 10 kV steps
STEP = 1.0                # keV display grid (integer keV)
SRC_DK = 0.5              # SpekPy source bin width (finer than the display grid)
INT_E = np.arange(0, EMAX + 1)        # integer keV display grid 0..300

def brem_row(kvp):
    s = sp.Spek(kvp=kvp, th=ANODE_ANGLE, dk=SRC_DK, physics="casim", char=False)  # char off = brem only
    k, f = s.get_spectrum(edges=False)                 # k in keV (half-integer centres), f fluence per bin
    # Rebin by SUMMING SpekPy's fine (0.5 keV) bins into integer-keV bins. Summing conserves the
    # photon count, so it preserves both shape and mean energy; the two source bins that land in
    # each integer bin fill every bin (no picket-fence comb). A round-to-nearest WRITE (the earlier
    # bug) instead collided pairs onto even keV via banker's rounding and left odd keV at zero.
    row = np.zeros(EMAX + 1)
    for e, fl in zip(k, f):
        i = int(np.floor(e + 0.5))                     # nearest integer bin
        if 0 <= i <= EMAX and e <= kvp + 1e-9:
            row[i] += fl
    return [float(f"{v:.6g}") if v > 0 else 0.0 for v in row]

data = {
    "meta": {
        "title": "Tungsten bremsstrahlung fluence (no filtration), by tube voltage",
        "source": "Generated with SpekPy 2.5.4 (MIT), physics=casim, char excluded",
        "generated": datetime.date.today().isoformat(),
        "note": "Ideal conditions: point source, 20deg anode, bremsstrahlung only. No ISO data.",
    },
    "anode": "W", "anodeAngleDeg": ANODE_ANGLE, "physics": "casim", "charExcluded": True,
    "energyStepKeV": STEP, "energyMaxKeV": EMAX, "kvpGrid": KVP_GRID,
    "fluence": {str(kv): brem_row(kv) for kv in KVP_GRID},
}
with open("src/data/xray-brem-W.json", "w", encoding="utf-8") as fh:
    json.dump(data, fh, separators=(",", ":"))
print("wrote src/data/xray-brem-W.json", len(KVP_GRID), "kVp rows")
