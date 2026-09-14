import { useState } from "react";
import nuclides from "../../data/nuclides.json";
import type { NuclideMap } from "../../engine/types";
import { massFromActivity, activityFromMass } from "../../engine/decay";
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
const MASS = { ng: 1e-9, µg: 1e-6, mg: 1e-3, g: 1, kg: 1e3 } as const;

export default function SpecificActivity() {
  const restored = initialState();
  const [dir, setDir] = useState<"toMass" | "toActivity">(pickState(restored, "dir", "toMass"));
  const [nuclide, setNuclide] = useState(pickState(restored, "nuclide", "Pu-239"));
  const [act, setAct] = useState(pickState(restored, "act", 1)); const [actU, setActU] = useState(pickState(restored, "actU", "GBq"));
  const [mass, setMass] = useState(pickState(restored, "mass", 1)); const [massU, setMassU] = useState<keyof typeof MASS>(pickState(restored, "massU", "g"));

  /* ★ 아래 계산은 전부 **커밋된 스냅숏**(c)에서 나온다 — 칸(act·mass…)이 아니다.
     칸을 고쳐도 답은 그대로 서 있고, 계산 단추가 켜진다. */
  const { c, dirty, invalid, commit, keys } = useCommitted({ dir, nuclide, act, actU, mass, massU });

  const n = N[c.nuclide];
  const bq = convert(c.act, c.actU, "Bq", "activity");
  const grams = c.mass * MASS[c.massU];
  const outGrams = massFromActivity(bq, n.sa_bq_g);
  const outBq = activityFromMass(grams, n.sa_bq_g);

  const nice = (g: number) => {
    if (!Number.isFinite(g)) return { v: NaN, u: "g" };
    const a = Math.abs(g);
    if (a >= 1e3) return { v: g / 1e3, u: "kg" };
    if (a >= 1) return { v: g, u: "g" };
    if (a >= 1e-3) return { v: g * 1e3, u: "mg" };
    if (a >= 1e-6) return { v: g * 1e6, u: "µg" };
    return { v: g * 1e9, u: "ng" };
  };
  const m = nice(outGrams);

  return (
    <div className="space-y-5" {...keys}>
      <div>
        <span className="label">Direction</span>
        <RadioRow name="Direction" value={dir} onChange={setDir} options={[
          { value: "toMass", label: "Activity → mass", hint: "How many grams is this many becquerels" },
          { value: "toActivity", label: "Mass → activity", hint: "How many becquerels is this much material" },
        ]} />
      </div>

      <NuclidePicker nuclides={N} value={nuclide} onChange={setNuclide} />

      <div className="grid gap-3 sm:grid-cols-2">
        {dir === "toMass" ? (
          <>
            <Field label="Activity"><NumberInput value={Number.isFinite(act) ? act : ""} onChange={setAct} /></Field>
            <Field label="Unit"><Select value={actU} onChange={setActU} options={ACT} /></Field>
          </>
        ) : (
          <>
            <Field label="Mass"><NumberInput value={Number.isFinite(mass) ? mass : ""} onChange={setMass} /></Field>
            <Field label="Unit"><Select value={massU} onChange={setMassU} options={Object.keys(MASS) as (keyof typeof MASS)[]} /></Field>
          </>
        )}
      </div>

      <CalcButton dirty={dirty} invalid={invalid} onClick={commit} />

      {c.dir === "toMass" ? (
        <Headline stale={dirty} label={`Mass of ${c.nuclide}`} value={m.v} unit={m.u}
          note={`Pure ${c.nuclide} only. Real material is a mixture of isotopes — see the note below.`} />
      ) : (
        <Headline stale={dirty} label={`Activity of ${fmt(grams)} g of ${c.nuclide}`} value={convert(outBq, "Bq", c.actU, "activity")} unit={c.actU}
          note={`${fmt(outBq, 4)} Bq — ${fmt(convert(outBq, "Bq", "Ci", "activity"), 4)} Ci.`} />
      )}

      <Rows rows={[
        { k: "Specific activity", v: `${fmt(n.sa_bq_g, 5)} Bq/g` },
        { k: "", v: `${fmt(n.sa_bq_g / 3.7e10, 5)} Ci/g` },
        { k: "Half-life", v: `${n.hl} ${n.hl_unit}` },
        { k: "Mass number", v: `${n.a}`, hint: "used as the molar mass in g/mol" },
        { k: "Decay mode", v: n.decay ?? "—" },
      ]} />

      <Warn>
        <strong>This is the mass of the pure isotope.</strong> Weapons-grade or reactor-grade plutonium,
        or enriched uranium, is a mixture — the total mass of the material holding this activity is larger,
        and other isotopes in the mixture add their own activity. The molar mass is approximated by the
        mass number, which is within 0.03% for every nuclide here.
      </Warn>

      <SaveBar tool="specific-activity"
        inputs={{ direction: c.dir, nuclide: c.nuclide, act: c.act, actU: c.actU, mass: c.mass, massU: c.massU }}
        outputs={{ specificActivity: n.sa_bq_g, grams: outGrams, bq: outBq }}
        summary={`${c.nuclide} — ${c.dir === "toMass" ? `${fmt(c.act)} ${c.actU}` : `${fmt(c.mass)} ${c.massU}`}`} />
    </div>
  );
}
