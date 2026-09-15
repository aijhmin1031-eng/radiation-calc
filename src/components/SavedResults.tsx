import { useEffect, useMemo, useState } from "react";
import GoogleMark from "./ui/GoogleMark";
import type { User } from "@supabase/supabase-js";
import { supabase, signInWithGoogle, currentUser, displayName, authConfigured } from "../lib/auth";
import { listResults, deleteResult, renameResult, readStash, clearStash, saveResult,
         type SavedResult, type Stashed } from "../lib/saved";
import { TOOLS, toolBySlug } from "../lib/tools";
import { encodeState } from "../lib/restore";
import { u } from "../lib/site";
import { Select } from "./ui/Field";

export default function SavedResults() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<SavedResult[]>([]);
  const [q, setQ] = useState("");
  const [tool, setTool] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Stashed[]>([]);

  useEffect(() => {
    let alive = true;
    setPending(readStash());
    currentUser().then((x) => { if (alive) { setUser(x); setReady(true); } })
      .catch(() => { if (alive) setReady(true); });
    const sub = supabase?.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => { alive = false; sub?.data.subscription.unsubscribe(); };
  }, []);

  const reload = async () => {
    if (!user) return;
    setBusy(true); setErr(null);
    try { setRows(await listResults()); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };
  useEffect(() => { if (user) void reload(); else setRows([]); }, [user]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) =>
      (!tool || r.tool === tool) &&
      (!needle || r.ref.toLowerCase().includes(needle) || (r.title ?? "").toLowerCase().includes(needle) ||
        JSON.stringify(r.inputs).toLowerCase().includes(needle)));
  }, [rows, q, tool]);

  /** ★ 로그인 전에 계산한 것을 계정으로 옮긴다 — 익명 유입을 가입으로 잇는 자리다. */
  const adoptStash = async () => {
    setBusy(true); setErr(null);
    try {
      for (const s of pending) await saveResult({ tool: s.tool, title: s.title ?? null, inputs: s.inputs, outputs: s.outputs });
      clearStash(); setPending([]); await reload();
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };

  const openLink = (r: SavedResult) => {
    try { return `${u(`/${r.tool}/`)}?s=${encodeURIComponent(encodeState(r.inputs))}`; }
    catch { return u(`/${r.tool}/`); }
  };

  if (!authConfigured)
    return <p className="text-[15px] text-ink-muted">Saving is not enabled on this deployment.</p>;

  if (!ready) return <p className="text-[13px] text-ink-faint">…</p>;

  if (!user) return (
    <div className="card p-6">
      <p className="text-[15px] leading-relaxed text-ink-muted">
        Sign in to see results you have saved. The calculators themselves work without an account —
        only saving and looking things up later needs one.
      </p>
      <button type="button" className="btn btn-primary mt-4" onClick={() => void signInWithGoogle()}>
        <GoogleMark />
        Sign in with Google
      </button>
      {pending.length ? (
        <p className="mt-4 text-[13px] text-ink-faint">
          {pending.length} recent calculation{pending.length > 1 ? "s are" : " is"} held in this browser —
          sign in and you can move {pending.length > 1 ? "them" : "it"} to your account.
        </p>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-5">
      {pending.length ? (
        <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-[14px] text-ink-muted">
            <strong className="text-ink">{pending.length} calculation{pending.length > 1 ? "s" : ""}</strong>{" "}
            from before you signed in {pending.length > 1 ? "are" : "is"} still in this browser.
          </p>
          <span className="flex gap-2">
            <button type="button" className="btn btn-primary" disabled={busy} onClick={adoptStash}>
              Save to my account
            </button>
            <button type="button" className="btn" onClick={() => { clearStash(); setPending([]); }}>
              Discard
            </button>
          </span>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <label className="block">
          <span className="label">Search</span>
          <input className="field" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Reference, name, nuclide…" />
        </label>
        <label className="block">
          <span className="label">Calculator</span>
          <Select value={tool} onChange={setTool}
            options={[{ value: "", label: "All" }, ...TOOLS.map((t) => ({ value: t.slug, label: t.name }))]} />
        </label>
        <span className="flex items-end">
          <button type="button" className="btn" disabled={busy} onClick={() => void reload()}>
            {busy ? "…" : "Refresh"}
          </button>
        </span>
      </div>

      {err ? <p className="card p-3 text-[13px] text-ink">{err}</p> : null}

      {shown.length === 0 ? (
        <div className="card p-6 text-[15px] leading-relaxed text-ink-muted">
          {rows.length === 0 ? (
            <>Nothing saved yet. Run a calculation and use <strong className="text-ink">Save result</strong> at
              the bottom of any calculator — it will get a reference number you can look up here.</>
          ) : <>No saved result matches that filter.</>}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table>
            <thead>
              <tr><th>Reference</th><th>Name</th><th>Calculator</th><th>Saved</th><th className="text-right">Actions</th></tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  <td className="num whitespace-nowrap">{r.ref}</td>
                  <td>
                    <input className="field !min-h-0 !py-1 !text-[13px]" defaultValue={r.title ?? ""}
                      placeholder="(no name)" maxLength={200}
                      onBlur={async (e) => {
                        if (e.target.value === (r.title ?? "")) return;
                        try { await renameResult(r.id, e.target.value); await reload(); }
                        catch (x) { setErr(x instanceof Error ? x.message : String(x)); }
                      }} />
                  </td>
                  <td className="whitespace-nowrap">{toolBySlug(r.tool)?.name ?? r.tool}</td>
                  <td className="num whitespace-nowrap">{new Date(r.created_at).toISOString().slice(0, 16).replace("T", " ")}</td>
                  <td className="whitespace-nowrap text-right">
                    <a className="btn !min-h-0 !py-1 !text-[13px]" href={openLink(r)}>Open</a>{" "}
                    <button type="button" className="btn !min-h-0 !py-1 !text-[13px]"
                      onClick={() => download(r)}>JSON</button>{" "}
                    <button type="button" className="btn !min-h-0 !py-1 !text-[13px]"
                      onClick={async () => {
                        if (!confirm(`Delete ${r.ref}? This cannot be undone.`)) return;
                        try { await deleteResult(r.id); await reload(); }
                        catch (x) { setErr(x instanceof Error ? x.message : String(x)); }
                      }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[12px] text-ink-faint">
        {rows.length} saved · signed in as {displayName(user)} · results are private to your account
      </p>
    </div>
  );
}

function download(r: SavedResult) {
  const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${r.ref}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
