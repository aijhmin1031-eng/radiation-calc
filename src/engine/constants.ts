/** 물리상수 — CODATA 2018 (SI 정의값). 기억으로 적지 않는다. */
export const N_A = 6.02214076e23;          // /mol  (정의값)
export const LN2 = Math.LN2;
export const MEV_J = 1.602176634e-13;      // J/MeV (정의값 e 에서)

/** 단위 환산 — 전부 정의값이라 반올림이 없다. */
export const BQ_PER_CI = 3.7e10;           // 정의
export const GY_PER_RAD = 0.01;            // 정의
export const SV_PER_REM = 0.01;            // 정의
export const CKG_PER_R = 2.58e-4;          // 뢴트겐 정의 (C/kg)
export const DPM_PER_BQ = 60;

/** 공기의 W값 — 공기커마 ↔ 조사선량 환산에 쓴다. */
export const W_AIR_J_PER_C = 33.97;        // J/C (ICRU)

/** Γ 계산의 기본 저에너지 차단.
 *  ★ 이 값이 저에너지 방출체의 답을 좌우한다 — δ=10 keV 로 두면 Am-241 이 +805% 틀린다.
 *  캡슐에 흡수되어 거리에서 선량에 기여하지 않는 광자를 빼는 관행이다. */
export const DELTA_DEFAULT_KEV = 20;

/** ★★ **해는 한 가지가 아니다 — 여기가 정본이다**(2026-09-17, 붕괴 유효성 평가에서 잡았다).
 *  율리우스년 365.25 d 와 그레고리력 평균년 365.2425 d 가 0.002% 다르다. 작지만, 자료의
 *  초와 화면의 「년」이 다른 해를 쓰면 **어느 검사에도 안 걸린 채** 답이 그만큼 어긋난다.
 *  ★ 실제로 이 레포가 둘 다 쓰고 있었다 — `Decay.tsx` 는 그레고리력, `Beta.tsx` 는 율리우스년.
 *  ★ **그레고리력을 고른 것은 취향이 아니다**: IAEA Livechart 가 내주는 `half_life_sec` 이
 *    그 해로 만들어져 있다(두 평가가 같은 수를 싣는 핵종 넷에서 잔차를 재어 확인했다 —
 *    율리우스년이면 2.1×10⁻⁵, 그레고리력이면 10⁻⁶ 미만). **자료를 따라간다.**
 *  ★ 지키는 것은 `src/validation/decay.test.ts` 의 ⑤다. */
export const TIME_S = { s: 1, min: 60, h: 3600, d: 86400, y: 365.2425 * 86400 } as const;
