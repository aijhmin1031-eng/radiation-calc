/** 계산 단추 — 이 도구에서 **답이 언제 만들어지는지**를 정하는 한 자리.
 *
 *  ★ 상태가 셋이고 **색으로 갈린다**(2026-09-14 소유주 지시
 *    「기존 값이랑 바뀌면은 그 계산 버튼 색깔이 바뀌어서 새로운 계산을 할 수 있게」).
 *    ① 바뀜 — 앰버로 채운다. 누를 것이 있다.
 *    ② 최신 — 조용한 외곽선. 화면의 답이 지금 칸과 맞는다.
 *    ③ 무효 — 누를 수 없다. 어느 칸이 틀렸는지는 그 칸이 스스로 적는다.
 *
 *  ★ 앰버는 규약상 **활성·포커스·기준선** 자리다. 단추가 「눌러야 할 것」인 상태는
 *    활성 표시이지 판정이 아니므로 어긋나지 않는다. 오류는 `--c-warn` 이 따로 든다.
 *
 *  ★ `disabled` 속성을 쓰지 않는다 — 초점을 못 받아 **키보드·읽어 주는 기계에서 사라진다.**
 *    `aria-disabled` 로 알리고 누름만 막으면 이유를 읽을 수 있다.
 *
 *  ★ **고정(sticky)하지 않는다** — 실측으로 입력칸 무리와 답이 한 화면(237~615px < 844)에
 *    함께 들어오므로, 그 사이에 두면 둘 다 보이는 자리다. 화면 아래에 붙이면 얻는 것 없이
 *    본문을 가릴 위험만 는다(가림은 지금 게이트가 못 보는 종류의 결함이다).
 */
export function CalcButton({ dirty, invalid, onClick, verb = "Calculate" }: {
  dirty: boolean; invalid: boolean; onClick: () => void; verb?: string;
}) {
  const blocked = invalid;
  return (
    <div>
      <button
        type="button"
        aria-disabled={blocked || undefined}
        onClick={() => { if (!blocked) onClick(); }}
        className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 text-[15px] font-semibold transition-colors min-h-[48px] ${
          blocked
            ? "cursor-not-allowed border-line bg-surface text-ink-faint"
            : dirty
              ? "border-accent bg-accent-soft text-ink hover:border-accent/70"
              : "border-line bg-surface text-ink-muted hover:border-accent/40"}`}
      >
        {/* ★ 글자는 **늘 같다** — 처음 온 사람에게 「Calculate again」은 거짓말이다
            (아직 아무것도 안 눌렀다). 상태는 색과 아래 한 줄이 든다. */}
        {blocked ? "Check the highlighted field" : verb}
      </button>

      {/* ★ 상태를 **글자로도** 적는다 — 색만으로 가르면 색각 이상이 있는 이용자에게는
          두 상태가 같은 단추다(그리고 색은 스크린리더에 없다). */}
      <p
        aria-live="polite"
        className={`mt-1.5 text-center text-[12px] leading-snug ${
          blocked ? "text-warn" : dirty ? "text-ink" : "text-ink-faint"}`}
      >
        {blocked
          ? "One of the inputs is not a valid number."
          : dirty
            ? "Inputs changed — the result below is from the previous calculation."
            : "The result below was calculated from these inputs."}
      </p>
    </div>
  );
}
