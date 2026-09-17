import { useMemo, useState } from "react";
import nuclides from "../../data/nuclides.json";
import type { NuclideMap } from "../../engine/types";
import { infiniteMediumDoseRate, semiInfiniteSurfaceDoseRate, betaRange, betaRangeCm,
         betaTransmission, bremsstrahlungYield } from "../../engine/beta";
import { DENSITY_G_CM3 } from "../../engine/gamma";
import { convert, UNITS } from "../../engine/units";
import { NuclidePicker } from "../ui/NuclidePicker";
import { Field, NumberInput, Select, RadioRow } from "../ui/Field";
import { SaveBar } from "../ui/SaveBar";
import { initialState, pick as pickState } from "../../lib/restore";
import { useCommitted } from "../../lib/commit";
import { CalcButton } from "../ui/CalcButton";
import { Headline, Rows, fmt, Warn } from "../ui/Result";

const N = nuclides as unknown as NuclideMap;
const ACT = Object.keys(UNITS.activity.u);

/** 차폐재 — 베타는 **낮은 Z** 로 막는다. 그것이 이 화면의 요점이라 Z 를 함께 든다. */
const ABSORBERS = [
  { value: "acrylic", label: "Acrylic (PMMA)", z: 6.5, rho: 1.19 },
  { value: "water", label: "Water", z: 7.4, rho: 1.0 },
  { value: "glass", label: "Glass", z: 11, rho: 2.5 },
  { value: "aluminum", label: "Aluminium", z: 13, rho: DENSITY_G_CM3.aluminum },
  { value: "iron", label: "Iron / steel", z: 26, rho: DENSITY_G_CM3.iron },
  { value: "lead", label: "Lead", z: 82, rho: DENSITY_G_CM3.lead },
] as const;
type AbsKey = typeof ABSORBERS[number]["value"];
type Mode = "shield" | "dose";

export default function Beta() {
  const restored = initialState();
  const [mode, setMode] = useState<Mode>(pickState(restored, "mode", "shield"));
  const [nuclide, setNuclide] = useState(pickState(restored, "nuclide", "Y-90"));
  const [absK, setAbsK] = useState<AbsKey>(pickState(restored, "absK", "acrylic"));
  const [thick, setThick] = useState(pickState(restored, "thick", 2));
  const [act, setAct] = useState(pickState(restored, "act", 37)); const [actU, setActU] = useState(pickState(restored, "actU", "MBq"));
  const [massKg, setMassKg] = useState(pickState(restored, "massKg", 1));

  /* ★ 답은 **커밋된 스냅숏**(c)에서만 나온다. 칸 상태(nuclide·thick…)는 그리는 데만 쓴다. */
  const { c, dirty, invalid, commit, keys } = useCommitted({ mode, nuclide, absK, thick, act, actU, massKg });

  const n = N[c.nuclide];
  const abs = ABSORBERS.find((a) => a.value === c.absK)!;
  const eMax = (n.beta_max_keV ?? 0) / 1000;
  const eMean = (n.beta_mean_keV ?? 0) / 1000;
  const hasBeta = !!n.beta?.length && eMax > 0;

  const rangeGcm2 = useMemo(() => betaRange(eMax), [eMax]);
  const rangeCm = useMemo(() => betaRangeCm(eMax, abs.rho), [eMax, abs.rho]);
  const tGcm2 = c.thick * abs.rho / 10;               // mm → g/cm²
  const trans = useMemo(() => betaTransmission(eMax, tGcm2), [eMax, tGcm2]);
  const needMm = rangeCm * 10;

  const bq = convert(c.act, c.actU, "Bq", "activity");
  const conc = c.massKg > 0 ? bq / c.massKg : NaN;
  const dInf = infiniteMediumDoseRate(n.beta_mean_keV ?? 0, conc);
  const brems = ABSORBERS.map((a) => ({ ...a, f: bremsstrahlungYield(a.z, eMax) }));

  if (!hasBeta) {
    return (
      <div className="space-y-4">
        <NuclidePicker nuclides={N} value={nuclide} onChange={setNuclide} require={["beta"]} />
        <Warn>{nuclide} has no tabulated beta emission — pick a beta emitter.</Warn>
      </div>
    );
  }

  return (
    <div className="space-y-5" {...keys}>
      <div>
        <span className="label">What do you want to find</span>
        <RadioRow name="Mode" value={mode} onChange={setMode} options={[
          { value: "shield", label: "Shielding", hint: "How thick to stop the beta" },
          { value: "dose", label: "Dose rate", hint: "Infinite-medium dose rate from a concentration" },
        ]} />
      </div>

      <NuclidePicker nuclides={N} value={nuclide} onChange={setNuclide} require={["beta"]} />

      {mode === "shield" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Absorber"><Select value={absK} onChange={setAbsK} options={ABSORBERS.map((a) => ({ value: a.value, label: `${a.label} — Z ≈ ${a.z}` }))} /></Field>
            <Field label="Thickness"><NumberInput value={Number.isFinite(thick) ? thick : ""} onChange={setThick} min={0} suffix="mm" /></Field>
          </div>

          <CalcButton dirty={dirty} invalid={invalid} onClick={commit} />

          <Headline stale={dirty} label={`${abs.label} needed to stop ${c.nuclide} beta`} value={needMm} unit="mm"
            note={`Full range of a ${fmt(eMax * 1000, 4)} keV beta. At ${fmt(c.thick)} mm the transmission is ${trans === 0 ? "zero — fully stopped" : `${fmt(trans * 100, 3)}%`}.`} />

          <Rows rows={[
            { k: "Maximum beta energy", v: `${fmt(n.beta_max_keV ?? 0, 5)} keV` },
            { k: "Mean beta energy", v: `${fmt(n.beta_mean_keV ?? 0, 5)} keV`, hint: "dose follows the mean, not the maximum" },
            { k: "Range (mass thickness)", v: `${fmt(rangeGcm2, 4)} g/cm²`, hint: "Katz–Penfold — independent of material" },
            { k: `Range in ${abs.label}`, v: `${fmt(needMm, 4)} mm` },
            { k: "Your absorber", v: `${fmt(tGcm2, 4)} g/cm²`, hint: `${fmt(c.thick)} mm × ${abs.rho} g/cm³` },
            { k: "Transmission", v: trans === 0 ? "0 — stopped" : `${fmt(trans * 100, 3)}%` },
          ]} />

          {/* ★ 첫 칸 고정 — 좁은 화면에서 오른쪽으로 밀면 **어느 흡수체 줄인지** 사라진다
              (2026-09-17, 유효성 평가 쪽에 세운 게이트가 이 기존 결함을 찾아냈다). */}
          <div className="card pin-first">
            <table>
              <thead><tr><th>Absorber</th><th className="text-right">Thickness to stop</th><th className="text-right">Bremsstrahlung</th></tr></thead>
              <tbody>
                {brems.map((a) => (
                  <tr key={a.value} className={a.value === c.absK ? "is-marked bg-accent-soft/50" : ""}>
                    <td>{a.label}</td>
                    <td className="num text-right">{fmt(betaRangeCm(eMax, a.rho) * 10, 3)} mm</td>
                    <td className="num text-right">{fmt(a.f * 100, 3)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Warn>
            <strong>Lead is the wrong choice for beta.</strong> It is thin and convenient, but the
            bremsstrahlung yield scales with atomic number — lead converts about{" "}
            {fmt(bremsstrahlungYield(82, eMax) / bremsstrahlungYield(6.5, eMax), 2)}× more of the beta
            energy into penetrating X-rays than acrylic does. Stop the beta in a low-Z absorber first,
            then add lead outside it if the bremsstrahlung still matters.
          </Warn>
        </>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Activity"><NumberInput value={Number.isFinite(act) ? act : ""} onChange={setAct} /></Field>
            <Field label="Unit"><Select value={actU} onChange={setActU} options={ACT} /></Field>
            <Field label="Mass of the medium" hint="The activity is assumed uniformly mixed through this mass">
              <NumberInput value={Number.isFinite(massKg) ? massKg : ""} onChange={setMassKg} suffix="kg" />
            </Field>
          </div>

          <CalcButton dirty={dirty} invalid={invalid} onClick={commit} />

          <Headline stale={dirty} label="Infinite-medium dose rate" value={dInf * 1000} unit="mGy/h"
            note="Exact by energy conservation — every beta deposits its energy locally. This is the dose inside a large uniformly contaminated volume." />

          <Rows rows={[
            { k: "Concentration", v: `${fmt(conc, 4)} Bq/kg` },
            { k: "Mean beta energy", v: `${fmt(n.beta_mean_keV ?? 0, 5)} keV` },
            { k: "At a plane surface", v: `${fmt(semiInfiniteSurfaceDoseRate(n.beta_mean_keV ?? 0, conc) * 1000, 4)} mGy/h`,
              hint: "exactly half — nothing above the surface sends energy back" },
            { k: "Per year, continuous", v: `${fmt(dInf * 24 * 365.25, 4)} Gy/y` },
          ]} />

          <Warn>
            <strong>This is not a skin dose.</strong> Skin dose from surface contamination needs a point
            kernel over the source geometry, the air gap and any covering, and it is very sensitive to all
            three. A single number here would be confidently wrong — use a dedicated code such as VARSKIN
            for that calculation.
          </Warn>
        </>
      )}

      <SaveBar tool="beta"
        inputs={{ mode: c.mode, nuclide: c.nuclide, absorber: c.absK, thick: c.thick, act: c.act, actU: c.actU, massKg: c.massKg }}
        outputs={{ rangeGcm2, rangeCm, transmission: trans, eMaxKeV: n.beta_max_keV, eMeanKeV: n.beta_mean_keV, infiniteMediumGyPerH: dInf }}
        summary={`${c.nuclide} in ${abs.label}`} />
    </div>
  );
}
