import { supabase, authConfigured } from "./auth";
import { REF_PATTERN } from "./tools";

export interface SavedResult {
  id: number;
  ref: string;                 // RC-GAM-20260914-0001 — 서버가 발급한다
  created_at: string;
  updated_at: string;
  tool: string;
  title: string | null;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
}

export type SaveInput = { tool: string; title?: string | null;
                          inputs: Record<string, unknown>; outputs: Record<string, unknown> };

/** ★ `ref` 와 `user_id` 는 **보내지 않는다.** 서버 트리거가 정한다 —
 *  클라이언트가 정하게 두면 남의 번호를 주장할 수 있다. */
export async function saveResult(r: SaveInput): Promise<SavedResult> {
  if (!supabase) throw new Error("Saving is not configured on this deployment.");
  const { data, error } = await supabase
    .from("calc_results")
    .insert({ tool: r.tool, title: r.title?.trim() || null, inputs: r.inputs, outputs: r.outputs })
    .select()
    .single();
  if (error) throw new Error(friendly(error.message, error.code));
  return data as SavedResult;
}

export async function listResults(opts: { tool?: string; query?: string; limit?: number } = {}): Promise<SavedResult[]> {
  if (!supabase) return [];
  let q = supabase.from("calc_results").select("*").order("created_at", { ascending: false })
    .limit(opts.limit ?? 200);
  if (opts.tool) q = q.eq("tool", opts.tool);
  const { data, error } = await q;
  if (error) throw new Error(friendly(error.message, error.code));
  const rows = (data ?? []) as SavedResult[];
  const needle = opts.query?.trim().toLowerCase();
  if (!needle) return rows;
  return rows.filter((r) =>
    r.ref.toLowerCase().includes(needle) ||
    (r.title ?? "").toLowerCase().includes(needle) ||
    r.tool.includes(needle) ||
    JSON.stringify(r.inputs).toLowerCase().includes(needle));
}

export async function getByRef(ref: string): Promise<SavedResult | null> {
  if (!supabase || !REF_PATTERN.test(ref)) return null;
  const { data, error } = await supabase.from("calc_results").select("*").eq("ref", ref).maybeSingle();
  if (error) throw new Error(friendly(error.message, error.code));
  return (data as SavedResult) ?? null;
}

export async function renameResult(id: number, title: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("calc_results").update({ title: title.trim() || null }).eq("id", id);
  if (error) throw new Error(friendly(error.message, error.code));
}

export async function deleteResult(id: number): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("calc_results").delete().eq("id", id);
  if (error) throw new Error(friendly(error.message, error.code));
}

/** ★ 오류를 그대로 보이지 않는다 — Postgres 코드는 사용자에게 아무 뜻이 없고,
 *  「잠시 후 다시」로 뭉개면 **영영 안 되는 것이 일시적 오류처럼 읽힌다**(라이브에서 밟았다). */
function friendly(msg: string, code?: string): string {
  if (code === "42501" || /sign-in required|permission denied|row-level security/i.test(msg))
    return "Sign in to save results.";
  if (code === "23514" || /violates check constraint/.test(msg))
    return "This result is too large to save, or the tool name is not valid.";
  if (code === "23505") return "That reference already exists — try saving again.";
  if (/Failed to fetch|NetworkError/i.test(msg)) return "Could not reach the server. Check your connection.";
  return msg;
}

/* ── 비로그인 임시 보관 ───────────────────────────────────────────────
   ★ 로그인하지 않은 사람의 계산을 버리지 않는다. 최근 몇 건을 브라우저에 담아 두고
     로그인하는 순간 「계정에 저장할까요?」를 띄운다 — 익명 유입을 가입으로 잇는 자리다.
   ★ localStorage 는 사생활 보호 창에서 던진다. 전부 try 로 감싸고, 없으면 없는 대로 돈다. */
const STASH = "radcalc-stash";
const STASH_MAX = 5;
export interface Stashed extends SaveInput { at: string }

export function stash(r: SaveInput): void {
  try {
    const prev = readStash().filter((x) => JSON.stringify(x.inputs) !== JSON.stringify(r.inputs) || x.tool !== r.tool);
    const next = [{ ...r, at: new Date().toISOString() }, ...prev].slice(0, STASH_MAX);
    localStorage.setItem(STASH, JSON.stringify(next));
  } catch { /* 담아 두지 못해도 계산은 계속된다 */ }
}
export function readStash(): Stashed[] {
  try {
    const v = JSON.parse(localStorage.getItem(STASH) || "[]");
    return Array.isArray(v) ? v.filter((x) => x && typeof x.tool === "string").slice(0, STASH_MAX) : [];
  } catch { return []; }
}
export function clearStash(): void {
  try { localStorage.removeItem(STASH); } catch { /* 비어 있는 것과 같다 */ }
}

export const savingAvailable = authConfigured;
