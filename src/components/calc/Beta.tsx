import { useMemo, useState } from "react";
import nuclides from "../../data/nuclides.json";
import type { NuclideMap } from "../../engine/types";
import { infiniteMediumDoseRate, semiInfiniteSurfaceDoseRate, betaRange, betaRangeCm,
         betaTransmission, bremsstrahlungYield, BETA_BRANCH_FLOOR_PCT } from "../../engine/beta";
import { ABSORBERS, absorberRows, type AbsKey } from "../../lib/beta-absorbers";
import { TIME_S } from "../../engine/constants";
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

/* 차폐재 목록과 그 표의 줄(제동복사 규칙 포함)은 `lib/beta-absorbers.ts` 가 든다 — 테스트가 그 연결을 고정한다(T13). */
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
  /* ★ T13 — 제동복사는 낱장 · `/beta-shield-materials/` 와 같은 규칙(세기 1% 이상 가지의 최대 끝점, `bremsEndpointKeV`)으로 계산한다.
     그전에는 여기만 최대 끝점이라 Co-60 이 납에서 4.28%(낱장은 0.91%)였다. 두께 · 투과율은 그대로 최대 끝점이다. */
  const { bremsKeV, eBrems, rows: brems } = absorberRows(n);

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
          <div className="card pin-first" tabIndex={0} role="region" aria-label="Absorber table — scrolls sideways on narrow screens">
            <table>
              <thead><tr><th>Absorber</th><th className="text-right">Thickness to stop</th><th className="text-right">Bremsstrahlung</th></tr></thead>
              <tbody>
                {brems.map((a) => (
                  <tr key={a.value} className={a.value === c.absK ? "is-marked bg-accent-soft/50" : ""}>
                    <td>{a.label}</td>
                    <td className="num text-right">{fmt(a.stopMm, 3)} mm</td>
                    <td className="num text-right">{fmt(a.f * 100, 3)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bremsKeV !== n.beta_max_keV && (
            <p className="text-[13px] leading-relaxed text-ink-muted">
              Bremsstrahlung is worked out for the {fmt(bremsKeV, 4)} keV branch, the hardest in at least{" "}
              {BETA_BRANCH_FLOOR_PCT}% of decays; the rarer {fmt(n.beta_max_keV ?? 0, 4)} keV branch sets only the
              thickness to stop.
            </p>
          )}

          <Warn>
            <strong>Lead is the wrong choice for beta.</strong> It is thin and convenient, but the
            bremsstrahlung yield scales with atomic number — lead converts about{" "}
            {fmt(bremsstrahlungYield(82, eBrems) / bremsstrahlungYield(6.5, eBrems), 2)}× more of the beta
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
            { k: "Per year, continuous", v: `${fmt(dInf * (TIME_S.y / 3600), 4)} Gy/y` },
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
