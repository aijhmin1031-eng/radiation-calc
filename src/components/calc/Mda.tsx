import { useMemo, useState } from "react";
import { minimumDetectableActivity, scanMdc } from "../../engine/mda";
import { convert } from "../../engine/units";
import { Field, NumberInput, Select, RadioRow, Check } from "../ui/Field";
import { SaveBar } from "../ui/SaveBar";
import { initialState, pick as pickState } from "../../lib/restore";
import { useCommitted } from "../../lib/commit";
import { CalcButton } from "../ui/CalcButton";
import { Headline, Rows, fmt, Warn } from "../ui/Result";

type Mode = "scaler" | "scan";
const CONF = [
  { value: "1.645", label: "95% / 95%", hint: "k = 1.645 — the usual choice" },
  { value: "1.96",  label: "97.5%",     hint: "k = 1.96" },
  { value: "2.326", label: "99%",       hint: "k = 2.326" },
];
const OUT = ["Bq", "dpm", "Bq/cm²", "dpm/100cm²", "pCi"] as const;

export default function Mda() {
  const restored = initialState();
  const [mode, setMode] = useState<Mode>(pickState(restored, "mode", "scaler"));
  const [k, setK] = useState(pickState(restored, "k", "1.645"));
  // 고정 계수
  const [bgCpm, setBgCpm] = useState(pickState(restored, "bgCpm", 300));
  const [timeS, setTimeS] = useState(pickState(restored, "timeS", 600));
  const [eff, setEff] = useState(pickState(restored, "eff", 25));
  const [useSurface, setUseSurface] = useState(pickState(restored, "useSurface", false));
  const [surfEff, setSurfEff] = useState(pickState(restored, "surfEff", 50));
  const [areaCm2, setAreaCm2] = useState(pickState(restored, "areaCm2", 100));
  const [unit, setUnit] = useState<typeof OUT[number]>(pickState(restored, "unit", "Bq"));
  // 스캔
  const [speed, setSpeed] = useState(pickState(restored, "speed", 5));
  const [width, setWidth] = useState(pickState(restored, "width", 10));
  const [obsEff, setObsEff] = useState(pickState(restored, "obsEff", 50));
  const [dPrime, setDPrime] = useState(pickState(restored, "dPrime", 1.38));

  /* ★ 답은 **커밋된 스냅숏**(c)에서만 나온다 — 칸 상태는 그리는 데만 쓴다. */
  const { c, dirty, invalid, commit, keys } = useCommitted({
    mode, k, bgCpm, timeS, eff, useSurface, surfEff, areaCm2, unit, speed, width, obsEff, dPrime });

  const kk = Number(c.k);
  const totalEff = (c.eff / 100) * (c.useSurface ? c.surfEff / 100 : 1);

  const fixed = useMemo(() => minimumDetectableActivity({
    bgCps: c.bgCpm / 60, countTimeS: c.timeS, efficiency: totalEff,
    sampleQty: c.useSurface ? c.areaCm2 / 100 : 1, k: kk,
  }), [c.bgCpm, c.timeS, totalEff, c.areaCm2, c.useSurface, kk]);

  const scan = useMemo(() => scanMdc({
    bgCps: c.bgCpm / 60, scanSpeedCmPerS: c.speed, detectorWidthCm: c.width,
    efficiency: c.eff / 100, surfaceEfficiency: c.surfEff / 100,
    probeAreaCm2: c.areaCm2, observerEff: c.obsEff / 100, dPrime: c.dPrime,
  }), [c.bgCpm, c.speed, c.width, c.eff, c.surfEff, c.areaCm2, c.obsEff, c.dPrime]);

  const asUnit = (bqOrBqCm2: number) => {
    if (c.unit === "Bq") return bqOrBqCm2;
    if (c.unit === "dpm") return bqOrBqCm2 * 60;
    if (c.unit === "pCi") return convert(bqOrBqCm2, "Bq", "pCi", "activity");
    if (c.unit === "Bq/cm²") return bqOrBqCm2 / (c.useSurface ? 1 : c.areaCm2);
    return bqOrBqCm2 * 60 * 100 / (c.useSurface ? c.areaCm2 : c.areaCm2);
  };

  return (
    <div className="space-y-5" {...keys}>
      <div>
        <span className="label">Measurement type</span>
        <RadioRow name="Mode" value={mode} onChange={setMode} options={[
          { value: "scaler", label: "Fixed count", hint: "Sample counted for a set time" },
          { value: "scan", label: "Scanning survey", hint: "Probe moved over a surface" },
        ]} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Background count rate"><NumberInput value={Number.isFinite(bgCpm) ? bgCpm : ""} onChange={setBgCpm} suffix="cpm" /></Field>
        <Field label="Detector efficiency" hint="Counts per emission from the source">
          <NumberInput value={Number.isFinite(eff) ? eff : ""} onChange={setEff} suffix="%" />
        </Field>
        {mode === "scaler" ? (
          <>
            <Field label="Count time"><NumberInput value={Number.isFinite(timeS) ? timeS : ""} onChange={setTimeS} suffix="s" /></Field>
            <Field label="Confidence"><Select value={k} onChange={setK} options={CONF} /></Field>
          </>
        ) : (
          <>
            <Field label="Scan speed"><NumberInput value={Number.isFinite(speed) ? speed : ""} onChange={setSpeed} suffix="cm/s" /></Field>
            <Field label="Detector width" hint="Along the direction of travel">
              <NumberInput value={Number.isFinite(width) ? width : ""} onChange={setWidth} suffix="cm" />
            </Field>
          </>
        )}
      </div>

      <details className="card p-4" open={mode === "scan"}>
        <summary className="cursor-pointer text-[14px] font-semibold text-ink">Surface contamination</summary>
        <div className="mt-4 space-y-3">
          <Check checked={useSurface || mode === "scan"} onChange={setUseSurface}
            label="Report as surface activity" hint="Applies the surface emission efficiency and the probe area" />
          {(useSurface || mode === "scan") ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Surface efficiency" hint="Fraction of emissions leaving the surface — 0.5 for most, 0.25 for absorbed betas">
                <NumberInput value={Number.isFinite(surfEff) ? surfEff : ""} onChange={setSurfEff} suffix="%" />
              </Field>
              <Field label="Probe area"><NumberInput value={Number.isFinite(areaCm2) ? areaCm2 : ""} onChange={setAreaCm2} suffix="cm²" /></Field>
            </div>
          ) : null}
        </div>
      </details>

      {mode === "scan" ? (
        <details className="card p-4">
          <summary className="cursor-pointer text-[14px] font-semibold text-ink">Surveyor performance</summary>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Observer efficiency" hint="How much of the ideal detector performance the person achieves. MARSSIM uses 0.5.">
              <NumberInput value={Number.isFinite(obsEff) ? obsEff : ""} onChange={setObsEff} suffix="%" />
            </Field>
            <Field label="Detectability index d′" hint="MARSSIM: 1.38 is 95% true positive at 60% false positive; 2.32 for 25%">
              <NumberInput value={Number.isFinite(dPrime) ? dPrime : ""} onChange={setDPrime} step={0.01} />
            </Field>
          </div>
        </details>
      ) : null}

      <Field label="Report the answer in"><Select value={unit} onChange={setUnit} options={OUT as unknown as typeof OUT[number][]} /></Field>

      <CalcButton dirty={dirty} invalid={invalid} onClick={commit} />

      {c.mode === "scaler" ? (
        <>
          <Headline stale={dirty} label="Minimum detectable activity" value={asUnit(fixed.mda)} unit={c.unit}
            note={`Anything below this cannot be reliably distinguished from background in a ${fmt(c.timeS)} s count.`} />
          <Rows rows={[
            { k: "Background counts collected", v: fmt(fixed.bgCounts, 5), hint: `${fmt(c.bgCpm)} cpm × ${fmt(c.timeS)} s` },
            { k: "Critical level L_C", v: `${fmt(fixed.lc, 4)} counts`, hint: "the decision threshold — above it you report a detection" },
            { k: "Detection limit L_D", v: `${fmt(fixed.ld, 4)} counts`, hint: "the true amount that will exceed L_C with the chosen confidence" },
            { k: "Total efficiency used", v: `${fmt(totalEff * 100, 4)}%` },
            { k: "Counting four times as long", v: `${fmt(asUnit(minimumDetectableActivity({ bgCps: c.bgCpm / 60, countTimeS: c.timeS * 4, efficiency: totalEff, sampleQty: c.useSurface ? c.areaCm2 / 100 : 1, k: kk }).mda), 4)} ${c.unit}`,
              hint: "MDA improves only with the square root of time" },
          ]} />
          <Warn>
            L_C and L_D answer different questions. <strong>L_C</strong> is the count you compare a single
            measurement against to decide "detected or not". <strong>L_D</strong> is the true activity that
            will be detected with your stated confidence. Reporting L_C as the detection limit understates
            what the instrument can actually find.
          </Warn>
        </>
      ) : (
        <>
          <Headline stale={dirty} label="Scan MDC" value={scan.scanMdc} unit="Bq/cm²"
            note={`At ${fmt(c.speed)} cm/s the probe sees any one spot for ${fmt(scan.observationIntervalS, 3)} s.`} />
          <Rows rows={[
            { k: "Observation interval", v: `${fmt(scan.observationIntervalS, 4)} s`, hint: `${fmt(c.width)} cm ÷ ${fmt(c.speed)} cm/s` },
            { k: "Ideal MDCR", v: `${fmt(scan.mdcr, 4)} cpm`, hint: "what a perfect observer would notice" },
            { k: "MDCR with observer efficiency", v: `${fmt(scan.mdcrSurveyor, 4)} cpm`, hint: `divided by √${fmt(c.obsEff / 100, 2)}` },
            { k: "In dpm/100 cm²", v: fmt(scan.scanMdc * 60 * 100, 4) },
            { k: "Halving the scan speed", v: `${fmt(scanMdc({ bgCps: c.bgCpm / 60, scanSpeedCmPerS: c.speed / 2, detectorWidthCm: c.width, efficiency: c.eff / 100, surfaceEfficiency: c.surfEff / 100, probeAreaCm2: c.areaCm2, observerEff: c.obsEff / 100, dPrime: c.dPrime }).scanMdc, 4)} Bq/cm²`,
              hint: "scanning slower is the cheapest way to lower the MDC" },
          ]} />
          <Warn>
            Scan MDC depends on the person, not only the instrument. The observer efficiency term exists
            because a surveyor has to notice a brief change in an audible or visual signal — it is the
            reason a documented scan speed matters as much as the detector choice.
          </Warn>
        </>
      )}

      <SaveBar tool="mda"
        inputs={{ mode: c.mode, k: c.k, bgCpm: c.bgCpm, timeS: c.timeS, eff: c.eff, useSurface: c.useSurface, surfEff: c.surfEff, areaCm2: c.areaCm2, unit: c.unit, speed: c.speed, width: c.width, obsEff: c.obsEff, dPrime: c.dPrime }}
        outputs={c.mode === "scaler" ? { ...fixed } : { ...scan }}
        summary={`${c.mode === "scaler" ? `${fmt(c.timeS)} s count` : `scan ${fmt(c.speed)} cm/s`} — ${fmt(c.bgCpm)} cpm bg`} />
    </div>
  );
}
