import { NUCLIDES } from "./nuclides";

/**
 * 붕괴 연쇄에서 **실제로 막아야 할 것이 딸핵종인 경우**를 가린다.
 *
 * ★★★ **계기는 라이브의 틀린 결론이다**(2026-09-23 실측). 낱장이 딸핵종을 한 번도 말하지
 *   않아, Ru-106 쪽이 「0.0215 mm 의 아크릴이면 종점을 멈춘다」고 적고 있었다. 실제 Ru-106
 *   선원은 예외 없이 Rh-106(반감기 30초, 종점 3.54 MeV)과 평형이라 **17 mm 남짓**이 필요하다 —
 *   **약 800배**다. Sr-90 은 7배(1.57 → 약 11 mm)였다.
 *   ★ 숫자는 하나도 틀리지 않았다. **틀린 것은 결론**이다 — 이 레포가 되풀이해 적어 온
 *     「빌드는 통과하는」 함정의 물리판이고, 면책 문구로 덮을 수 있는 종류가 아니다.
 *
 * ★★ **기억으로 물리를 쓰지 않는다.** 딸핵종의 신원은 `z`·`a`·`decay` 에서 나오는 **산술**이고
 *   (β⁻ → Z+1 · β⁺/EC → Z−1 · α → Z−2, A−4 · IT → 같은 핵종의 바닥상태),
 *   반감기·종점·감마상수는 **전부 우리 자료에 있다**. **분기비는 자료에 없으므로 주장하지
 *   않는다** — 「몇 %가 이 딸로 간다」는 여기서 한 줄도 쓰지 않는다.
 *
 * ★★ **평형을 한 덩어리로 다루지 않는다.** 그러면 반대 방향의 거짓이 된다 — 갓 분리한
 *   Th-230 에는 Ra-226 이 없다(자라는 데 수천 년이 걸린다). 둘로 가른다:
 *   · `present`  — 딸 반감기가 **30일 이하**라 몇 달이면 다 자란다. 손에 쥐는 선원은
 *                  사실상 **언제나** 평형이다(Rh-106 30초 · Y-90 64시간 · P-32 14일).
 *   · `ingrowing`— 그보다 길다. **분리 시점을 모르면 있는지 없는지 말할 수 없다.**
 *                  쪽은 「자란다」고만 말하고 있다고 주장하지 않는다.
 *
 * ★★ **한 걸음만 본다 — 그리고 그것을 숨기지 않는다.** Th-230 → Ra-226 의 실제 위험은
 *   Ra-226 자신이 아니라 **그 아래 연쇄**(Rn-222 이후)이고, U-232 도 마찬가지다(Th-228 이
 *   아니라 그 아래가 센 감마를 낸다). 한 걸음짜리 값을 그대로 쓰면 **100배 규모로 과소**
 *   말하게 되므로, 하한에 걸려 떨어지는 것을 **되살리지 않는다.** 여러 걸음 연쇄의 **값**은 이
 *   모듈의 범위 밖이고, 범위 밖인 것에 대해 이 쪽은 **아무 말도 하지 않는다.**
 *   ★ T13 — 아래 `chainLeavesDataset` 는 여러 걸음을 보지만 **값을 내지 않는다** — 「연쇄가 이 자료 밖으로 이어지는가」만
 *     가려, 쪽이 광자 판정의 주어를 그 핵종 자신으로 한정하게 한다(Th-232).
 */

type N = { z: number; a: number; sym: string; decay: string; t_half_s: number;
           gamma_const: number; beta_max_keV?: number };
const T = NUCLIDES as unknown as Record<string, N>;
const SYM: Record<number, string> = {};
for (const v of Object.values(T)) SYM[v.z] = v.sym;

/** 딸이 다 자랐다고 볼 수 있는 반감기 위 경계 — 이보다 짧으면 몇 달 안에 평형이다. */
const INGROWTH_FAST_S = 30 * 24 * 3600;
/** 평형이 서려면 모핵종이 훨씬 길어야 한다. */
const EQUILIBRIUM_RATIO = 10;
/** 「딸이 더 세다」의 문턱 — 이보다 작은 차이는 결론을 바꾸지 않는다. */
const HOTTER = 1.3;
/** ★★ **절대 하한이 없으면 0 과의 비교가 아무거나 통과시킨다**(2026-09-23, 조립된 문장을
 *  읽다 잡았다). 모핵종이 알파 방출체면 베타가 0 이라 **어떤 베타든 「1.3배 위」**가 되어,
 *  Pa-231 쪽이 「Ac-227 이 **0.0448 MeV** 베타를 들여온다」고 적고 있었다 — 45 keV 는 선원의
 *  피복도 못 나가므로 **차폐 결론을 바꾸지 않는다.** 이 모듈의 존재 이유가 「결론을 바꾸는
 *  경우만 고른다」이므로 하한이 곧 정의의 일부다.
 *  · 베타 300 keV — 아크릴 0.7 mm 아래는 어떤 용기로도 멈춘다.
 *  · 감마 0.01 mGy·m²/(GBq·h) — Cs-137 의 8분의 1. 그 아래는 별도 차폐를 부르지 않는다. */
const BETA_FLOOR_KEV = 300;
const GAMMA_FLOOR = 0.01;

/** 붕괴 방식에서 딸핵종의 (Z, A) 를 낸다. 모르는 방식이면 `null`. */
function daughterZA(n: N): [number, number] | null {
  const m = n.decay.toUpperCase();
  if (m.startsWith("B-")) return [n.z + 1, n.a];
  if (m.startsWith("B+") || m.startsWith("EC")) return [n.z - 1, n.a];
  if (m.startsWith("A")) return [n.z - 2, n.a - 4];
  if (m.startsWith("IT")) return [n.z, n.a];
  return null;
}

/** 그 (Z, A) 가 **우리 자료 안에** 있으면 그 키. 바닥상태를 먼저 보고 준안정을 뒤에 본다. */
export function daughterOf(key: string): string | null {
  const n = T[key];
  if (!n) return null;
  const za = daughterZA(n);
  if (!za) return null;
  const s = SYM[za[0]];
  if (!s) return null;
  for (const c of [`${s}-${za[1]}`, `${s}-${za[1]}m`, `${s}-${za[1]}m1`])
    if (T[c] && c !== key) return c;
  return null;
}

/**
 * 딸핵종의 **이름**만 낸다 — 자료에 있든 없든. 신원은 산술이라 자료를 안 타기 때문이다.
 * ★★ 이것이 필요한 이유(2026-09-23, 두 번째 결함): Ra-226 쪽이 「air kerma rate constant is
 *   **small** — 88× less than Cs-137 … 22.8 GBq 라야 20 µSv/h」라고 적고 있었다. 그 값은
 *   **Ra-226 자신의 것**이고, 라듐 선원의 광자장은 거의 전부 **자손**에서 나온다.
 *   그런데 Rn-222·Pb-214·Bi-214 는 **이 자료에 없다.**
 * ★★★ Ru-106 때와 다른 점: **맞는 숫자를 우리가 만들 수 없다.** 그러면 고치는 길은
 *   값을 지어내는 것이 아니라 **주장을 거두는 것**이다 — 「이 자료에 그 다음이 없다」는
 *   우리 자료에 대한 진술이라 물리를 기억으로 쓰지 않아도 참이다.
 * ★ **알파 붕괴로 좁힌다.** 베타 붕괴에서 딸이 자료에 없는 것은 대개 **안정 핵종**이라
 *   (Co-60 → Ni-60) 「연쇄가 이어진다」고 말하면 그쪽이 거짓이 된다. 안정 여부를 우리
 *   자료로는 알 수 없으므로, 알 수 없는 것에 대해서는 말하지 않는다.
 */
export function daughterLabel(key: string): string | null {
  const n = T[key];
  if (!n) return null;
  const za = daughterZA(n);
  if (!za) return null;
  const s = SYM[za[0]];
  return s ? `${s}-${za[1]}` : null;
}

/** 알파 붕괴인데 **다음 핵종이 이 자료에 없어** 광자 수치가 그 핵종 자신의 것뿐인 쪽. */
export const CHAIN_TRUNCATED = Object.keys(T).filter((k) => {
  const n = T[k];
  return String(n.decay).toUpperCase().startsWith("A") && n.gamma_const > 0 && !daughterOf(k);
});

/** 연쇄를 여러 걸음 따라가도 되는 한계 — 사이트가 시설 계획의 눈금으로 쓰는 「forty years」(`horizons` · 붕괴 캡션). */
const WORKING_HORIZON_S = 40 * 31557600;
/** 안정 핵종이 하나도 없는 원자번호의 아래 끝 — 비스무트(83) 위로는 모든 핵종이 방사성이다. 그래서 이 자료에 없는 딸이라도
 *  Z 가 이 값 이상이면 「연쇄가 거기서 이어진다」는 것이 산술로 참이다(베타 딸을 「대개 안정」으로 본 `daughterLabel` 의 단서를 넘는 근거). */
const NO_STABLE_FROM_Z = 84;

/**
 * ★★ T13 — **연쇄를 여러 걸음 본다.** `dominantProgeny` 는 한 걸음만 보아 Th-232 를 놓쳤다: 딸 Ra-228 은 이 자료에 있지만
 *   Γ 가 0 이고 베타도 무르다(어느 문턱에도 안 걸린다). 토륨 선원의 광자장을 정하는 Ac-228 · Tl-208 은 **그 아래**에 있고
 *   이 자료에 없다. 그런데 Th-232 쪽은 자기 광자만으로 「Shielding barely arises」라고 판정하고 있었다(그 쪽 손글은 반대로 말한다).
 * ★ 판단은 산술뿐이다 — 이 자료에 실린 딸을 따라 내려가되, 그 딸이 **작업 눈금(40년) 안에 자라고**(반감기 ≤ 40년) 머리 핵종과
 *   평형을 이룰 만큼 짧으면(머리 반감기의 1/10 아래) 한 걸음 더 간다. 실린 딸이 끝나는 자리에서 **다음 딸이 이 자료에 없고
 *   Z ≥ 84** 면 참이다(연쇄가 이 자료 밖으로 이어진다).
 *   · 걸리는 쪽: Th-232(→ Ra-228 → Ac-228) · Ra-228(→ Ac-228) · Np-237(→ Pa-233) · Am-243(→ Np-239) · Ra-224(→ Rn-220) · Cf-252,
 *     그리고 이미 `CHAIN_TRUNCATED` 인 넷(그 쪽은 그 갈래가 먼저 든다).
 *   · 걸리지 않는 것: U-234 · Pu-238 · Pu-240 · Cm-244 · U-233 — 다음 실린 딸이 길어(수천 ~ 수십만 년) 작업 눈금 안에 안 자란다.
 * ★ **값을 지어내지 않는다** — 얼마나 세지는지는 말하지 않는다. 쓰는 곳은 「이 쪽의 광자 판정이 그 핵종 자신의 것」이라고
 *   주어를 한정하는 데뿐이다(`nuclide-prose`). `CHAIN_TRUNCATED` 처럼 순위 · 수치를 거두지는 않는다.
 */
/*  ★ 실리지 않은 딸의 반감기는 이 자료로 알 수 없다 — 그래서 마지막 걸음은 Z 만 본다. Cf-252(→ Cm-248, 수십만 년)가 그렇게
 *    걸린다. 그 쪽은 자발 핵분열 갈래(`SPONTANEOUS_FISSION`)가 먼저 정하므로 결과는 같다(테스트가 고정한다). */
export function chainLeavesDataset(key: string): boolean {
  const head = T[key];
  if (!head) return false;
  let cur = key;
  for (let step = 0; step < 20; step++) {
    const d = daughterOf(cur);
    /* ★ 딸의 원소기호를 이 자료가 모를 수 있다(라돈은 한 종도 없다 — Ra-224 · Ra-226). Z 는 산술이라 이름 없이도 잰다. */
    if (!d) return (daughterZA(T[cur])?.[0] ?? 0) >= NO_STABLE_FROM_Z;
    const c = T[d];
    if (!(c.t_half_s <= WORKING_HORIZON_S && c.t_half_s < head.t_half_s / EQUILIBRIUM_RATIO)) return false;
    cur = d;
  }
  return false;
}

export type Progeny = {
  key: string;
  /** 손에 쥐는 선원에 **이미 있다**(`present`)인가, 세월이 걸려 **자란다**(`ingrowing`)인가. */
  presence: "present" | "ingrowing";
  /** 딸의 베타 종점이 결론을 바꿀 만큼 높은가. */
  betaHotter: boolean;
  /** 딸의 감마상수가 결론을 바꿀 만큼 높은가(모핵종이 0 이면 딸의 감마는 전부 딸의 것이다). */
  gammaHotter: boolean;
};

/**
 * **차폐 결론을 딸이 정하는 경우**만 돌려준다. 그 외에는 `null` —
 * 147장에 「딸이 있습니다」를 되풀이하면 그것이 곧 틀에 값만 갈아 끼우는 짓이다.
 */
export function dominantProgeny(key: string): Progeny | null {
  const g = daughterOf(key);
  if (!g) return null;
  const p = T[key], c = T[g];
  if (!(c.t_half_s < p.t_half_s / EQUILIBRIUM_RATIO)) return null;

  const pb = p.beta_max_keV ?? 0, cb = c.beta_max_keV ?? 0;
  const betaHotter = cb >= BETA_FLOOR_KEV && cb > pb * HOTTER;
  const gammaHotter = c.gamma_const >= GAMMA_FLOOR &&
    (p.gamma_const === 0 || c.gamma_const > p.gamma_const * HOTTER);
  if (!betaHotter && !gammaHotter) return null;

  return { key: g, presence: c.t_half_s <= INGROWTH_FAST_S ? "present" : "ingrowing",
           betaHotter, gammaHotter };
}

/** 낱장·게이트가 함께 읽는 목록 — 두 곳이 **같은 판단**을 보게 한다. */
export const WITH_DOMINANT_PROGENY = Object.keys(T)
  .map((k) => [k, dominantProgeny(k)] as const)
  .filter((x): x is readonly [string, Progeny] => x[1] !== null);
