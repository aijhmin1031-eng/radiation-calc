import { useMemo, useState } from "react";
import nuclides from "../../data/nuclides.json";
import att from "../../data/attenuation.json";
import type { NuclideMap, Material } from "../../engine/types";
import type { Row } from "../../engine/interp";
import { shieldedDoseRate, linearAttenuation, DENSITY_G_CM3, type ShieldMode } from "../../engine/gamma";
import { convert, UNITS } from "../../engine/units";
import { hvlFromMu, tvlFromMu } from "../../engine/alara";
import { NuclidePicker } from "../ui/NuclidePicker";
import { Field, NumberInput, Select, RadioRow, Check } from "../ui/Field";
import { Headline, Rows, fmt, Warn } from "../ui/Result";

const N = nuclides as unknown as NuclideMap;
const A = att as unknown as Record<Material, Row[]>;
const ACT = Object.keys(UNITS.activity.u);
const DIST = { cm: 0.01, m: 1, in: 0.0254, ft: 0.3048 } as const;
const THICK = { mm: 0.1, cm: 1, in: 2.54 } as const;
const RATE = ["µGy/h", "mGy/h", "Gy/h", "µSv/h", "mSv/h", "mR/h", "R/h"] as const;
type RateUnit = typeof RATE[number];

/** 선량률 단위 환산 — 계산은 mGy/h(공기커마)로 하고 표시할 때만 옮긴다.
 *  ★ Sv 는 광자에 대해 w_R=1 이라 수치가 같다. 그것을 화면에 적는다(같은 양이 아니다). */
const MGY_PER_R = 2.58e-4 * 33.97 * 1e3;        // 1 R 의 공기커마 = 8.764 mGy
const RATE_FACTOR: Record<RateUnit, number> = {
  "µGy/h": 1e3, "mGy/h": 1, "Gy/h": 1e-3,
  "µSv/h": 1e3, "mSv/h": 1,
  "R/h": 1 / MGY_PER_R, "mR/h": 1e3 / MGY_PER_R,
};

const MATERIALS: { value: Material; label: string }[] = [
  { value: "lead", label: "Lead" }, { value: "iron", label: "Iron / steel" },
  { value: "concrete", label: "Concrete" }, { value: "tungsten", label: "Tungsten" },
  { value: "water", label: "Water" }, { value: "aluminum", label: "Aluminium" },
  { value: "copper", label: "Copper" }, { value: "air", label: "Air" },
];
type Mode = "dose" | "activity" | "thickness";

export default function GammaShielding() {
  const [mode, setMode] = useState<Mode>("dose");
  const [key, setKey] = useState("Ir-192");
  const [act, setAct] = useState(37); const [actU, setActU] = useState("GBq");
  const [dist, setDist] = useState(1); const [distU, setDistU] = useState<keyof typeof DIST>("m");
  const [mat, setMat] = useState<Material>("lead");
  const [thick, setThick] = useState(0); const [thickU, setThickU] = useState<keyof typeof THICK>("mm");
  const [shieldMode, setShieldMode] = useState<ShieldMode>("attenuation");
  const [bergerA, setBergerA] = useState(0); const [bergerB, setBergerB] = useState(0.05);
  const [delta, setDelta] = useState(20);
  const [rateU, setRateU] = useState<RateUnit>("µSv/h");
  const [targetRate, setTargetRate] = useState(20);
  const [customRho, setCustomRho] = useState(false);
  const [rho, setRho] = useState(DENSITY_G_CM3.lead);

  const n = N[key];
  const gbq = convert(act, actU, "Bq", "activity") / 1e9;
  const d = dist * DIST[distU];
  const tcm = thick * THICK[thickU];
  const density = customRho ? rho : DENSITY_G_CM3[mat];

  const calc = useMemo(() => shieldedDoseRate({
    lines: n.lines, air: A.air, shield: A[mat], material: mat,
    densityOverride: customRho ? rho : undefined,
    activityGBq: mode === "activity" ? 1 : gbq, distanceM: d > 0 ? d : NaN,
    thicknessCm: tcm, mode: shieldMode,
    berger: shieldMode === "buildup" ? { a: bergerA, b: bergerB } : undefined,
    deltaKeV: delta,
  }), [key, mat, gbq, d, tcm, shieldMode, bergerA, bergerB, delta, mode, customRho, rho]);

  // 대표 에너지 — 방출강도 가중 평균. HVL·TVL 을 그 에너지에서 보여 준다.
  const eRep = useMemo(() => {
    const L = n.lines.filter((l) => l[0] >= delta);
    const w = L.reduce((s, l) => s + l[1], 0);
    return w > 0 ? L.reduce((s, l) => s + l[0] * l[1], 0) / w / 1000 : NaN;
  }, [key, delta]);
  const mu = Number.isFinite(eRep) ? linearAttenuation(A[mat], eRep, mat, customRho ? rho : undefined) : NaN;

  const toUnit = (mGyPerH: number) => mGyPerH * RATE_FACTOR[rateU];
  const noGamma = n.lines.filter((l) => l[0] >= delta).length === 0;

  // 역산 — 목표 선량률을 만드는 두께 / 활성도
  const solved = useMemo(() => {
    if (mode === "activity") {
      const perGBq = calc.doseRate;                     // 1 GBq 기준
      const want = targetRate / RATE_FACTOR[rateU];     // mGy/h
      return perGBq > 0 ? want / perGBq : NaN;          // GBq
    }
    if (mode === "thickness") {
      const want = targetRate / RATE_FACTOR[rateU];
      let lo = 0, hi = 200;
      const at = (x: number) => shieldedDoseRate({
        lines: n.lines, air: A.air, shield: A[mat], material: mat,
        densityOverride: customRho ? rho : undefined,
        activityGBq: gbq, distanceM: d, thicknessCm: x, mode: shieldMode,
        berger: shieldMode === "buildup" ? { a: bergerA, b: bergerB } : undefined,
        deltaKeV: delta,
      }).doseRate;
      if (at(0) <= want) return 0;
      if (at(hi) > want) return NaN;                    // 2 m 로도 못 내린다
      for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (at(m) > want) lo = m; else hi = m; }
      return (lo + hi) / 2;                             // cm
    }
    return NaN;
  }, [mode, targetRate, rateU, calc.doseRate, key, mat, gbq, d, shieldMode, bergerA, bergerB, delta, customRho, rho]);

  return (
    <div className="space-y-5">
      <div>
        <span className="label">What do you want to find</span>
        <RadioRow name="Mode" value={mode} onChange={setMode} options={[
          { value: "dose", label: "Dose rate", hint: "From a known activity" },
          { value: "activity", label: "Activity", hint: "From a measured dose rate" },
          { value: "thickness", label: "Shield thickness", hint: "To reach a target dose rate" },
        ]} />
      </div>

      <NuclidePicker nuclides={N} value={key} onChange={setKey} require={["gamma", "xray"]} />
      {noGamma ? <Warn>{key} emits no photons above {delta} keV — lower the cutoff or pick another nuclide.</Warn> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {mode !== "activity" ? (
          <>
            <Field label="Activity"><NumberInput value={Number.isFinite(act) ? act : ""} onChange={setAct} /></Field>
            <Field label="Unit"><Select value={actU} onChange={setActU} options={ACT} /></Field>
          </>
        ) : null}
        <Field label="Distance"><NumberInput value={Number.isFinite(dist) ? dist : ""} onChange={setDist} /></Field>
        <Field label="Distance unit">
          <Select value={distU} onChange={setDistU} options={[
            { value: "cm" as const, label: "centimetres" }, { value: "m" as const, label: "metres" },
            { value: "in" as const, label: "inches" }, { value: "ft" as const, label: "feet" }]} />
        </Field>
        {mode !== "dose" ? (
          <>
            <Field label={mode === "activity" ? "Measured dose rate" : "Target dose rate"}>
              <NumberInput value={Number.isFinite(targetRate) ? targetRate : ""} onChange={setTargetRate} />
            </Field>
            <Field label="Dose rate unit"><Select value={rateU} onChange={setRateU} options={RATE as unknown as RateUnit[]} /></Field>
          </>
        ) : (
          <Field label="Show dose rate in"><Select value={rateU} onChange={setRateU} options={RATE as unknown as RateUnit[]} /></Field>
        )}
      </div>

      <details className="card p-4" open={mode === "thickness"}>
        <summary className="cursor-pointer text-[14px] font-semibold text-ink">Shielding</summary>
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Material"><Select value={mat} onChange={(m) => { setMat(m); setRho(DENSITY_G_CM3[m]); }} options={MATERIALS} /></Field>
            {mode !== "thickness" ? (
              <Field label="Thickness">
                <div className="flex gap-2">
                  <NumberInput value={Number.isFinite(thick) ? thick : ""} onChange={setThick} min={0} />
                  <Select value={thickU} onChange={setThickU} options={["mm", "cm", "in"] as (keyof typeof THICK)[]} />
                </div>
              </Field>
            ) : null}
          </div>

          <div>
            <span className="label">Scatter treatment</span>
            <RadioRow name="Shield mode" value={shieldMode} onChange={setShieldMode} options={[
              { value: "none", label: "No shield" },
              { value: "attenuation", label: "Attenuation only" },
              { value: "buildup", label: "With buildup" },
            ]} />
          </div>

          {shieldMode === "attenuation" && tcm > 0 ? (
            <Warn>
              <strong>This underestimates.</strong> Photons that scatter inside the shield and still reach
              you are not counted. Real dose rates behind a thick shield are higher — often by a factor of
              several. Use it as a lower bound, not a design value.
            </Warn>
          ) : null}

          {shieldMode === "buildup" ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Berger a"><NumberInput value={Number.isFinite(bergerA) ? bergerA : ""} onChange={setBergerA} step={0.1} /></Field>
                <Field label="Berger b"><NumberInput value={Number.isFinite(bergerB) ? bergerB : ""} onChange={setBergerB} step={0.01} /></Field>
              </div>
              <Warn>
                B = 1 + a·µx·e<sup>b·µx</sup>. <strong>We do not ship coefficients.</strong> The widely used
                geometric-progression tables are the body of a paid standard, so enter a and b for your
                material and energy from your own reference. With a = 0 the buildup factor is 1 and the
                result equals attenuation only.
              </Warn>
            </div>
          ) : null}

          <Check checked={customRho} onChange={setCustomRho}
            label="Override the density" hint={`Default for ${mat}: ${DENSITY_G_CM3[mat]} g/cm³`} />
          {customRho ? (
            <Field label="Density"><NumberInput value={Number.isFinite(rho) ? rho : ""} onChange={setRho} step={0.1} suffix="g/cm³" /></Field>
          ) : null}
        </div>
      </details>

      <details className="card p-4">
        <summary className="cursor-pointer text-[14px] font-semibold text-ink">Low-energy cutoff δ</summary>
        <div className="mt-4 space-y-3">
          <Field label="Ignore photons below" hint="Published gamma constants conventionally use 20 keV — photons below it are absorbed by the source capsule and do not reach you.">
            <NumberInput value={Number.isFinite(delta) ? delta : ""} onChange={setDelta} min={0} suffix="keV" />
          </Field>
          {delta < 15 ? (
            <Warn>
              Below about 15 keV the answer is dominated by X-rays that a real capsule absorbs.
              For Am-241 a cutoff of 10 keV instead of 20 keV raises the result roughly eightfold.
            </Warn>
          ) : null}
        </div>
      </details>

      {mode === "dose" ? (
        <Headline label={`Dose rate at ${fmt(d)} m`} value={toUnit(calc.doseRate)} unit={rateU}
          note={<>Air kerma from {n.lines.filter((l) => l[0] >= delta).length} photon lines.
            {rateU.includes("Sv") ? " Numerically equal to air kerma because the radiation weighting factor for photons is 1 — they are still different quantities." : ""}</>} />
      ) : mode === "activity" ? (
        <Headline label="Activity that produces that dose rate" value={solved} unit="GBq"
          note={`${fmt(solved * 1e9 / 3.7e10, 4)} Ci — assumes a bare point source at ${fmt(d)} m with the shielding set above.`} />
      ) : (
        <Headline label={`${MATERIALS.find((m) => m.value === mat)!.label} needed`}
          value={Number.isFinite(solved) ? fmt(solved * 10) : "—"} unit="mm"
          note={!Number.isFinite(solved) ? "Even 2 m of this material does not reach the target — move further away or reduce the activity."
            : solved === 0 ? "Already below the target with no shielding."
            : `${fmt(solved, 3)} cm. ${shieldMode === "attenuation" ? "Scatter is not included, so this thickness is a minimum — the real requirement is greater." : ""}`} />
      )}

      <Rows rows={[
        { k: "Gamma constant Γ", v: `${fmt(n.gamma_const, 4)} mGy·m²/(GBq·h)`, hint: `computed from the spectrum at δ = 20 keV` },
        { k: "Unshielded dose rate", v: `${fmt(toUnit(calc.unshielded), 4)} ${rateU}` },
        ...(tcm > 0 && mode !== "thickness" ? [
          { k: "Transmission", v: `${fmt(calc.transmission * 100, 3)}%`, hint: `through ${fmt(tcm, 3)} cm of ${mat}` },
          { k: "Attenuation factor", v: calc.transmission > 0 ? `${fmt(1 / calc.transmission, 3)}×` : "—" },
        ] : []),
        { k: "Intensity-weighted energy", v: `${fmt(eRep * 1000, 4)} keV` },
        { k: `Half-value layer (${mat})`, v: Number.isFinite(mu) ? `${fmt(hvlFromMu(mu) * 10, 3)} mm` : "—", hint: "at the weighted energy" },
        { k: `Tenth-value layer (${mat})`, v: Number.isFinite(mu) ? `${fmt(tvlFromMu(mu) * 10, 3)} mm` : "—" },
        { k: "Density used", v: `${fmt(density, 4)} g/cm³` },
      ]} />

      <Warn>
        Point-source geometry in air. No scatter from room surfaces, no source self-absorption, no
        capsule, no dose buildup in tissue. This does not replace a shielding design or a survey.
      </Warn>
    </div>
  );
}
