import type { ReactNode } from "react";

export function Field({ label, hint, children, wide }: {
  label: string; hint?: ReactNode; children: ReactNode; wide?: boolean;
}) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="label">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[12px] leading-snug text-ink-faint">{hint}</span> : null}
    </label>
  );
}

/** 숫자 입력 — 모바일에서 숫자 자판이 뜨게 inputMode 를 준다.
 *  ★ type="number" 의 스피너는 손가락으로 누르기엔 작고 실수로 값이 바뀐다. */
export function NumberInput({ value, onChange, step, min, suffix, ...rest }: {
  value: number | string; onChange: (v: number) => void;
  step?: number; min?: number; suffix?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <span className="relative block">
      <input
        {...rest}
        className="field num pr-14"
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) onChange(v);
          else if (e.target.value === "" || e.target.value === "-") onChange(NaN);
        }}
        step={step} min={min}
      />
      {suffix ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-ink-faint">
          {suffix}
        </span>
      ) : null}
    </span>
  );
}

export function Select<T extends string>({ value, onChange, options, ...rest }: {
  value: T; onChange: (v: T) => void;
  options: readonly (T | { value: T; label: string })[];
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange">) {
  return (
    <select {...rest} className="field" value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map((o) => {
        const v = typeof o === "string" ? o : o.value;
        const l = typeof o === "string" ? o : o.label;
        return <option key={v} value={v}>{l}</option>;   /* value 를 반드시 명시한다 */
      })}
    </select>
  );
}

/** 라디오 묶음 — 조건 선택은 드롭다운보다 이쪽이 한눈에 들어온다(선택지 4개 이하일 때). */
export function RadioRow<T extends string>({ value, onChange, options, name }: {
  value: T; onChange: (v: T) => void; name: string;
  options: { value: T; label: string; hint?: string }[];
}) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on}
            onClick={() => onChange(o.value)} title={o.hint}
            className={`rounded-md border px-3 py-1.5 text-[13px] min-h-[38px] transition-colors ${
              on ? "border-accent bg-accent-soft font-semibold text-ink"
                 : "border-line bg-panel text-ink-muted hover:border-accent/40"}`}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Check({ checked, onChange, label, hint }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 py-1">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--c-accent)]" />
      <span className="text-[14px] leading-snug">
        <span className="text-ink">{label}</span>
        {hint ? <span className="block text-[12px] text-ink-faint">{hint}</span> : null}
      </span>
    </label>
  );
}
