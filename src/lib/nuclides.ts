import nuclides from "../data/nuclides.json";
import attenuation from "../data/attenuation.json";
import type { NuclideMap, Nuclide, Material } from "../engine/types";
import type { Row } from "../engine/interp";
import { emissionKinds } from "../engine/types";
import {
  gammaConstant, pointSourceDoseRate, DELTA_DEFAULT_KEV, BQ_PER_CI,
  betaRange, betaRangeCm, bremsstrahlungYield, DENSITY_G_CM3, elapsedFromRatio, decayActivity,
} from "../engine";
import { lineShares, meanPhotonEnergyKeV, spectrumHVL, spectrumTVL, spectrumLayer, type LineShare } from "../engine/spectrum";

export const NUCLIDES = nuclides as unknown as NuclideMap;
export const ATTEN = attenuation as unknown as Record<Material, Row[]>;

/** ★ 원소 이름은 **미국 철자**로 쓴다 — 엔진의 물질 이름이 이미 `aluminum` 이다.
 *  같은 사이트 안에서 철자 체계를 섞으면 검색·본문이 따로 논다. */
const ELEMENT: Record<string, string> = {
  Ac: "Actinium", Am: "Americium", Ar: "Argon", Au: "Gold", Ba: "Barium", Bi: "Bismuth",
  C: "Carbon", Ca: "Calcium", Cd: "Cadmium", Ce: "Cerium", Cf: "Californium", Cl: "Chlorine",
  Cm: "Curium", Co: "Cobalt", Cr: "Chromium", Cs: "Cesium", Eu: "Europium", F: "Fluorine",
  Fe: "Iron", Ga: "Gallium", Gd: "Gadolinium", Ge: "Germanium", H: "Hydrogen", Hg: "Mercury",
  Ho: "Holmium", I: "Iodine", In: "Indium", Ir: "Iridium", K: "Potassium", Kr: "Krypton",
  Lu: "Lutetium", Mn: "Manganese", Mo: "Molybdenum", Na: "Sodium", Nb: "Niobium", Ni: "Nickel",
  Np: "Neptunium", P: "Phosphorus", Pa: "Protactinium", Pb: "Lead", Pm: "Promethium",
  Po: "Polonium", Pr: "Praseodymium", Pu: "Plutonium", Ra: "Radium", Re: "Rhenium",
  Rh: "Rhodium", Ru: "Ruthenium", S: "Sulfur", Sb: "Antimony", Sc: "Scandium", Se: "Selenium",
  Si: "Silicon", Sm: "Samarium", Sn: "Tin", Sr: "Strontium", Ta: "Tantalum", Tc: "Technetium",
  Th: "Thorium", Tl: "Thallium", U: "Uranium", Xe: "Xenon", Y: "Yttrium", Zn: "Zinc", Zr: "Zirconium",
};

export const elementName = (sym: string) => ELEMENT[sym] ?? sym;
export const slugOf = (key: string) => key.toLowerCase();
export const keyOfSlug = (slug: string) =>
  Object.keys(NUCLIDES).find((k) => slugOf(k) === slug.toLowerCase());

/** 사람이 부르는 이름. ★ H-3 은 **Tritium** 이 정본이다 — 「Hydrogen-3」으로 찾는 사람은 없다. */
export function longName(key: string): string {
  const n = NUCLIDES[key];
  if (key === "H-3") return "Tritium";
  /* ★ 이성질체 표기는 **소문자 m** 이다 — `Tc-99m` 이지 `Tc-99M` 이 아니다. */
  return `${elementName(n.sym)}-${n.a}${n.iso ?? ""}`;
}

const DECAY_WORD: Record<string, string> = {
  "B-": "beta-minus decay", "B+": "beta-plus decay", "EC": "electron capture",
  "EC+B+": "electron capture with beta-plus", "A": "alpha decay", "IT": "isomeric transition",
  "SF": "spontaneous fission", "B-+N": "beta-minus with delayed neutron",
};
export const decayWord = (d: string | null) => (d && DECAY_WORD[d]) || (d ?? "not recorded");

/** 반감기를 사람이 읽는 한 줄로. 데이터의 `hl`·`hl_unit` 은 IAEA 표기 그대로다. */
const UNIT_WORD: Record<string, string> = {
  s: "seconds", m: "minutes", h: "hours", d: "days", Y: "years", ms: "milliseconds", us: "microseconds",
};
/** ★ 자료의 `hl` 은 IAEA 표기 그대로라 `9.94E+4` 같은 꼴이 섞여 있다 — 화면에 그대로 내면
 *  「9.94E+4 years」가 된다. 지수는 사람이 읽는 꼴로 바꾼다. */
export function halfLifeText(n: Nuclide): string {
  const unit = UNIT_WORD[n.hl_unit] ?? n.hl_unit;
  const m = /^([\d.]+)[eE]\+?(-?\d+)$/.exec(n.hl);
  if (!m) return `${n.hl} ${unit}`;
  const exp = Number(m[2]);
  const sup = String(exp).replace(/-/g, "\u2212").replace(/\d/g, (d) => "\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079"[Number(d)]);
  return `${m[1]} \u00d7 10${sup} ${unit}`;
}

export const MATERIALS: Material[] = ["lead", "tungsten", "iron", "copper", "concrete", "water", "aluminum"];

export interface ShieldRow { material: Material; hvlCm: number; tvlCm: number; ratio: number }

export interface NuclidePage {
  key: string; slug: string; name: string; n: Nuclide;
  kinds: ReturnType<typeof emissionKinds>;
  /** 공기커마율상수 [mGy·m²/(GBq·h)] · δ=20 keV — 표에서 베끼지 않고 선에서 계산한다 */
  gamma: number;
  doseAt1mPerGBq: number;         // mGy/h
  doseAt1mPerCi: number;          // mGy/h
  shares: LineShare[];
  meanPhotonKeV: number;
  /** 커마의 90% 를 만드는 데 필요한 선의 개수 — 「몇 개만 보면 되는가」 */
  linesFor90: number;
  shields: ShieldRow[];
  /** 빔 경화가 심해 「반가층 하나」로 말하면 안 되는 핵종인가 (TVL/HVL 이 단일선 3.32 보다 훨씬 큼) */
  hardens: boolean;
  betaMaxMeV: number | null;
  betaRanges: { material: string; cm: number }[];
  bremsLow: number; bremsLead: number;    // 제동복사 수율 (아크릴 Z≈6 대 납 Z=82)
  decayPoints: { label: string; frac: number }[];
  timeTo: { label: string; text: string }[];
  saCiPerG: number;
}

export const fmtTime = (s: number): string => {
  if (!Number.isFinite(s) || s <= 0) return "—";
  const y = s / 31557600;
  /* ★ 눈금이 「million years」에서 멈춰 Sm-147 이 「1.56e+3 million years」가 됐다
     (2026-09-20). 질량·활동도에서 이미 두 번 밟은 것과 같은 함정 —
     **눈금마다 위 경계를 준다.** */
  if (y >= 1e12) return `${(y / 1e12).toPrecision(3)} trillion years`;
  if (y >= 1e9) return `${(y / 1e9).toPrecision(3)} billion years`;
  if (y >= 1e6) return `${(y / 1e6).toPrecision(3)} million years`;
  /* ★ toPrecision(3) 은 1000 을 넘으면 지수로 떨어진다 — 「4.33e+3 years」가 그것이다.
     1000~10⁶ 년은 자릿점을 찍는다(아래 일·시·분 가지는 y < 1 일 때만 도므로 안 걸린다). */
  if (y >= 1000) return `${Math.round(y).toLocaleString("en-US")} years`;
  if (y >= 1) return `${y.toPrecision(3)} years`;
  const d = s / 86400;
  if (d >= 1) return `${d.toPrecision(3)} days`;
  const h = s / 3600;
  if (h >= 1) return `${h.toPrecision(3)} hours`;
  const m = s / 60;
  if (m >= 1) return `${m.toPrecision(3)} minutes`;
  return `${s.toPrecision(3)} seconds`;
};

export function nuclidePage(key: string): NuclidePage {
  const n = NUCLIDES[key];
  const kinds = emissionKinds(n);
  const gamma = gammaConstant(n, ATTEN.air, DELTA_DEFAULT_KEV);
  const shares = n.lines.length ? lineShares(n.lines, ATTEN.air, DELTA_DEFAULT_KEV) : [];

  let acc = 0, linesFor90 = 0;
  for (const s of shares) { acc += s.share; linesFor90++; if (acc >= 0.9) break; }

  const shields: ShieldRow[] = gamma > 0 ? MATERIALS.map((m) => {
    const hvlCm = spectrumHVL(n.lines, ATTEN.air, ATTEN[m], m);
    const tvlCm = spectrumTVL(n.lines, ATTEN.air, ATTEN[m], m);
    return { material: m, hvlCm, tvlCm, ratio: tvlCm / hvlCm };
  }) : [];
  const SINGLE = Math.log(10) / Math.log(2);            // 3.3219 — 단일선의 TVL/HVL
  const hardens = shields.some((s) => Number.isFinite(s.ratio) && s.ratio > SINGLE * 1.25);

  const betaMaxMeV = n.beta_max_keV ? n.beta_max_keV / 1000 : null;
  const betaRanges = betaMaxMeV
    ? [["acrylic", 1.18], ["aluminum", DENSITY_G_CM3.aluminum], ["water", 1.0], ["glass", 2.5]]
        .map(([material, rho]) => ({ material: material as string, cm: betaRangeCm(betaMaxMeV, rho as number) }))
    : [];

  /* 붕괴 표의 시점은 **반감기에 맞춘다** — 8일짜리 핵종에 100년 칸을 두면 전부 0 이다. */
  const T = n.t_half_s;
  const pts: [string, number][] = [[`1 half-life`, T], [`2 half-lives`, 2 * T], [`5 half-lives`, 5 * T], [`10 half-lives`, 10 * T]];
  const decayPoints = pts.map(([label, t]) => ({ label, frac: decayActivity(1, T, t) }));

  return {
    key, slug: slugOf(key), name: longName(key), n, kinds, gamma,
    doseAt1mPerGBq: pointSourceDoseRate(gamma, 1, 1),
    doseAt1mPerCi: pointSourceDoseRate(gamma, BQ_PER_CI / 1e9, 1),
    shares, meanPhotonKeV: shares.length ? meanPhotonEnergyKeV(n.lines, ATTEN.air, DELTA_DEFAULT_KEV) : NaN,
    linesFor90, shields, hardens, betaMaxMeV, betaRanges,
    bremsLow: betaMaxMeV ? bremsstrahlungYield(6, betaMaxMeV) : NaN,
    bremsLead: betaMaxMeV ? bremsstrahlungYield(82, betaMaxMeV) : NaN,
    decayPoints,
    timeTo: [
      { label: "10 % of today's activity", text: fmtTime(elapsedFromRatio(0.1, T)) },
      { label: "1 %", text: fmtTime(elapsedFromRatio(0.01, T)) },
      { label: "0.1 %", text: fmtTime(elapsedFromRatio(0.001, T)) },
    ],
    saCiPerG: n.sa_bq_g / BQ_PER_CI,
  };
}


/* ── 그 핵종을 **147종 안에서** 자리매김하는 값들 ─────────────────────────
   ★ 낱장 147장에서 되풀이되는 설명을 걷어내고 나면, 남아야 하는 것은 **그 핵종에서만
     나오는 숫자**다. 순위·배수·목표두께는 전부 데이터에서 나오고 핵종마다 다르다. */

const GAMMA_KEYS = Object.keys(NUCLIDES).filter((k) => NUCLIDES[k].gamma_const > 0);
const GAMMA_SORTED = [...GAMMA_KEYS].sort((a, b) => NUCLIDES[b].gamma_const - NUCLIDES[a].gamma_const);

/** Γ 순위 — 「이 핵종은 센 편인가」. 공개 표에는 없는 값이다(표는 순서가 없다). */
export const gammaRank = (key: string) =>
  ({ rank: GAMMA_SORTED.indexOf(key) + 1, of: GAMMA_SORTED.length });

/** 기준 핵종 대비 배수 — 실무자가 머리에 든 값(Co-60·Cs-137)에 걸어 준다. */
export const gammaVs = (key: string, ref: "Co-60" | "Cs-137") =>
  NUCLIDES[key].gamma_const / NUCLIDES[ref].gamma_const;

/** 1 GBq 를 1 m 에서 목표 선량률까지 낮추는 납 두께 [cm] — 스펙트럼으로 푼다.
 *  ★ 목표가 이미 만족되면 NaN 이 아니라 0 을 돌려준다(「차폐가 필요 없다」는 답이다). */
export function leadForTarget(key: string, targetMSvPerH: number): number {
  const n = NUCLIDES[key];
  const bare = gammaConstant(n, ATTEN.air, DELTA_DEFAULT_KEV);   // mGy/h @1GBq,1m
  if (!(bare > 0)) return NaN;
  if (bare <= targetMSvPerH) return 0;
  return spectrumLayer(n.lines, ATTEN.air, ATTEN.lead, "lead", targetMSvPerH / bare, DELTA_DEFAULT_KEV);
}

/** 보관 기간 뒤 남는 비율. */
export const remainingAfterYears = (key: string, years: number) =>
  decayActivity(1, NUCLIDES[key].t_half_s, years * 31557600);

/** ★ 시간 눈금을 **반감기에 맞춘다.** 6시간짜리 핵종에 「40년 뒤」를 말하면 답이 늘 0 이고,
 *  10만년짜리에 「1년 뒤」를 말하면 답이 늘 100% 다 — 둘 다 아무것도 알려 주지 않는다. */
export function horizons(key: string): { label: string; frac: number }[] {
  const T = NUCLIDES[key].t_half_s, D = 86400, Y = 31557600;
  const pick: [string, number][] =
    T < D        ? [["a day", D], ["a week", 7 * D]]
    : T < 30 * D ? [["a week", 7 * D], ["three months", 91 * D]]
    : T < Y      ? [["a month", 30 * D], ["a year", Y]]
    : T < 100 * Y ? [["a year", Y], ["forty years", 40 * Y]]
    : [["forty years", 40 * Y], ["ten thousand years", 1e4 * Y]];
  return pick.map(([label, t]) => ({ label, frac: decayActivity(1, T, t) }));
}

/** 종점 베타가 **어느 가지에서 나오는가** — 세기가 0.12% 인 가지의 종점으로 비정을 말하면서
 *  그 사실을 안 밝히면, 읽는 사람은 그 에너지가 대표값인 줄 안다(Co-60 이 정확히 그렇다). */
export function betaEndpointBranch(key: string): { maxKeV: number; iPct: number } | null {
  const b = NUCLIDES[key].beta;
  if (!b?.length) return null;
  const withMax = b.filter((x) => x.max != null) as { max: number; i: number }[];
  if (!withMax.length) return null;
  const top = withMax.reduce((a, x) => (x.max > a.max ? x : a));
  return { maxKeV: top.max, iPct: top.i };
}

/** 가장 **센** 베타 가지(세기 기준) — 실무에서 대표로 드는 값이다. */
export function betaDominantBranch(key: string): { maxKeV: number | null; iPct: number } | null {
  const b = NUCLIDES[key].beta;
  if (!b?.length) return null;
  const top = b.reduce((a, x) => (x.i > a.i ? x : a));
  return { maxKeV: top.max, iPct: top.i };
}

/** δ=20 keV 에서 **잘려 나간 선** — Γ 주의문을 그 핵종의 숫자로 쓰기 위한 값이다.
 *  ★ 「컷오프를 낮추면 답이 크게 바뀔 수 있다」를 147번 되풀이하는 대신,
 *    **이 핵종에서 실제로 몇 개가 얼마만큼 잘렸는지**를 말한다. 잘린 것이 없는 쪽에서는
 *    그 문장 자체가 사라진다 — 없는 위험을 경고하지 않는다. */
export function belowCutoff(key: string): { count: number; iPct: number; topKeV: number } | null {
  const cut = NUCLIDES[key].lines.filter(([e]) => e < DELTA_DEFAULT_KEV);
  if (!cut.length) return null;
  return {
    count: cut.length,
    iPct: cut.reduce((a, [, i]) => a + i, 0),
    topKeV: Math.max(...cut.map(([e]) => e)),
  };
}

/** ★★ 낱장 어수 하한(`check-output` ⑥ · 250어)을 **되풀이 문장으로 채우고 있었다**
 *  (2026-09-20 에 드러났다 — 되풀이를 걷어내자 18장이 하한 아래로 떨어졌다).
 *  **되풀이로 채운 분량은 분량이 아니다.** 하한을 내리는 대신, 그 쪽들이 **쓰지 않고 있던
 *  자기 자료**로 채운다. 아래 값은 전부 산술이고 핵종마다 자릿수가 다르다.
 *  ★ 자릿수가 모든 핵종에서 **같은 값**은 쓰지 않는다 — 평균수명/반감기 = 1.44 처럼
 *    147장에서 똑같은 비를 찍는 것이 정확히 「틀에 값만 갈아 끼우는」 짓이다
 *    (`nuclide-prose.ts` 가 82/6 에서 이미 세운 규칙). */
export const tenHalfLives = (key: string) => fmtTime(10 * NUCLIDES[key].t_half_s);
export const meanLife = (key: string) => fmtTime(NUCLIDES[key].t_half_s / Math.LN2);

/** 알파 스펙트럼의 폭 — 기록된 선의 범위와 으뜸선의 몫. */
export function alphaSpread(key: string) {
  const a = NUCLIDES[key].alpha;
  if (!a?.length) return null;
  const e = a.map(([x]) => x), tot = a.reduce((s, [, i]) => s + i, 0);
  const top = a.reduce((x, y) => (y[1] > x[1] ? y : x));
  return { count: a.length, loMeV: Math.min(...e) / 1000, hiMeV: Math.max(...e) / 1000,
           topMeV: top[0] / 1000, topPct: top[1], totPct: tot };
}

/** 기록된 광자선 전체의 범위와 세기 합 — 컷오프 아래만 있는 핵종의 낱장이 쓴다. */
export function lineSpan(key: string) {
  const l = NUCLIDES[key].lines;
  if (!l.length) return null;
  const e = l.map(([x]) => x);
  return { count: l.length, loKeV: Math.min(...e), hiKeV: Math.max(...e),
           totPct: l.reduce((s, [, i]) => s + i, 0) };
}

/** 목록 — 원소기호, 그 다음 질량수 순. 「Co-60 다음에 Co-60m」이 자연스럽다. */
export const ALL_KEYS = Object.keys(NUCLIDES).sort((a, b) => {
  const x = NUCLIDES[a], y = NUCLIDES[b];
  return x.sym === y.sym ? x.a - y.a || a.localeCompare(b) : x.sym.localeCompare(y.sym);
});
export { betaRange, emissionKinds };
