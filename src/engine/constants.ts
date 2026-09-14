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
