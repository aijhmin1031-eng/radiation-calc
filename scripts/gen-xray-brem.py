# scripts/gen-xray-brem.py  —  run locally: <venv>/python scripts/gen-xray-brem.py
# Requires SpekPy 2.5.4 in the active environment. Output committed; browser/CI never run this.
import json, datetime, spekpy as sp

ANODE_ANGLE = 20          # deg, ideal matched-field take-off
EMAX = 300                # keV grid ceiling
KVP_GRID = list(range(20, 301, 10))   # 20..300 kV, 10 kV steps
STEP = 1.0                # keV display grid

def brem_row(kvp):
    s = sp.Spek(kvp=kvp, th=ANODE_ANGLE, dk=STEP, physics="casim", char=False)  # char off = brem only
    k, f = s.get_spectrum(edges=False)                 # k in keV, f fluence
    row = [0.0] * (EMAX + 1)
    for e, fl in zip(k, f):
        i = int(round(e))
        if 0 <= i <= EMAX and e <= kvp + 1e-6:
            row[i] = round(float(fl), 6)               # 6 sig-fig keeps the file small
    return row

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
