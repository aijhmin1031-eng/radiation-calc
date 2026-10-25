import { useEffect, useMemo, useRef, useState } from "react";
import { bremSpectrum, meanEnergy, KVP_MIN, KVP_MAX } from "../../engine/xray";
import { polylinePath, scales, energyTicks, fluenceTicks, type ChartBox } from "../../engine/xray-chart";

// The SVG is drawn at its rendered pixel width (measured below), so the font sizes are real pixels:
// tick numbers are 13 px and axis titles 15 px, the body text size, on a phone as on a desktop.
const PAD = { padL: 62, padR: 16, padT: 14, padB: 56 };
const TICK_PX = 13;
const TITLE_PX = 15;

const SUP: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶" };
const fluenceLabel = (v: number, log: boolean) =>
  log ? (v === 1 ? "1" : `10${String(Math.round(Math.log10(v))).replace(/./g, (c) => SUP[c] ?? c)}`) : String(v);

export default function XraySpectrum() {
  const [kvp, setKvp] = useState(100);
  const [log, setLog] = useState(false);
  const [width, setWidth] = useState(820);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(260, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const spec = useMemo(() => bremSpectrum(kvp), [kvp]);
  const fMax = useMemo(() => Math.max(...spec.map((p) => p.fluence), 1e-30), [spec]);
  const mean = useMemo(() => meanEnergy(spec), [spec]);

  const box: ChartBox = { w: width, h: Math.round(Math.min(420, Math.max(260, width * 0.5))), ...PAD };
  const axis = { eMax: kvp, log };
  const { sx, sy } = scales(box, axis);
  const d = polylinePath(spec, box, { ...axis, fMax });
  const x0 = box.padL, x1 = box.w - box.padR, y0 = box.h - box.padB, y1 = box.padT;

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
      <div ref={wrap}>
        <svg
          viewBox={`0 0 ${box.w} ${box.h}`}
          width={box.w}
          height={box.h}
          style={{ display: "block", maxWidth: "100%", height: "auto" }}
          role="img"
          aria-label={`Tungsten bremsstrahlung spectrum at ${kvp} kVp, mean energy ${mean.toFixed(1)} keV`}
        >
          <g stroke="currentColor" strokeWidth={1}>
            {fluenceTicks(log).map((v) => (
              <line key={`gy${v}`} x1={x0} x2={x1} y1={sy(v)} y2={sy(v)} opacity={0.12} />
            ))}
            {energyTicks(kvp).map((v) => (
              <line key={`tx${v}`} x1={sx(v)} x2={sx(v)} y1={y0} y2={y0 + 5} opacity={0.5} />
            ))}
            <line x1={x0} y1={y0} x2={x1} y2={y0} opacity={0.5} />
            <line x1={x0} y1={y1} x2={x0} y2={y0} opacity={0.5} />
          </g>
          <g fontSize={TICK_PX} fill="currentColor" opacity={0.75}>
            {energyTicks(kvp).map((v) => (
              <text key={`lx${v}`} x={sx(v)} y={y0 + 20} textAnchor="middle">{v}</text>
            ))}
            {fluenceTicks(log).map((v) => (
              <text key={`ly${v}`} x={x0 - 7} y={sy(v)} dy="0.35em" textAnchor="end">{fluenceLabel(v, log)}</text>
            ))}
          </g>
          <path d={d} fill="none" stroke="#2563eb" strokeWidth={2} strokeLinejoin="round" />
          <g fontSize={TITLE_PX} fill="currentColor">
            <text x={(x0 + x1) / 2} y={box.h - 8} textAnchor="middle">Photon energy (keV)</text>
            <text transform={`translate(15 ${(y0 + y1) / 2}) rotate(-90)`} textAnchor="middle">Relative fluence</text>
          </g>
        </svg>
      </div>
      {/* Accessibility: a text data-table fallback arrives in a later milestone; the aria-label above describes the view. */}
    </div>
  );
}
