import { useMemo, useState, useRef, useEffect } from "react";
import type { Nuclide, NuclideMap, Emission } from "../../engine/types";
import { emissionKinds } from "../../engine/types";
import { searchNuclides } from "../../lib/nuclide-search";

const KIND_LABEL: Record<Emission, string> = { gamma: "γ", xray: "X", beta: "β", alpha: "α" };

/** 핵종 선택 — 147종이라 맨 드롭다운은 못 쓴다. 검색 + 방출종류 거르개를 붙인다.
 *  ★ 「그 도구가 쓸 수 있는 핵종」만 보여 주는 것이 요점이다 — 감마 차폐 화면에서
 *    순수 베타 방출체를 고를 수 있으면 사용자는 0 이 나오는 이유를 알 수 없다. */
export function NuclidePicker({ nuclides, value, onChange, require: req, label = "Nuclide" }: {
  nuclides: NuclideMap;
  value: string;
  onChange: (key: string) => void;
  /** 이 방출을 가진 것만 고를 수 있다 */
  require?: Emission[];
  label?: string;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const list = useMemo(() => searchNuclides(nuclides, q, req), [nuclides, q, req]);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);

  const cur = nuclides[value];
  return (
    <div className="block" ref={box}>
      <span className="label">{label}</span>
      <button type="button" onClick={() => { setOpen((o) => !o); setQ(""); }}
        className="field flex items-center justify-between text-left" aria-haspopup="listbox" aria-expanded={open}>
        <span className="flex items-center gap-1.5">
          <span className="num font-semibold text-ink">{value}</span>
          {cur?.iso ? (
            <span className="rounded bg-ink-faint/15 px-1 text-[10px] font-medium uppercase tracking-wide text-ink-faint">
              metastable
            </span>
          ) : null}
        </span>
        <span className="flex items-center gap-2 text-[12px] text-ink-faint">
          {cur ? <span>{cur.hl} {cur.hl_unit}</span> : null}
          {cur ? <Kinds kinds={emissionKinds(cur)} /> : null}
          <span aria-hidden>▾</span>
        </span>
      </button>

      {open ? (
        <div className="relative">
          <div className="absolute z-20 mt-1 w-full rounded-md border border-line bg-surface shadow-lg">
            <div className="border-b border-line p-2">
              <input autoFocus className="field" placeholder="Type to filter — e.g. cs137, co-60, pu"
                value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <ul role="listbox" className="max-h-72 overflow-y-auto py-1">
              {list.length === 0 ? (
                <li className="px-3 py-3 text-[13px] text-ink-faint">
                  No nuclide matches — this calculator needs {req?.join(" or ")} emission data.
                </li>
              ) : list.map(({ k, n, kinds }) => (
                <li key={k}>
                  <button type="button" role="option" aria-selected={k === value}
                    onClick={() => { onChange(k); setOpen(false); }}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[14px] hover:bg-accent-soft ${
                      k === value ? "bg-accent-soft font-semibold" : ""}`}>
                    <span className="flex items-center gap-1.5">
                      <span className="num">{k}</span>
                      {n.iso ? (
                        <span className="rounded bg-ink-faint/15 px-1 text-[10px] font-medium uppercase tracking-wide text-ink-faint">
                          metastable
                        </span>
                      ) : null}
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-[12px] text-ink-faint">
                      <span className="num">{n.hl} {n.hl_unit}</span>
                      <Kinds kinds={kinds} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="border-t border-line px-3 py-1.5 text-[11px] text-ink-faint">
              {list.length} of {Object.keys(nuclides).length} nuclides
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Kinds({ kinds }: { kinds: Emission[] }) {
  return (
    <span className="flex gap-0.5">
      {kinds.map((c) => (
        <span key={c} title={c}
          className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border border-line px-1 text-[10px] font-semibold text-ink-muted">
          {KIND_LABEL[c]}
        </span>
      ))}
    </span>
  );
}

export type { Nuclide };
