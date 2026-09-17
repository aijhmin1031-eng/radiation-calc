import { useState } from "react";
import { UNITS, convert, exposureToAirKerma, massConcFromVolConc, volConcFromMassConc,
         DENSITY_WATER_G_PER_ML, type Quantity } from "../../engine/units";
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
  /* ★★ 농도가 한 칸이었을 때 `Bq/L` 이 질량 배율로 들어 있어 **답이 1000배 틀렸다**
     (2026-09-16). 분모가 다르면 **다른 양**이고, 잇는 것은 밀도라는 물리다 — 아래 다리 참조. */
  { value: "massConc",   label: "Mass concentration",   hint: "Soil, waste, food — per gram or kilogram" },
  { value: "volConc",    label: "Volume concentration", hint: "Water, air, vials — per litre or millilitre" },
];

export default function Units() {
  const restored = initialState();
  const [q, setQ] = useState<Quantity>(pickState(restored, "q", "activity"));
  const [from, setFrom] = useState(pickState(restored, "from", "mCi"));
  const [val, setVal] = useState(pickState(restored, "val", 1));
  const [density, setDensity] = useState(pickState(restored, "density", DENSITY_WATER_G_PER_ML));

  const units = Object.keys(UNITS[q].u);
  const pick = (nq: Quantity) => { setQ(nq); setFrom(Object.keys(UNITS[nq].u)[0]); };
  const safeFrom = units.includes(from) ? from : units[0];

  /* ★ **이 도구만 실시간이다**(2026-09-14 소유주 결정). 다른 여섯은 계산 단추를 거친다 —
     으뜸 답이 큰 숫자 하나라 「계산이 된 건지」가 안 보이기 때문이다.
     환산표는 그 문제가 없다: **모든 단위가 한 번에 서 있고 넣은 단위 줄이 강조**되어 있어
     화면과 입력이 어긋날 자리가 없다. 여기에 단추를 두면 「1 mCi 가 몇 Bq 인가」를 보는 데
     손이 한 번 더 든다 — 이 lab 에서 진입장벽이 가장 낮아야 할 도구다. */

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
      <div className="card overflow-x-auto">
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

      {(q === "massConc" || q === "volConc") ? (
        <div className="card p-4">
          <p className="label mb-2">
            {q === "volConc" ? "Volume to mass concentration" : "Mass to volume concentration"}
          </p>
          <Field label="Density" hint="g/mL — water is 1.00, so the two read the same">
            <NumberInput value={Number.isFinite(density) ? density : ""} onChange={setDensity}
                         step={0.01} min={0} suffix="g/mL" />
          </Field>
          <p className="num mt-3 text-[20px] font-semibold text-ink">
            {fmt(
              q === "volConc"
                ? massConcFromVolConc(convert(val, safeFrom, "Bq/L", "volConc"), density) * 1000
                : volConcFromMassConc(convert(val, safeFrom, "Bq/g", "massConc"), density),
              4,
            )}
            <span className="ml-1.5 text-[14px] font-normal text-ink-muted">
              {q === "volConc" ? "Bq/kg" : "Bq/L"}
            </span>
          </p>
          <Warn>
            This step is <strong>not a unit conversion</strong> — activity per litre and activity per
            kilogram are different quantities, and crossing between them needs the density of the
            material. The table above therefore never crosses on its own. For water at 1.00 g/mL the
            two happen to be numerically equal, which is why the mistake is easy to make and hard to
            notice: <strong>1 pCi/L is 0.037 Bq/kg, not 37</strong>.
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
        inputs={{ quantity: q, unit: safeFrom, value: val, density }}
        outputs={Object.fromEntries(units.map((x) => [x, convert(Number.isFinite(val) ? val : 0, safeFrom, x, q)]))}
        summary={`${fmt(val)} ${safeFrom}`} />
    </div>
  );
}
