/** 플랫폼 공통 로그인 — Radiation Lab 전체가 계정 하나를 쓴다.
 *
 *  ★★ 세션은 **저절로 공유된다.** lab 들이 같은 오리진(`radiation-lab.com/…`)에 살고
 *    같은 Supabase 프로젝트를 보기 때문이다. Supabase 세션은 localStorage 의
 *    `sb-<프로젝트>-auth-token` 한 칸이라, RadiMeter 나 처분 lab 에서 로그인했으면
 *    여기도 이미 로그인 상태다. 별도 로그인 화면을 두지 않는다.
 *
 *  ★ 미설정 환경(로컬·미리보기)에서는 **조용히 비활성**이다 — 도구가 통째로 잠기는 것이
 *    로그인을 못 거는 것보다 큰 고장이다. 저장 버튼만 안내 문구로 바뀐다. */
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY_ = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/* ★ 판정은 `lib/features.ts` 한 곳이다 — 내비·낱장·저장막대가 **같은 답**을 봐야
   「저장은 못 하는데 메뉴에는 있는」 어긋난 상태가 안 생긴다. */
import { SAVE_ENABLED } from "./features";
export { SAVE_ENABLED as authConfigured } from "./features";

/* ★ **같은 판정을 쓴다.** 여기서 원시 값의 참/거짓만 보면 꼴이 틀린 주소로도
   생성자를 불러 던지고, 그 예외가 아일랜드 수화를 통째로 깨뜨려 계산기가 안 뜬다. */
export const supabase: SupabaseClient | null =
  SAVE_ENABLED
    ? createClient(URL_ as string, KEY_ as string, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "implicit" },
      })
    : null;

export async function signInWithGoogle(): Promise<void> {
  if (!supabase) throw new Error("Sign-in is not configured on this deployment.");
  // ★ 돌아올 자리는 지금 주소 그대로다 — 계산 조건이 담긴 쿼리까지 살린다.
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.href },
  });
  if (error) throw error;
}

export async function currentUser(): Promise<User | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/** 표시 이름 — 플랫폼이 공유하는 거울(`rl-profile-name`)을 먼저 본다. */
export function displayName(u: User | null): string {
  if (!u) return "";
  try {
    const m = localStorage.getItem("rl-profile-name");
    if (m) return m;
  } catch { /* 사생활 보호 창에서는 접근이 막힌다 */ }
  const md = u.user_metadata ?? {};
  return ((md.name as string) || (md.full_name as string) || u.email || "Signed in").trim();
}
