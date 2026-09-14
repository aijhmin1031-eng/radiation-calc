import { useState } from "react";
import { UNITS, convert, exposureToAirKerma, type Quantity } from "../../engine/units";
import { Field, NumberInput, Select, RadioRow } from "../ui/Field";
import { SaveBar } from "../ui/SaveBar";
import { initialState, pick as pickState } from "../../lib/restore";
import { fmt, Warn } from "../ui/Result";

const QUANTITIES: { value: Quantity; label: string; hint: string }[] = [
  { value: "activity",   label: "Activity",          hint: "How much is decaying" },
  { value: "dose",       label: "Absorbed dose",     hint: "Energy per mass — Gy, rad" },
  { value: "equivalent", label: "Dose equivalent",   hint: "Weighted for biological effect — Sv, rem" },
  { value: "exposure",   label: "Exposure",          hint: "Ionisation in air — R, C/kg" },
  { value: "surface",    label: "Surface activity",  hint: "Contamination per area" },
  { value: "massConc",   label: "Concentration",     hint: "Per gram, kilogram or litre" },
];

export default function Units() {
  const restored = initialState();
  const [q, setQ] = useState<Quantity>(pickState(restored, "q", "activity"));
  const [from, setFrom] = useState(pickState(restored, "from", "mCi"));
  const [val, setVal] = useState(pickState(restored, "val", 1));

  const units = Object.keys(UNITS[q].u);
  const pick = (nq: Quantity) => { setQ(nq); setFrom(Object.keys(UNITS[nq].u)[0]); };
  const safeFrom = units.includes(from) ? from : units[0];

  return (
    <div className="space-y-5">
      <div>
        <span className="label">Quantity</span>
        <RadioRow name="Quantity" value={q} onChange={pick} options={QUANTITIES} />
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <Field label="Value">
          <NumberInput value={Number.isFinite(val) ? val : ""} onChange={setVal} />
        </Field>
        <Field label="Unit">
          <Select value={safeFrom} onChange={setFrom} options={units} />
        </Field>
      </div>

      {/* ★ 「어느 단위로 바꿀까」를 묻지 않는다 — 전부 한 번에 보여 주는 편이 빠르다.
          참고 사이트는 from/to 를 둘 다 고르게 하는데, 실제로는 표 하나면 끝난다. */}
      <div className="card overflow-hidden">
        <table>
          <thead><tr><th>Unit</th><th className="text-right">Value</th></tr></thead>
          <tbody>
            {units.map((u) => {
              const out = convert(Number.isFinite(val) ? val : 0, safeFrom, u, q);
              const same = u === safeFrom;
              return (
                <tr key={u} className={same ? "bg-accent-soft/50" : ""}>
                  <td className={same ? "font-semibold" : ""}>{u}</td>
                  <td className="num text-right text-ink">{fmt(out, 6)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {q === "exposure" ? (
        <div className="card p-4">
          <p className="label mb-2">Exposure to air kerma</p>
          <p className="num text-[20px] font-semibold text-ink">
            {fmt(exposureToAirKerma(convert(val, safeFrom, "C/kg", "exposure")) * 1000, 4)}
            <span className="ml-1.5 text-[14px] font-normal text-ink-muted">mGy (air)</span>
          </p>
          <Warn>
            This step is <strong>not a unit conversion</strong> — it multiplies by W/e = 33.97 J/C,
            the average energy to create one ion pair in dry air. Exposure and air kerma are different
            physical quantities that happen to be proportional.
          </Warn>
        </div>
      ) : null}

      {(q === "dose" || q === "equivalent") ? (
        <Warn>
          Gray and sievert are <strong>never interchangeable by a factor</strong>. Going from absorbed
          dose to dose equivalent needs a radiation weighting factor that depends on the radiation type
          (1 for photons and electrons, up to 20 for alpha). This tool converts only within one quantity.
        </Warn>
      ) : null}

      <SaveBar tool="units"
        inputs={{ quantity: q, unit: safeFrom, value: val }}
        outputs={Object.fromEntries(units.map((x) => [x, convert(Number.isFinite(val) ? val : 0, safeFrom, x, q)]))}
        summary={`${fmt(val)} ${safeFrom}`} />
    </div>
  );
}
