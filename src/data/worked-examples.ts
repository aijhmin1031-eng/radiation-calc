/** 도구 쪽 「Worked examples」·「FAQ」에 적힌 수치 — 2026-10-25 D3.
 *
 *  ★★ **이 수치는 손으로 적은 것이 아니다.** 이 저장소의 엔진으로 계산한 값을 화면에 적는 자릿수로
 *    줄여 둔 것이고, `src/engine/*.test.ts` 의 「Worked examples」 테스트가 엔진을 다시 돌려
 *    같은 글자가 나오는지 단정한다. 엔진·자료가 바뀌어 값이 움직이면 테스트가 먼저 깨진다.
 *  ★ 쪽(`pages/*.astro`)과 문답(`data/tool-faq.ts`)은 이 값을 가져다 쓴다 — 숫자를 두 곳에 적지 않는다. */
export const EX = {
  gamma: {
    /** Cs-137 37 GBq, 차폐 없음 — mGy/h */
    cs1m: "2.85", cs2m: "0.714",
    /** 납 5 cm, 감쇠만(산란 제외) — µGy/h 와 투과율 % */
    csLeadUGyH: "5.11", csLeadPct: "0.18",
    /** Ir-192 1.5 TBq, 20 m — µGy/h, 그리고 20 µGy/h 가 되는 거리 m */
    ir20mUGyH: "410", irBoundaryM: "90.6",
    /** 공기커마율 상수 mGy·m²/(GBq·h), 20 keV 하한 */
    csConst: "0.0771", irConst: "0.109", coConst: "0.306",
    /** 납의 반가층 cm — 662 keV, 좁은 빔 */
    leadHvlCs: "0.55",
  },
} as const;
