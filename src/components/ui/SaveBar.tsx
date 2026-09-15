import { useEffect, useState } from "react";
import GoogleMark from "./GoogleMark";
import type { User } from "@supabase/supabase-js";
import { supabase, signInWithGoogle, currentUser, displayName, authConfigured } from "../../lib/auth";
import { saveResult, stash, type SaveInput } from "../../lib/saved";
import { u } from "../../lib/site";

/** 계산기 아래에 붙는 저장 막대.
 *  ★ 도구 자체는 로그인 없이 쓴다 — 이 막대만 로그인을 묻는다.
 *  ★ 비로그인이어도 **계산은 브라우저에 담아 둔다**(stash). 로그인하면 옮겨 담을 수 있다. */
export function SaveBar({ tool, inputs, outputs, summary }: {
  tool: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  /** 저장 이름의 기본값 — 「Co-60, 37 GBq at 1 m」처럼 나중에 알아볼 수 있게 */
  summary: string;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    currentUser().then((x) => { if (alive) { setUser(x); setReady(true); } })
      .catch(() => { if (alive) setReady(true); });
    const sub = supabase?.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => { alive = false; sub?.data.subscription.unsubscribe(); };
  }, []);

  // 계산이 바뀌면 이전 저장 결과 표시를 지운다 — 옛 번호가 새 조건에 붙어 보이면 안 된다
  useEffect(() => { setDone(null); setErr(null); }, [JSON.stringify(inputs)]);

  const onSave = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await saveResult({ tool, title: title || summary, inputs, outputs });
      setDone(r.ref); setTitle("");
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };

  const onSignIn = async () => {
    // ★ 로그인하러 떠나기 전에 담아 둔다 — 돌아와서 그대로 저장할 수 있다
    stash({ tool, inputs, outputs, title: summary } satisfies SaveInput);
    try { await signInWithGoogle(); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
  };

  if (!authConfigured) return null;   // 미설정 환경에서는 조용히 사라진다

  return (
    <div className="card mt-6 p-4">
      {!ready ? (
        <p className="text-[13px] text-ink-faint">…</p>
      ) : !user ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] leading-snug text-ink-muted">
            <strong className="text-ink">Keep this result?</strong> Sign in to save it with a reference
            number you can look up later. The calculator itself never needs an account.
          </p>
          <button type="button" className="btn btn-primary shrink-0" onClick={onSignIn}>
            <GoogleMark />
            Sign in with Google
          </button>
        </div>
      ) : done ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[14px] text-ink">
            Saved as <strong className="num">{done}</strong>
          </p>
          <a href={u("/saved/")} className="btn shrink-0">View saved results</a>
        </div>
      ) : (
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-[14rem] flex-1">
            <span className="label">Save this result as</span>
            <input className="field" value={title} placeholder={summary} maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !busy) onSave(); }} />
          </label>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={onSave}>
            {busy ? "Saving…" : "Save result"}
          </button>
          <p className="w-full text-[12px] text-ink-faint">
            Signed in as {displayName(user)} · saved results are private to your account
          </p>
        </div>
      )}
      {err ? <p className="mt-3 text-[13px] text-ink">{err}</p> : null}
    </div>
  );
}
