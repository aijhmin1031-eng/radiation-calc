import type { ReactNode } from "react";

/** 숫자 표기 — 계측 값은 유효숫자로 쓴다. 0.000000123 이나 12300000 을 그대로 뿌리지 않는다. */
export function fmt(v: number, sig = 4): string {
  if (!Number.isFinite(v)) return "—";
  if (v === 0) return "0";
  const a = Math.abs(v);
  if (a >= 1e5 || a < 1e-3) {
    const [m, e] = v.toExponential(sig - 1).split("e");
    return `${m}×10${sup(Number(e))}`;
  }
  return Number(v.toPrecision(sig)).toLocaleString(undefined, { maximumSignificantDigits: sig });
}
const SUP = "⁻⁰¹²³⁴⁵⁶⁷⁸⁹";
const sup = (n: number) =>
  (n < 0 ? SUP[0] : "") + String(Math.abs(n)).split("").map((d) => SUP[Number(d) + 1]).join("");

/** 으뜸 답 — 화면에서 제일 큰 것 하나. 「무엇을 보러 왔는가」가 여기 있어야 한다. */
export function Headline({ value, unit, label, note }: {
  value: number | string; unit?: string; label: string; note?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-accent/40 bg-accent-soft px-4 py-4">
      <p className="label mb-1.5">{label}</p>
      <p className="flex flex-wrap items-baseline gap-1.5">
        <span className="num text-[30px] font-semibold leading-none text-ink sm:text-[36px]">
          {typeof value === "number" ? fmt(value) : value}
        </span>
        {unit ? <span className="text-[15px] text-ink-muted">{unit}</span> : null}
      </p>
      {note ? <p className="mt-2 text-[13px] leading-snug text-ink-muted">{note}</p> : null}
    </div>
  );
}

/** 딸린 값들 — 으뜸 답을 뒷받침하는 중간값. 왜 그 수가 나왔는지 보이게 한다. */
export function Rows({ rows }: { rows: { k: string; v: ReactNode; hint?: string }[] }) {
  return (
    <dl className="divide-y divide-line">
      {rows.map((r) => (
        <div key={r.k} className="flex items-baseline justify-between gap-4 py-2">
          <dt className="text-[13px] text-ink-muted">
            {r.k}
            {r.hint ? <span className="block text-[11px] text-ink-faint">{r.hint}</span> : null}
          </dt>
          <dd className="num text-[14px] font-medium text-ink text-right">{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Warn({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] leading-snug text-ink-muted">
      {children}
    </p>
  );
}
