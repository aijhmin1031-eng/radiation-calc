import { useCallback, useState } from "react";
import type React from "react";

/** 「지금 칸에 든 값」과 「그 답을 만든 값」을 가른다.
 *
 *  ★ 계기(2026-09-14 소유주 지시): 자동 계산은 값을 바꾸는 즉시 답이 따라 바뀌어
 *    **계산이 된 건지 안 된 건지 이용자가 알 수 없다.** 숫자가 조용히 움직이는 것은
 *    「내가 눌러서 나온 답」이 아니라 「어쩌다 그렇게 되어 있는 화면」으로 읽힌다.
 *
 *  그래서 결과는 **커밋된 스냅숏에서만** 그린다. 칸을 고치면 스냅숏은 그대로 있고
 *  `dirty` 가 서서 계산 단추가 눈에 띄게 바뀐다 — 누르기 전까지 화면의 답은
 *  **직전에 실제로 계산된 값**이고, 그 사실을 화면이 말한다.
 *
 *  ★ 처음 값은 곧바로 커밋해 둔다 — 도착하자마자 답이 하나 서 있는 것이
 *    이 도구의 진입장벽을 낮추는 가장 큰 요소다(빈 화면으로 맞이하지 않는다).
 *
 *  ★ `Object.is` 로 견준다 — `NaN !== NaN` 이라 `===` 로 보면 무효값이 든 칸이
 *    **영영 dirty** 로 남아 단추가 늘 켜져 있게 된다(경고가 늘 켜지면 아무도 안 본다).
 */
export function useCommitted<T extends Record<string, unknown>>(live: T) {
  const [committed, setCommitted] = useState<T>(live);

  const fields = Object.keys(live);
  const dirty = fields.length !== Object.keys(committed).length
    || fields.some((k) => !Object.is(live[k], (committed as Record<string, unknown>)[k]));

  /* 무효한 칸이 있으면 계산하지 않는다 — 눌러서 「—」가 나오면 도구가 고장 난 것으로 읽힌다.
     무엇이 틀렸는지는 그 칸이 이미 자기 아래에 적고 있다(NumberInput). */
  const invalid = Object.values(live).some((v) => typeof v === "number" && Number.isNaN(v));

  const commit = useCallback(() => { if (!invalid) setCommitted(live); }, [live, invalid]);

  /* ★ Enter 로도 계산된다 — 폼에서 가장 널리 기대되는 손버릇이고, 단추까지 손을 옮기지
     않아도 된다. 도구 뿌리 `<div>` 에 `{...keys}` 로 붙인다.
     ★ `<textarea>` 와 단추·링크는 건드리지 않는다 — Enter 가 그쪽의 제 일을 해야 한다. */
  const keys = {
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key !== "Enter" || e.shiftKey) return;
      const t = e.target as HTMLElement;
      if (/^(TEXTAREA|BUTTON|A|SUMMARY)$/.test(t.tagName)) return;
      e.preventDefault();
      commit();
    },
  };

  return { c: committed, dirty, invalid, commit, keys };
}
