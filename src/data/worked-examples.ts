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
} as const;
