import { useMemo, useState } from "react";
import { inverseSquare, distanceForRate, stayTime, collectiveDose, hvlFromMu, tvlFromMu } from "../../engine/alara";
import { Field, NumberInput, Select, RadioRow } from "../ui/Field";
import { SaveBar } from "../ui/SaveBar";
import { initialState, pick as pickState } from "../../lib/restore";
import { Headline, Rows, fmt, Warn } from "../ui/Result";

type Mode = "stay" | "distance" | "job";
const DIST = { cm: 0.01, m: 1, ft: 0.3048 } as const;
const RATE = ["µSv/h", "mSv/h", "mrem/h", "rem/h"] as const;
const TO_MSV: Record<typeof RATE[number], number> = { "µSv/h": 1e-3, "mSv/h": 1, "mrem/h": 1e-2, "rem/h": 10 };

interface Task { id: number; name: string; workers: number; hours: number; rate: number }

export default function Alara() {
  const restored = initialState();
  const [mode, setMode] = useState<Mode>(pickState(restored, "mode", "stay"));
  const [rateU, setRateU] = useState<typeof RATE[number]>(pickState(restored, "rateU", "µSv/h"));
  const [rate, setRate] = useState(pickState(restored, "rate", 250));
  const [d1, setD1] = useState(pickState(restored, "d1", 1)); const [d1u, setD1u] = useState<keyof typeof DIST>(pickState(restored, "d1u", "m"));
  const [d2, setD2] = useState(pickState(restored, "d2", 3));
  const [budget, setBudget] = useState(pickState(restored, "budget", 1));          // mSv
  const [targetRate, setTargetRate] = useState(pickState(restored, "targetRate", 20)); // rateU
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, name: "Setup", workers: 2, hours: 0.5, rate: 80 },
    { id: 2, name: "Main work", workers: 3, hours: 2, rate: 250 },
    { id: 3, name: "Cleanup", workers: 2, hours: 1, rate: 40 },
  ]);

  const mSvPerH = rate * TO_MSV[rateU];
  const at2 = inverseSquare(rate, d1 * DIST[d1u], d2 * DIST[d1u]);
  const needD = distanceForRate(rate, d1 * DIST[d1u], targetRate);
  const hours = stayTime(budget, mSvPerH);

  const collective = useMemo(
    () => collectiveDose(tasks.map((t) => ({ workers: t.workers, hours: t.hours, rate: t.rate * TO_MSV[rateU] }))),
    [tasks, rateU]);
  const perWorker = useMemo(() => {
    const w = Math.max(...tasks.map((t) => t.workers), 1);
    return tasks.reduce((s, t) => s + t.hours * t.rate * TO_MSV[rateU], 0);
  }, [tasks, rateU]);

  const showTime = (h: number) =>
    !Number.isFinite(h) ? "unlimited"
      : h < 1 / 60 ? `${fmt(h * 3600)} s`
      : h < 2 ? `${fmt(h * 60)} min`
      : h < 48 ? `${fmt(h)} h`
      : `${fmt(h / 24)} days`;

  return (
    <div className="space-y-5">
      <div>
        <span className="label">What do you want to find</span>
        <RadioRow name="Mode" value={mode} onChange={setMode} options={[
          { value: "stay", label: "Stay time", hint: "How long against a dose budget" },
          { value: "distance", label: "Distance", hint: "How far back to reach a target rate" },
          { value: "job", label: "Job dose", hint: "Collective dose across tasks" },
        ]} />
      </div>

      {mode !== "job" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Dose rate"><NumberInput value={Number.isFinite(rate) ? rate : ""} onChange={setRate} /></Field>
          <Field label="Unit"><Select value={rateU} onChange={setRateU} options={RATE as unknown as typeof RATE[number][]} /></Field>
        </div>
      ) : null}

      {mode === "stay" ? (
        <>
          <Field label="Dose budget for this job" hint="Your administrative limit for the task, not the annual limit">
            <NumberInput value={Number.isFinite(budget) ? budget : ""} onChange={setBudget} suffix="mSv" />
          </Field>
          <Headline label="Time before the budget is used up" value={showTime(hours)}
            note={`At ${fmt(rate)} ${rateU}. Every doubling of distance cuts this to a quarter of the rate — four times the time.`} />
          <Rows rows={[
            { k: "Dose rate", v: `${fmt(mSvPerH, 4)} mSv/h` },
            { k: "Dose in 10 minutes", v: `${fmt(mSvPerH / 6, 4)} mSv` },
            { k: "Dose in one hour", v: `${fmt(mSvPerH, 4)} mSv` },
            { k: "At twice the distance", v: showTime(stayTime(budget, mSvPerH / 4)), hint: "the cheapest control there is" },
            { k: "Behind one half-value layer", v: showTime(stayTime(budget, mSvPerH / 2)) },
            { k: "Behind one tenth-value layer", v: showTime(stayTime(budget, mSvPerH / 10)) },
          ]} />
        </>
      ) : mode === "distance" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Measured at"><NumberInput value={Number.isFinite(d1) ? d1 : ""} onChange={setD1} /></Field>
            <Field label="Distance unit"><Select value={d1u} onChange={setD1u} options={[
              { value: "cm" as const, label: "centimetres" }, { value: "m" as const, label: "metres" },
              { value: "ft" as const, label: "feet" }]} /></Field>
            <Field label="Target dose rate"><NumberInput value={Number.isFinite(targetRate) ? targetRate : ""} onChange={setTargetRate} suffix={rateU} /></Field>
            <Field label="Or: rate at this distance"><NumberInput value={Number.isFinite(d2) ? d2 : ""} onChange={setD2} suffix={d1u} /></Field>
          </div>
          <Headline label="Distance to reach the target" value={needD} unit={d1u}
            note={`${fmt(needD / (d1 * DIST[d1u] / DIST[d1u]), 3)}× the measurement distance. Inverse square only — it assumes a point source and no scatter.`} />
          <Rows rows={[
            { k: `Rate at ${fmt(d2)} ${d1u}`, v: `${fmt(at2, 4)} ${rateU}` },
            { k: "Rate at twice the distance", v: `${fmt(rate / 4, 4)} ${rateU}` },
            { k: "Rate at ten times", v: `${fmt(rate / 100, 4)} ${rateU}` },
            { k: "Reduction factor needed", v: `${fmt(rate / targetRate, 3)}×` },
          ]} />
          <Warn>
            Inverse square holds for a point source in open geometry. Close to an extended source — a
            tank, a pipe run, a contaminated floor — the rate falls much more slowly than 1/d², and near a
            large plane it barely falls at all.
          </Warn>
        </>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table>
              <thead><tr><th>Task</th><th className="text-right">Workers</th><th className="text-right">Hours</th>
                <th className="text-right">Rate ({rateU})</th><th className="text-right">person·mSv</th></tr></thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <input className="field !min-h-0 !py-1 !text-[13px]" value={t.name}
                        onChange={(e) => setTasks((x) => x.map((y) => y.id === t.id ? { ...y, name: e.target.value } : y))} />
                    </td>
                    {(["workers", "hours", "rate"] as const).map((f) => (
                      <td key={f} className="text-right">
                        <input className="field num !min-h-0 !py-1 !text-right !text-[13px]" inputMode="decimal" value={t[f]}
                          onChange={(e) => { const v = Number(e.target.value);
                            if (Number.isFinite(v)) setTasks((x) => x.map((y) => y.id === t.id ? { ...y, [f]: v } : y)); }} />
                      </td>
                    ))}
                    <td className="num text-right text-ink">{fmt(t.workers * t.hours * t.rate * TO_MSV[rateU], 4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn"
              onClick={() => setTasks((x) => [...x, { id: Math.max(0, ...x.map((t) => t.id)) + 1, name: "New task", workers: 1, hours: 1, rate: 50 }])}>
              + Add task
            </button>
            {tasks.length > 1 ? (
              <button type="button" className="btn" onClick={() => setTasks((x) => x.slice(0, -1))}>− Remove last</button>
            ) : null}
            <Field label=""><Select value={rateU} onChange={setRateU} options={RATE as unknown as typeof RATE[number][]} /></Field>
          </div>
          <Headline label="Collective dose for the job" value={collective} unit="person·mSv"
            note={`${fmt(perWorker, 4)} mSv for a worker who is present for every task.`} />
          <Rows rows={[
            { k: "Total worker-hours", v: fmt(tasks.reduce((s, t) => s + t.workers * t.hours, 0), 4) },
            { k: "Highest single task", v: `${fmt(Math.max(...tasks.map((t) => t.workers * t.hours * t.rate * TO_MSV[rateU])), 4)} person·mSv` },
            { k: "If every rate halved", v: `${fmt(collective / 2, 4)} person·mSv`, hint: "one half-value layer everywhere" },
            { k: "If every distance doubled", v: `${fmt(collective / 4, 4)} person·mSv` },
          ]} />
          <Warn>
            Collective dose adds people together, so it rewards using fewer workers for longer — which can
            push an individual past their limit. Check the per-worker column as well as the total.
          </Warn>
        </>
      )}

      <SaveBar tool="alara"
        inputs={{ mode, rateU, rate, d1, d1u, d2, budget, targetRate, tasks }}
        outputs={{ stayTimeH: hours, rateAtD2: at2, distanceNeeded: needD, collective, perWorker }}
        summary={`${mode} — ${fmt(rate)} ${rateU}`} />
    </div>
  );
}
