/** 저장본에서 조건을 되살린다.
 *
 *  ★ 조건은 **주소에 담는다**(`?s=<base64 json>`) — 그러면 링크로 남에게 보낼 수 있고,
 *    로그인하러 떠났다가 돌아와도 그대로다(`redirectTo: window.location.href`).
 *  ★ `?ref=` 로 오면 저장본을 읽어 와야 하므로 비동기다. 그건 화면 쪽에서 다룬다. */
export function encodeState(inputs: Record<string, unknown>): string {
  const json = JSON.stringify(inputs);
  // btoa 는 라틴1만 받는다 — 한글·기호가 섞이면 던진다
  return btoa(String.fromCharCode(...new TextEncoder().encode(json)));
}

export function decodeState(s: string): Record<string, unknown> | null {
  try {
    const bin = atob(s);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const v = JSON.parse(new TextDecoder().decode(bytes));
    return v && typeof v === "object" && !Array.isArray(v) ? v : null;
  } catch { return null; }
}

/** 화면이 뜰 때 한 번 읽는다.
 *
 *  ★★ 이것을 렌더 중에 부르면 **하이드레이션이 깨진다** — 서버는 window 가 없어 기본값으로
 *    그리고 브라우저는 복원값으로 그려서 두 그림이 다르다(React #418·#425 로 나왔다).
 *    그래서 계산기 아일랜드는 **`client:only="react"`** 로 띄운다. 서버가 아예 안 그리면
 *    비교할 대상이 없어 불일치가 성립하지 않는다.
 *  ★ 색인되는 글은 Astro 가 그리는 해설 산문이므로 이 선택이 검색에 손해를 주지 않는다. */
export function initialState(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  const s = new URLSearchParams(window.location.search).get("s");
  return s ? decodeState(s) : null;
}

/** 저장본의 값과 기본값을 섞는다 — 저장 뒤에 늘어난 칸은 기본값으로 채운다. */
export function pick<T>(state: Record<string, unknown> | null, key: string, fallback: T): T {
  if (!state || !(key in state)) return fallback;
  const v = state[key];
  if (typeof v !== typeof fallback) return fallback;   // 형이 다르면 믿지 않는다
  return v as T;
}
