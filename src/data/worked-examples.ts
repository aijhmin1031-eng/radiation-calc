/** 도구 쪽 「Worked examples」·「FAQ」에 적힌 수치 — 2026-10-25 D3.
 *
 *  ★★ **이 수치는 손으로 적은 것이 아니다.** 이 저장소의 엔진으로 계산한 값을 화면에 적는 자릿수로
 *    줄여 둔 것이고, `src/engine/*.test.ts` 의 「Worked examples」 테스트가 엔진을 다시 돌려
 *    같은 글자가 나오는지 단정한다. 엔진·자료가 바뀌어 값이 움직이면 테스트가 먼저 깨진다.
 *  ★ 쪽(`pages/*.astro`)과 문답(`data/tool-faq.ts`)은 이 값을 가져다 쓴다 — 숫자를 두 곳에 적지 않는다. */
export const EX = {
  gamma: {
    /** Cs-137 37 GBq, 차폐 없음 — mGy/h */
    cs1m: "2.85", cs2m: "0.712",
    /** 납 5 cm, 감쇠만(산란 제외) — µGy/h 와 투과율 % */
    csLeadUGyH: "5.11", csLeadPct: "0.18",
    /** Ir-192 1.5 TBq, 20 m — µGy/h, 그리고 20 µGy/h 가 되는 거리 m */
    ir20mUGyH: "409", irBoundaryM: "90.5",
    /** 공기커마율 상수 mGy·m²/(GBq·h), 20 keV 하한 */
    csConst: "0.0769", irConst: "0.109", coConst: "0.306",
    /** 납의 반가층 cm — 662 keV, 좁은 빔 */
    leadHvlCs: "0.55",
  },
  decay: {
    /** Tc-99m 800 MBq 07:00 → 10:30, 13:00 — MBq */
    tc1030: "534", tc1300: "400",
    /** 1520 → 1181 s⁻¹ in 24 h — 반감기 h, d, 그리고 한쪽 계수율 1% 오차가 옮기는 % */
    hlH: "65.9", hlD: "2.75", hlSensPct: "4",
    /** Mo-99·Au-198 의 평가 반감기 d */
    mo99D: "2.75", au198D: "2.69",
    /** I-131 이 1/1000 이 되는 데 걸리는 날 */
    i131ThousandthD: "80.0",
  },
  units: {
    /** 2400 dpm/100 cm² → Bq/cm², 그리고 4 Bq/cm² → dpm/100 cm² */
    wipeBqCm2: "0.4", limitDpm: "24000",
    /** 2.5 mR/h → C/kg/h(×10⁻⁷) → µGy/h 공기커마, 그리고 1 R 의 공기커마 mGy */
    mrCkg7: "6.45", mrUGyH: "21.9", rMGy: "8.76",
    /** 10 mCi → MBq */
    mCi10: "370",
  },
  mda: {
    /** 스미어 계수 — 배경 40 cpm, 효율 30%, 60 s: L_C·L_D 계수, MDA Bq, 그리고 600 s 의 MDA Bq */
    wipeLc: "14.7", wipeLd: "32.1", wipeMda: "1.79", wipeMda600: "0.532",
    /** 액체섬광 H-3 — 배경 2.5 cpm, 효율 25%, 10 mL, 100 min: L_C·L_D 계수, 병 하나의 MDA Bq, MDA Bq/L, 그리고 400 min */
    lscLc: "36.8", lscLd: "76.3", lscMdaBq: "0.0508", lscMda: "5.08", lscMda400: "2.5",
  },
  /* ── 2026-10-25 D4 ── */
  beta: {
    /** Y-90 비정 g/cm², 아크릴(1.19 g/cm³)로 멈추는 두께 mm, 아크릴 5 mm 투과 % */
    y90RangeGcm2: "1.09", y90AcrylicMm: "9.2", y90T5mm: "1.91",
    /** Y-90 제동복사로 바뀌는 비율 % — 아크릴(Z 6.5)·납, 그리고 납/아크릴 배수 */
    brAcrPct: "0.52", brPbPct: "6.5", brRatio: "13",
    /** Y-90 1 GBq/kg 무한매질 선량률 mGy/h, 평균수명 h, 다 붕괴할 때까지의 선량 Gy */
    y90RateMGyH: "538", y90MeanLifeH: "92.4", y90GyPerGBqKg: "49.7",
    /** 2 GBq 를 1.6 kg 엽에 — 처음 선량률 mGy/h, 총선량 Gy */
    lobeRateMGyH: "672", lobeGy: "62.1",
  },
  alara: {
    /** 1 m 에서 1.8 mSv/h, 예산 0.5 mSv — 머물 수 있는 분(1 m, 2 m), 그리고 1 시간을 버티는 거리 m */
    stay1m: "16.67", stay2m: "66.67", oneHourM: "1.9",
    /** 기본 작업 세 단계의 집단선량 person·mSv, 주 작업 몫, 주 작업을 2 m 에서 할 때, 줄어든 %, 모든 선량률 절반 */
    jobTotal: "1.66", jobMain: "1.5", jobAt2m: "0.535", jobCutPct: "68", jobHalf: "0.83",
    /** 주 작업자 한 사람의 선량 mSv — 1 m, 2 m */
    mainPerWorker: "0.5", mainPerWorker2m: "0.125",
  },
  specificActivity: {
    /** Cs-137 37 GBq(1 Ci)의 순수 질량 mg, 비방사능 Ci/g */
    cs1CiMg: "11.52", csCiPerG: "86.81",
    /** 1 g 의 방사능 — U-238 kBq, Pu-239 GBq, 그 배수, 그리고 U-238 1 g 과 같은 방사능의 Pu-239 µg */
    u238KBq: "12.44", pu239GBq: "2.295", puURatio: "185000", puSameUg: "5.42",
    /** 연기감지기 Am-241 37 kBq 의 질량 µg */
    am37kBqUg: "0.292",
  },
  xray: {
    /** 70·90 kVp — 평균에너지 keV, 20 keV 아래 광자 %, 50 keV 이상 광자 % */
    m70: "21.5", m90: "27.2", below20at70: "53", below20at90: "41", above50at70: "5.7", above50at90: "13.8",
    /** 60·120 kVp — 평균에너지 keV, 40 keV 이상 광자 %, 그리고 가장 많은 광자의 에너지 keV */
    m60: "18.5", m120: "35.5", above40at60: "8.2", above40at120: "36.2", peakKeV: "9",
  },
} as const;
