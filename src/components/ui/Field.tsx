import { useState } from "react";
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
 *  ★ type="number" 의 스피너는 손가락으로 누르기엔 작고 실수로 값이 바뀐다.
 *  ★★ **`min` 을 받기만 하고 지키지 않고 있었다**(2026-09-14 실측으로 잡았다).
 *  type="number" 가 아니므로 DOM 의 `min` 속성도 아무 일을 하지 않는다 — 활성도에 −5 를 넣으면
 *  **−546.7 µSv/h** 가 정상 답과 똑같은 조판으로 나왔고, ALARA 는 음의 선량률을 받아
 *  체류시간을 **「unlimited」** 로 답했다. 방사선 안전 도구에서 가장 나쁜 종류의 오답이다.
 *  이제 범위를 벗어난 값은 **위로 NaN 을 올려** 답이 「—」가 되게 하고, 화면에는 이유를 적는다.
 *  ★ 초안(draft)을 따로 든다 — NaN 을 올리면 부모가 `value=""` 로 되돌려 **사용자가 방금 친
 *    글자가 사라지므로**, 무엇이 틀렸는지 볼 수 없다. 바깥이 유한한 값으로 바꿀 때만 따라간다. */
export function NumberInput({ value, onChange, step, min = 0, max, suffix, ...rest }: {
  value: number | string; onChange: (v: number) => void;
  step?: number; min?: number; max?: number; suffix?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "min" | "max">) {
  const extNum = typeof value === "number" ? value : Number(value === "" ? NaN : value);
  const [draft, setDraft] = useState(Number.isFinite(extNum) ? String(extNum) : "");

  /* 바깥이 값을 바꿨다(단위 전환·복원·모드 변경) → 초안을 그것으로 맞춘다.
     바깥이 NaN 인 것은 **우리가 방금 올린 무효 보고**이므로 초안을 건드리지 않는다. */
  const draftNum = draft.trim() === "" ? NaN : Number(draft);
  if (Number.isFinite(extNum) && extNum !== draftNum) setDraft(String(extNum));

  const empty = draft.trim() === "";
  const bad = !empty && (!Number.isFinite(draftNum) || draftNum < min || (max !== undefined && draftNum > max));
  const why = !bad ? null
    : !Number.isFinite(draftNum) ? "Enter a number."
    : draftNum < min ? (min === 0 ? "Cannot be negative." : `Must be at least ${min}.`)
    : `Must be at most ${max}.`;

  /* ★ 숫자 칸에 **폭 상한**을 둔다(2026-09-14 실측). 세 칸 구성 전에는 활성도 한 칸이
     **1036px** 였고, 세 칸으로 좁힌 뒤에도 격자 밖 단독 칸이 542px 였다. 「1」을 넣는 상자가
     화면 가로를 먹으면 **여기에 많이 써야 하는 것**으로 읽힌다 — 칸은 들어올 값의 크기로 짓는다.
     ★ 고르는 칸(Select)에는 걸지 않는다 — 보기 글자가 길어 넓은 편이 낫다.
     ★ **좁은 화면(sm 미만)에는 걸지 않는다** — 옆의 Select 는 전폭인데 숫자 칸만 256px 이면
       줄이 들쭉날쭉해 보인다(실측 스크린숏으로 잡았다). 거기서는 전폭이 오히려 단정하다. */
  return (
    <span className="relative block sm:max-w-[16rem]">
      <span className="relative block">
        <input
          {...rest}
          className={`field num pr-14 ${bad ? "!border-warn" : ""}`}
          inputMode="decimal"
          aria-invalid={bad || undefined}
          value={draft}
          onChange={(e) => {
            const s = e.target.value;
            setDraft(s);
            const v = s.trim() === "" ? NaN : Number(s);
            const ok = Number.isFinite(v) && v >= min && (max === undefined || v <= max);
            onChange(ok ? v : NaN);
          }}
          step={step}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-ink-faint">
            {suffix}
          </span>
        ) : null}
      </span>
      {why ? <span className="mt-1 block text-[12px] leading-snug text-warn">{why}</span> : null}
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
                 : "border-line bg-surface text-ink-muted hover:border-accent/40"}`}>
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
