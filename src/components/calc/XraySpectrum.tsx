import { useMemo, useState } from "react";
import { bremSpectrum, meanEnergy, KVP_MIN, KVP_MAX } from "../../engine/xray";
import { polylinePath, type ChartBox } from "../../engine/xray-chart";

const BOX: ChartBox = { w: 820, h: 420, padL: 60, padR: 20, padT: 20, padB: 44 };

export default function XraySpectrum() {
  const [kvp, setKvp] = useState(100);
  const [log, setLog] = useState(false);
  const spec = useMemo(() => bremSpectrum(kvp), [kvp]);
  const fMax = useMemo(() => Math.max(...spec.map((p) => p.fluence), 1e-30), [spec]);
  const mean = useMemo(() => meanEnergy(spec), [spec]);
  const d = polylinePath(spec, BOX, { eMax: KVP_MAX, fMax, log });

  return (
    <div>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <label>
          Tube voltage{" "}
          <input
            type="range"
            min={KVP_MIN}
            max={KVP_MAX}
            step={1}
            value={kvp}
            onChange={(e) => setKvp(+e.target.value)}
            aria-label="Tube voltage (kVp)"
          />
          <output> {kvp} kVp</output>
        </label>
        <label>
          <input type="checkbox" checked={log} onChange={(e) => setLog(e.target.checked)} /> log scale
        </label>
        <span>
          Mean energy: {mean.toFixed(1)} keV · endpoint {kvp} keV
        </span>
      </div>
      <svg
        viewBox={`0 0 ${BOX.w} ${BOX.h}`}
        style={{ width: "100%", height: "auto" }}
        role="img"
        aria-label={`Tungsten bremsstrahlung spectrum at ${kvp} kVp, mean energy ${mean.toFixed(1)} keV`}
      >
        <line x1={BOX.padL} y1={BOX.h - BOX.padB} x2={BOX.w - BOX.padR} y2={BOX.h - BOX.padB} stroke="currentColor" strokeWidth={1} opacity={0.4} />
        <line x1={BOX.padL} y1={BOX.padT} x2={BOX.padL} y2={BOX.h - BOX.padB} stroke="currentColor" strokeWidth={1} opacity={0.4} />
        <path d={d} fill="none" stroke="#2563eb" strokeWidth={2} strokeLinejoin="round" />
        <text x={BOX.w / 2} y={BOX.h - 8} textAnchor="middle" fontSize={13} fill="currentColor">
          Photon energy (keV)
        </text>
      </svg>
      {/* Accessibility: a text data-table fallback arrives in a later milestone; the aria-label above describes the view. */}
    </div>
  );
}
