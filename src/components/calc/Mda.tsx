import { useMemo, useState } from "react";
import { minimumDetectableActivity, scanMdc } from "../../engine/mda";
import { convert } from "../../engine/units";
import { Field, NumberInput, Select, RadioRow, Check } from "../ui/Field";
import { SaveBar } from "../ui/SaveBar";
import { initialState, pick as pickState } from "../../lib/restore";
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

  const kk = Number(k);
  const totalEff = (eff / 100) * (useSurface ? surfEff / 100 : 1);

  const fixed = useMemo(() => minimumDetectableActivity({
    bgCps: bgCpm / 60, countTimeS: timeS, efficiency: totalEff,
    sampleQty: useSurface ? areaCm2 / 100 : 1, k: kk,
  }), [bgCpm, timeS, totalEff, areaCm2, useSurface, kk]);

  const scan = useMemo(() => scanMdc({
    bgCps: bgCpm / 60, scanSpeedCmPerS: speed, detectorWidthCm: width,
    efficiency: eff / 100, surfaceEfficiency: surfEff / 100,
    probeAreaCm2: areaCm2, observerEff: obsEff / 100, dPrime,
  }), [bgCpm, speed, width, eff, surfEff, areaCm2, obsEff, dPrime]);

  const asUnit = (bqOrBqCm2: number) => {
    if (unit === "Bq") return bqOrBqCm2;
    if (unit === "dpm") return bqOrBqCm2 * 60;
    if (unit === "pCi") return convert(bqOrBqCm2, "Bq", "pCi", "activity");
    if (unit === "Bq/cm²") return bqOrBqCm2 / (useSurface ? 1 : areaCm2);
    return bqOrBqCm2 * 60 * 100 / (useSurface ? areaCm2 : areaCm2);
  };

  return (
    <div className="space-y-5">
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
            <Field label="Detectability index d′" hint="1.38 gives 95% true positive at 25% false positive">
              <NumberInput value={Number.isFinite(dPrime) ? dPrime : ""} onChange={setDPrime} step={0.01} />
            </Field>
          </div>
        </details>
      ) : null}

      <Field label="Report the answer in"><Select value={unit} onChange={setUnit} options={OUT as unknown as typeof OUT[number][]} /></Field>

      {mode === "scaler" ? (
        <>
          <Headline label="Minimum detectable activity" value={asUnit(fixed.mda)} unit={unit}
            note={`Anything below this cannot be reliably distinguished from background in a ${fmt(timeS)} s count.`} />
          <Rows rows={[
            { k: "Background counts collected", v: fmt(fixed.bgCounts, 5), hint: `${bgCpm} cpm × ${fmt(timeS)} s` },
            { k: "Critical level L_C", v: `${fmt(fixed.lc, 4)} counts`, hint: "the decision threshold — above it you report a detection" },
            { k: "Detection limit L_D", v: `${fmt(fixed.ld, 4)} counts`, hint: "the true amount that will exceed L_C with the chosen confidence" },
            { k: "Total efficiency used", v: `${fmt(totalEff * 100, 4)}%` },
            { k: "Counting four times as long", v: `${fmt(asUnit(minimumDetectableActivity({ bgCps: bgCpm / 60, countTimeS: timeS * 4, efficiency: totalEff, sampleQty: useSurface ? areaCm2 / 100 : 1, k: kk }).mda), 4)} ${unit}`,
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
          <Headline label="Scan MDC" value={scan.scanMdc} unit="Bq/cm²"
            note={`At ${fmt(speed)} cm/s the probe sees any one spot for ${fmt(scan.observationIntervalS, 3)} s.`} />
          <Rows rows={[
            { k: "Observation interval", v: `${fmt(scan.observationIntervalS, 4)} s`, hint: `${fmt(width)} cm ÷ ${fmt(speed)} cm/s` },
            { k: "Ideal MDCR", v: `${fmt(scan.mdcr, 4)} cpm`, hint: "what a perfect observer would notice" },
            { k: "MDCR with observer efficiency", v: `${fmt(scan.mdcrSurveyor, 4)} cpm`, hint: `divided by √${fmt(obsEff / 100, 2)}` },
            { k: "In dpm/100 cm²", v: fmt(scan.scanMdc * 60 * 100, 4) },
            { k: "Halving the scan speed", v: `${fmt(scanMdc({ bgCps: bgCpm / 60, scanSpeedCmPerS: speed / 2, detectorWidthCm: width, efficiency: eff / 100, surfaceEfficiency: surfEff / 100, probeAreaCm2: areaCm2, observerEff: obsEff / 100, dPrime }).scanMdc, 4)} Bq/cm²`,
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
        inputs={{ mode, k, bgCpm, timeS, eff, useSurface, surfEff, areaCm2, unit, speed, width, obsEff, dPrime }}
        outputs={mode === "scaler" ? { ...fixed } : { ...scan }}
        summary={`${mode === "scaler" ? `${fmt(timeS)} s count` : `scan ${fmt(speed)} cm/s`} — ${fmt(bgCpm)} cpm bg`} />
    </div>
  );
}
