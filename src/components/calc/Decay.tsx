import { useMemo, useState } from "react";
import nuclides from "../../data/nuclides.json";
import type { NuclideMap } from "../../engine/types";
import { decayActivity, elapsedFromRatio, halfLifeFromTwoPoints } from "../../engine/decay";
import { convert, UNITS } from "../../engine/units";
import { NuclidePicker } from "../ui/NuclidePicker";
import { Field, NumberInput, Select, RadioRow } from "../ui/Field";
import { SaveBar } from "../ui/SaveBar";
import { initialState, pick as pickState } from "../../lib/restore";
import { Headline, Rows, fmt, Warn } from "../ui/Result";

const N = nuclides as unknown as NuclideMap;
const ACT = Object.keys(UNITS.activity.u);
const TIME = { s: 1, min: 60, h: 3600, d: 86400, y: 365.2425 * 86400 } as const;
type TimeUnit = keyof typeof TIME;
type Mode = "remaining" | "when" | "halflife";

const MODES: { value: Mode; label: string; hint: string }[] = [
  { value: "remaining", label: "How much is left", hint: "Activity after a given time" },
  { value: "when",      label: "When does it reach", hint: "Time to fall to a target activity" },
  { value: "halflife",  label: "Find the half-life", hint: "From two measurements" },
];

export default function Decay() {
  const restored = initialState();
  const [mode, setMode] = useState<Mode>(pickState(restored, "mode", "remaining"));
  const [nuclide, setNuclide] = useState(pickState(restored, "nuclide", "Co-60"));
  const [a0, setA0] = useState(pickState(restored, "a0", 37));
  const [unit, setUnit] = useState(pickState(restored, "unit", "GBq"));
  const [t, setT] = useState(pickState(restored, "t", 5));
  const [tu, setTu] = useState<TimeUnit>(pickState(restored, "tu", "y"));
  const [target, setTarget] = useState(pickState(restored, "target", 1));
  const [a1, setA1] = useState(pickState(restored, "a1", 18.5));

  const n = N[nuclide];
  const T = n.t_half_s;
  const seconds = t * TIME[tu];

  const out = useMemo(() => {
    if (mode === "remaining") {
      const a = decayActivity(a0, T, seconds);
      return { a, frac: a0 > 0 ? a / a0 : NaN, halves: seconds / T };
    }
    if (mode === "when") {
      const s = elapsedFromRatio(target / a0, T);
      return { s, halves: s / T };
    }
    const th = halfLifeFromTwoPoints(a0, a1, seconds);
    return { th, halves: th > 0 ? seconds / th : NaN };
  }, [mode, a0, a1, target, T, seconds]);

  const showTime = (s: number) =>
    !Number.isFinite(s) ? "—"
      : s < 120 ? `${fmt(s)} s`
      : s < 7200 ? `${fmt(s / 60)} min`
      : s < 2 * 86400 ? `${fmt(s / 3600)} h`
      : s < 3 * TIME.y ? `${fmt(s / 86400)} d`
      : `${fmt(s / TIME.y)} y`;

  return (
    <div className="space-y-5">
      <div>
        <span className="label">What do you want to find</span>
        <RadioRow name="Mode" value={mode} onChange={setMode} options={MODES} />
      </div>

      <NuclidePicker nuclides={N} value={nuclide} onChange={setNuclide} />

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={mode === "halflife" ? "First measurement" : "Starting activity"}>
          <NumberInput value={Number.isFinite(a0) ? a0 : ""} onChange={setA0} />
        </Field>
        <Field label="Unit">
          <Select value={unit} onChange={setUnit} options={ACT} />
        </Field>

        {mode === "halflife" ? (
          <Field label="Second measurement" hint={`Same unit (${unit})`}>
            <NumberInput value={Number.isFinite(a1) ? a1 : ""} onChange={setA1} />
          </Field>
        ) : mode === "when" ? (
          <Field label="Target activity" hint={`Same unit (${unit})`}>
            <NumberInput value={Number.isFinite(target) ? target : ""} onChange={setTarget} />
          </Field>
        ) : null}

        {mode !== "when" ? (
          <>
            <Field label={mode === "halflife" ? "Time between measurements" : "Elapsed time"}>
              <NumberInput value={Number.isFinite(t) ? t : ""} onChange={setT} />
            </Field>
            <Field label="Time unit">
              <Select value={tu} onChange={setTu}
                options={[{ value: "s" as const, label: "seconds" }, { value: "min" as const, label: "minutes" },
                          { value: "h" as const, label: "hours" }, { value: "d" as const, label: "days" },
                          { value: "y" as const, label: "years" }]} />
            </Field>
          </>
        ) : null}
      </div>

      {mode === "remaining" ? (
        <>
          <Headline label="Activity remaining" value={out.a!} unit={unit}
            note={`${fmt((out.frac ?? 0) * 100, 3)}% of the starting activity — ${fmt(out.halves!, 3)} half-lives elapsed.`} />
          <Rows rows={[
            { k: "Half-life", v: `${n.hl} ${n.hl_unit}` },
            { k: "Decayed away", v: `${fmt(a0 - out.a!, 4)} ${unit}` },
            { k: "In becquerels", v: `${fmt(convert(out.a!, unit, "Bq", "activity"), 4)} Bq` },
            { k: "Decay mode", v: n.decay ?? "—" },
          ]} />
        </>
      ) : mode === "when" ? (
        <>
          <Headline label="Time to reach the target" value={showTime(out.s!)}
            note={target >= a0 ? "The target must be below the starting activity." :
              `${fmt(out.halves!, 3)} half-lives. Decay only — this ignores removal, dilution and ingrowth.`} />
          <Rows rows={[
            { k: "Half-life", v: `${n.hl} ${n.hl_unit}` },
            { k: "Fraction remaining", v: `${fmt((target / a0) * 100, 3)}%` },
            { k: "Reached on", v: Number.isFinite(out.s!) ? new Date(Date.now() + out.s! * 1000).toISOString().slice(0, 10) : "—" },
          ]} />
        </>
      ) : (
        <>
          <Headline label="Half-life from your two measurements" value={showTime(out.th!)}
            note={a1 >= a0 ? "The second measurement must be lower than the first."
              : `Published value for ${nuclide}: ${n.hl} ${n.hl_unit}.`} />
          <Rows rows={[
            { k: "Published half-life", v: `${n.hl} ${n.hl_unit}` },
            { k: "Difference", v: Number.isFinite(out.th!) ? `${fmt((out.th! - T) / T * 100, 3)}%` : "—",
              hint: "Your result against the published value" },
            { k: "Ratio measured", v: `${fmt(a1 / a0, 4)}` },
          ]} />
          <Warn>
            Two points cannot separate decay from anything else that removed activity — leakage,
            adsorption, or a drifting detector all look like a shorter half-life.
          </Warn>
        </>
      )}

      <SaveBar tool="decay"
        inputs={{ mode, nuclide, a0, unit, t, tu, target, a1 }}
        outputs={{ ...out }}
        summary={`${nuclide} — ${fmt(a0)} ${unit}`} />
    </div>
  );
}
