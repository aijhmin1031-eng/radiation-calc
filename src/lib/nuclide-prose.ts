import type { NuclidePage } from "./nuclides";
import { NUCLIDES, nuclidePage, gammaOf } from "./nuclides";
import { dominantProgeny, daughterOf, daughterLabel, CHAIN_TRUNCATED, chainLeavesDataset } from "./decay-chain";
import { decayProse, SPONTANEOUS_FISSION, SF_INTAKE_GOVERNS, halfLifeText, gammaRank, gammaVs, leadForTarget, horizons,
         betaEndpointBranch, betaDominantBranch, lineSpan, alphaSpread,
         tenHalfLives, meanLife, remainingAfterYears, fmtTime } from "./nuclides";
import { elapsedFromRatio } from "../engine";

/** 낱장 147장의 **문장**을 데이터에서 만든다.
 *
 *  ★★ 여기가 이 작업의 가장 위험한 자리다. 147장을 **틀에 값만 갈아 끼운 글**로 찍으면
 *    이웃 lab 이 애드센스에서 실제로 밟은 실패(장 제목이 글자까지 같고 본문만 달랐다)를
 *    그대로 되풀이한다.
 *  ★★ **첫 판이 실제로 그랬다**(2026-09-16 실측). 낱장 사이 5-그램 겹침이 **중앙 20.8%**
 *    였고 원인이 분명했다 — 「narrow beam 이란 무엇인가」·「왜 저Z 로 막는가」 같은 **설명을
 *    147번 되풀이**하고 있었다. 설명은 성질상 모든 쪽에서 같으므로 쪽마다 두면 안 된다.
 *  ★ 그래서 규칙을 세운다: **이 파일의 문장은 「이 핵종의 숫자」와 「그 숫자에서 나오는
 *    판단」만 담는다.** 일반론은 `/methods/` 한 곳에 두고 링크한다. 표 아래 한 줄짜리
 *    설명(캡션)은 쪽의 UI 이지 본문이 아니므로 거기 남는다.
 *  ★ 없는 것을 있다고 쓰지 않는다 — 자료에 선이 없으면 「없다」가 아니라
 *    **「이 자료에 기록이 없다」**고 쓴다(임계 아래 방출이 실제로 있을 수 있다).
 */
const mm = (cm: number, d = 3) => `${(cm * 10).toPrecision(d)} mm`;
const sig = (x: number, d = 3) => (Number.isFinite(x) ? x.toPrecision(d) : "—");
/** ★ `toPrecision` 은 1000 부터 **지수 표기**로 넘어가 「7.0e+2× the thickness above」가 된다
 *  (2026-09-23 조립된 문장을 읽다 잡았다 — 빌드도 게이트도 통과한다). 문장에 들어가는 배수는
 *  유효숫자 둘로 반올림하되 **늘 고정 표기**로 쓴다. */
const ratioText = (r: number) => {
  const p = Math.pow(10, Math.max(0, 1 - Math.floor(Math.log10(r))));
  return `${(Math.round(r * p) / p).toLocaleString("en-US")}×`;
};
/* ★ 5% 안은 「about the same as」(2026-10-29) — Kβ 이중 계산을 고치자 In-111 의 Γ 가 Cs-137 의 0.996 배가 되어
 *   「1.0× less than Cs-137」이라는, 말이 안 되는 문장이 섰다(그전에는 1.046 배라 「1.0× Cs-137」).
 * ★ 유효숫자 둘은 지키되 **고정 표기**로 쓴다(T12 2-9) — `toPrecision(2)` 는 100 부터 지수로 넘어가 Pu-239 가
 *   「9.6e+3× less than Cs-137」이 됐다. 위 `ratioText` 와 같은 규칙이다(100 아래는 글자까지 그대로다). */
const fixed2 = (v: number) => { const t = v.toPrecision(2); return Number(t) >= 100 ? Number(t).toLocaleString("en-US") : t; };
const times = (r: number) => (r < 1.05 && r > 1 / 1.05 ? "about the same as"
  : r >= 1 ? `${fixed2(r)}×` : `${fixed2(1 / r)}× less than`);
/* ★ T13 — Γ 순위 판정을 순위 값과 맞춘다. 그전에는 Γ < 0.005 띠 전부가 「near the bottom」이었다 — 96위 중 96위인 Pm-147 도,
 *   76위인 Cr-51 도. 맨 끝은 맨 끝이라고 쓰고, 「near」는 아래 10분의 1 안에만 쓴다(`check-progeny` 가 이 낱말들을 함께 잰다). */
const bottomOf = (rank: number, of: number) =>
  rank === of ? "the lowest of the photon emitters"
  : of - rank < of / 10 ? "near the bottom of the photon emitters"
  : rank > 0.75 * of ? "in the bottom quarter of the photon emitters"
  : `with ${of - rank} photon emitters below it`;
/** ★ 질량은 자리수가 24자리를 넘나든다(Tc-99m 의 5 pg 대 Ca-41 의 0.3 g) — 고정 소수점으로
 *  쓰면 `0.0000239 g`, 단위 고르기를 잘못하면 `2.39e+4 ng` 가 된다. **눈금마다 위 경계를 준다.** */
const mass = (g: number) => {
  if (!Number.isFinite(g) || g <= 0) return "—";
  const S: [number, string, number][] = [
    /* ★ pg 아래로 내려가는 핵종이 있다(U-238m 의 1 GBq 는 0.160 fg). 눈금을 더 준다. */
    [1e-15, "ag", 1e18], [1e-12, "fg", 1e15],
    [1e-9, "pg", 1e12], [1e-6, "ng", 1e9], [1e-3, "µg", 1e6], [1, "mg", 1e3], [1e3, "g", 1],
  ];
  for (const [hi, unit, k] of S) if (g < hi) return `${(g * k).toPrecision(3)} ${unit}`;
  /* ★ kg 에서 멈추면 Sm-147 이 「1.19e+3 kg」이 된다 — 눈금을 하나 더 준다. */
  return g < 1e6 ? `${(g / 1e3).toPrecision(3)} kg` : `${(g / 1e6).toPrecision(3)} t`;
};
/** 활동도 — ★ `mass()` 와 같은 규칙이다(눈금마다 위 경계를 준다). 고정 단위로 쓰면
 *  「2.43e+3 GBq」·「6.54e+4 kBq」가 나온다(2026-09-20 실측으로 잡았다 — 빌드도 게이트도
 *  통과했고 화면의 글을 읽어야만 보였다. 질량에서 이미 밟은 함정을 활동도에서 되풀이했다). */
const act = (bq: number) => {
  if (!Number.isFinite(bq) || bq <= 0) return "—";
  const S: [number, string, number][] = [
    [1e3, "Bq", 1], [1e6, "kBq", 1e-3], [1e9, "MBq", 1e-6], [1e12, "GBq", 1e-9], [1e15, "TBq", 1e-12],
  ];
  for (const [hi, unit, k] of S) if (bq < hi) return `${(bq * k).toPrecision(3)} ${unit}`;
  return `${(bq / 1e15).toPrecision(3)} PBq`;
};
/** ★ 0.00% 는 아무것도 알려 주지 않는다 — 아주 작아지면 지수로 바꾼다. */
const frac = (x: number) => (x >= 1e-4 ? `${(x * 100).toFixed(2)}%` : x > 0 ? `${(x * 100).toExponential(1)}%` : "0%");

export function paragraphs(p: NuclidePage): string[] {
  const out: string[] = [];
  const { n } = p;

  /** ★★ 첫 문단이 **147장 전부에서 같은 틀**이었다 — 「… decays by … with a half-life of … /
   *  A gram of it holds … / After … of today's activity is left, and after …」. 숫자를 빼고 재면
   *  그대로 드러난다(2026-09-20 실측: 이 틀 하나가 절반 이상에 나오는 5어절 8개를 냈다).
   *  ★ 띠는 **비방사능** [1e9 · 1e12 · 1e14 · 1e16] Bq/g 에서 **17·18·25·40·47장**(절반 74).
   *    눈금마다 실무에서 다른 것이 문제가 된다 — 저울로 달 수 있는 물질인가, 아니면 활동도
   *    말고는 「얼마나 있는가」를 말할 길이 없는가.
   *  ★ 숫자는 그대로 전부 들어 있다(Bq/g · Ci/g · 1 GBq 의 질량 · 시평 둘). */
  {
    const h = horizons(p.key);
    const sa = n.sa_bq_g, ci = sig(p.saCiPerG), bq = sig(sa), g1 = mass(1e9 / sa);
    const mode = decayProse(n), T = halfLifeText(n);
    out.push(
      sa < 1e9
        /* ★ 이 띠에서는 시평 둘이 **모두 100.00%** 로 찍혀 문장이 아무것도 안 알려 줬다
             (U-238: 「100.00% after forty years — 100.00% after ten thousand years」).
             ★ **같은 값이 두 번 나오면 그 문장에는 값이 없다.** 실제로 변하는 값 — 1% 를
               잃는 데 걸리는 시간 — 으로 바꾼다. 핵종마다 자릿수가 다르다. */
        ? `${p.name} (${p.key}) is slow enough to be handled as a material rather than as a trace: ` +
          `${bq} Bq/g, or ${ci} Ci/g, puts a gigabecquerel at ${g1}. Decay is by ${mode}, half-life ${T}, ` +
          `and shedding even one per cent of the activity takes ${fmtTime(elapsedFromRatio(0.99, n.t_half_s))}.`
        : sa < 1e12
        ? `A gigabecquerel of ${p.key} is ${g1} of material, which follows from a specific activity of ` +
          `${bq} Bq/g (${ci} Ci/g). ${p.name} decays by ${mode} with a half-life of ${T}; ${h[0].label} leaves ` +
          `${frac(h[0].frac)} of today's activity and ${h[1].label} leaves ${frac(h[1].frac)}.`
        : sa < 1e14
        ? `${p.name} decays by ${mode}, half-life ${T}. Specific activity is ${bq} Bq/g (${ci} Ci/g), so a ` +
          `gigabecquerel comes to ${g1} — weighable, but on an analytical balance. Over ${h[0].label} the ` +
          `activity falls to ${frac(h[0].frac)}, and over ${h[1].label} to ${frac(h[1].frac)}.`
        : sa < 1e16
        ? `At ${bq} Bq/g — ${ci} Ci/g — a gigabecquerel of ${p.key} amounts to ${g1}, which is why activity ` +
          `rather than mass is how anyone states the quantity. ${p.name} decays by ${mode} with a half-life ` +
          `of ${T}, falling to ${frac(h[0].frac)} of today's activity in ${h[0].label} and ${frac(h[1].frac)} in ${h[1].label}.`
        : `${p.name} (${p.key}) carries ${bq} Bq/g, or ${ci} Ci/g: a gigabecquerel is ${g1}, no weighable ` +
          `quantity at all. It decays by ${mode} with a half-life of ${T}, which leaves ${frac(h[0].frac)} ` +
          `of today's activity after ${h[0].label} and ${frac(h[1].frac)} after ${h[1].label}.`,
    );
  }

  /** ★★ T13 — 광자 차폐 판정(「Shielding barely arises」 · 「already under 20 µSv/h with nothing in the way」)의 **주어를 한정하는**
   *  자리다. 판정은 이 쪽 광자선의 것인데, 실제 선원에서 그것이 장 전체가 아닌 쪽이 있다.
   *  · 딸이 더 센 베타를 내는 쪽(Pb-210 → Bi-210, T12) · 연쇄가 이 자료 밖으로 이어지는 쪽(Th-232 → … → Ac-228 · Tl-208,
   *    `chainLeavesDataset`) — 「${key}'s own photons」(딸 · 자손의 광자와 가른다).
   *  · 자발 핵분열 가지가 있는 쪽(Cm-244) — 중성자 · 핵분열 감마가 어떤 수치에도 없다(그 쪽 손글: 용기의 중성자 차폐가 이것으로
   *    정해진다). 「own photons」는 핵분열 감마도 그 핵종의 것이라 맞지 않다 — 「the photons in these figures」로 쓰고, 빠진 것은
   *    limits 절의 SF 줄이 든다.
   *  ★ 연쇄가 잘린 쪽(`CHAIN_TRUNCATED`)은 이보다 앞서 판정 자체를 거둔다 — 아래 `truncated` 갈래. */
  const ownOnly = Boolean(dominantProgeny(p.key)?.betaHotter) || chainLeavesDataset(p.key);
  const sf = Boolean(SPONTANEOUS_FISSION[p.key]);

  if (p.gamma > 0) {
    const top = p.shares[0];
    const r = gammaRank(p.key);
    /** ★★ 같은 틀로 96장 — 「Γ comes out at …, which is …× Cs-137 …, and ranks N of the 96
     *  photon emitters in this dataset」가 **Γ 가 네 자릿수 다른 쪽들에 글자까지 같게** 나갔다.
     *  ★ 띠는 Γ [0.005 · 0.05 · 0.2] mGy·m²/(GBq·h) 에서 **21·34·32·9장**(절반 48).
     *    맨 위 9장은 34장 띠에 붙이지 않고 그대로 둔다 — 21+9 로 묶어도 48 을 안 넘는다.
     *  ★ 숫자는 그대로다 — Γ · 기준 핵종 대비 배수 · 순위 · 1 GBq·1 Ci 의 1 m 선량률. */
    const cmp = ((): string => {
      /* ★ 자기 자신과 비교하지 않는다 — Co-60 쪽에 「1.0× Co-60」이 뜨고 있었다. */
      const refs = (["Cs-137", "Co-60"] as const).filter((k) => k !== p.key);
      return refs.length === 2
        ? `${times(gammaVs(p.key, refs[0]))} ${refs[0]} and ${times(gammaVs(p.key, refs[1]))} ${refs[1]}`
        : `${times(gammaVs(p.key, refs[0]))} ${refs[0]}`;
    })();
    /** ★★ 2026-10-29(T10-②) — 「1 GBq at 1 m reads … mGy/h, and 1 Ci … mGy/h」를 **문장에서 뺐다.** 광자 방출 47쪽에 숫자만
     *  바뀌어 서 있었고, 두 값은 바로 아래 수치표(「Dose rate, 1 GBq at 1 m」·「1 Ci at 1 m」)가 이미 든다 — 표를 산문으로
     *  되풀이한 것이라 쪽의 「다른 쪽에도 있는 틀」 몫만 키웠다(T10-① 실측: 해설 없는 40쪽 중앙 65%). 띠 문장은 표에 **없는**
     *  판단(크기 순위 · 기준 핵종 대비 배수 · 20 µSv/h 에 필요한 활동도)만 남긴다. */
    /** ★★★ **연쇄가 잘린 쪽에는 「작다」·순위·「몇 GBq 라야 20 µSv/h」를 주지 않는다**
     *  (2026-09-23). Ra-226 쪽이 「small — 88× less than Cs-137 … ranking 80 of 96 … 22.8 GBq
     *  라야 20 µSv/h」라고 소개하고 있었다. 그 값은 **Ra-226 자신의 것**이고 라듐 선원의
     *  광자장은 거의 전부 자손의 것인데 Rn-222 이하가 이 자료에 없다.
     *  ★ 뒤에 단서를 붙이는 것으로는 모자란다 — **앞 문장이 이미 판단을 준다.**
     *    순위는 특히 나쁘다: 남들은 상수가 곧 전체 장인데 이 쪽만 아니기 때문이다. */
    out.push(
      CHAIN_TRUNCATED.includes(p.key)
        ? `The air kerma rate constant recorded for ${p.key} is ${sig(p.gamma)} mGy·m²/(GBq·h), and the dose ` +
          `rates in the table are for that emission alone. No ranking against the other emitters here is drawn: ` +
          `for most of them the constant is the whole field, and for ${p.key} it is not.`
        : p.gamma < 0.005
        ? `The air kerma rate constant is small — ${sig(p.gamma)} mGy·m²/(GBq·h), ${cmp}, ` +
          `ranking ${r.rank} of ${r.of} by Γ — ${bottomOf(r.rank, r.of)}, but above the ` +
          `cutoff, which ${Object.keys(NUCLIDES).length - r.of} nuclides in this dataset are not. ` +
          `It takes ${act((0.02 / p.doseAt1mPerGBq) * 1e9)} at a metre to reach 20 µSv/h from ` +
          /* ★ T13 검토 — 이 문장도 같은 판정이다(Th-232 의 763 GBq 는 토륨 약 190 t). 주어를 아래 두 문장과 같게 한정한다. */
          `${ownOnly ? `${p.key}'s own photons` : sf ? `the photons in these figures` : `the photons alone`}.`
        : p.gamma < 0.05
        ? `At ${sig(p.gamma)} mGy·m²/(GBq·h) the air kerma rate constant is ${cmp}, placing it ${r.rank} of ` +
          `${r.of} photon emitters in this dataset.`
        : p.gamma < 0.2
        ? `An air kerma rate constant of ${sig(p.gamma)} mGy·m²/(GBq·h) is ${cmp}, and ` +
          `${r.rank} of ${r.of} among the photon emitters carried here.`
        : `Among the strong external emitters here: Γ of ${sig(p.gamma)} mGy·m²/(GBq·h) ranks ` +
          `${r.rank} of ${r.of}, ${cmp} — a metre-scale hazard at gigabecquerel activities, and ` +
          `${act((0.02 / p.doseAt1mPerGBq) * 1e9)} is already 20 µSv/h at that distance.`,
    );
    /** ★★ 2026-10-29(T10-②) — 「N lines clear the 20 keV cutoff, but M of them carry 90% of the dose rate. The leading one is
     *  … keV at …% of the total — its emission probability is …%, which is also the highest.」가 40쪽에 숫자만 바뀌어 섰다.
     *  선 수 · 맨 윗줄의 에너지 · 몫 · 방출 확률은 아래 방출선 표의 첫 줄과 캡션이 이미 든다 — **뺐다.**
     *  남기는 것은 표를 한 줄씩 읽어서는 안 보이는 **관계** 하나: 선량을 가장 많이 나르는 선이 가장 자주 나오는 선이
     *  **아닐 때**(표의 두 열이 순서를 달리할 때, 실측 6쪽). 선이 하나뿐인 쪽(7쪽)은 그 사실을 한 문장으로 둔다. */
    const outranked = p.shares.length > 1 ? p.shares.slice(1).find((s) => s.yPct > top.yPct) : undefined;
    if (p.shares.length === 1)
      out.push(`One line at ${top.eKeV.toFixed(1)} keV carries the whole of the dose rate.`);
    else if (outranked)
      out.push(
        `The two columns of the line table disagree here: the ${top.eKeV.toFixed(1)} keV line carries the largest share of ` +
        `the dose rate although the ${outranked.eKeV.toFixed(1)} keV line is emitted more often` +
        /* ★ 감독 검토(10-29) — 맨 윗줄이 더 무른 선이면(Xe-133: 31 keV X선이 81 keV 감마보다 선량을 더 나른다 — 이 에너지에서는
           공기가 무른 광자를 훨씬 잘 흡수한다) 「에너지가 차폐를 정한다」는 틀린 말이 된다. 그 꼬리는 더 단단한 선이 앞설 때만 붙인다. */
        (top.eKeV > outranked.eKeV ? ` — energy, not frequency, decides which photons set the shield.` : `.`),
      );

    const pb = p.shields.find((s) => s.material === "lead")!;
    const fe = p.shields.find((s) => s.material === "iron")!;
    const t20 = leadForTarget(p.key, 0.02);
    /** ★★ 같은 틀로 96장을 찍고 있었다 — 「Halving the air kerma rate takes X of lead or Y of
     *  steel」가 **납 반가층 0.12 mm 인 쪽과 30 mm 인 쪽에 글자까지 같게** 나갔다.
     *  그 둘은 같은 공학 문제가 아니다(한쪽은 용기 벽으로 끝나고 한쪽은 납벽돌을 쌓는다).
     *  ★ 실측으로 띠를 갈랐다 — 납 반가층 [0.2 · 1 · 5] mm 에서 **31·18·22·25장**이고
     *    어느 띠도 절반(48장)을 안 넘는다. 넘으면 그 띠가 통째로 되풀이로 세어져 헛일이다.
     *  ★ **숫자는 한 개도 빼지 않는다** — 납 HVL·강 HVL·납 TVL·20 µSv/h 목표두께가 띠마다
     *    다 들어 있다. 띠는 말하는 순서와 무엇을 앞세우는지를 바꾸는 것이지 값을 줄이는 것이
     *    아니다(줄이면 되풀이 대신 빈약이 된다 — `check-output` ⑥ 이 그것을 잡는다). */
    const hvlMm = pb.hvlCm * 10;
    /** ★★★ **연쇄가 잘린 쪽에서는 광자 숫자로 결론을 내지 않는다**(2026-09-23).
     *  U-238 쪽이 「**Shielding barely arises**」·「이미 20 µSv/h 아래」라고 끝맺고 있었다 —
     *  자기 광자만 세면 맞지만 **실제 선원에서 나오는 결론이 아니다.** 두께 값은 그대로 주고
     *  (계산은 맞다) **판단 문장만 거둔다.** 앞 문단의 단서가 왜인지를 든다. */
    const truncated = CHAIN_TRUNCATED.includes(p.key);
    const target = truncated
      ? ``
      : t20 === 0
      /* ★ T12 검토 — 딸이 차폐를 정하는 쪽(Pb-210 → Bi-210)에서는 이 판정이 이 핵종 자신의 광자 이야기임을 밝힌다.
         ★ T13 — 연쇄가 이 자료 밖으로 이어지는 쪽(Th-232) · 자발 핵분열 쪽(Cm-244)도 같다(위 `ownOnly` · `sf`). 자발 핵분열 쪽은
           「photon dose rate」로 중성자와 가른다. */
      /* ★ T14 — 베타가 있는 쪽(Cl-36 · Kr-85 · Re-188 …)도 「photon dose rate」로 한정한다. 「with nothing in the way」가 베타까지
           덮는 말로 읽혔는데, 그 쪽 손글은 베타를 차폐 문제로 말한다(1 m 의 공기는 Re-188 의 2.12 MeV 베타를 멈추지 않는다). */
      ? (ownOnly ? `At 1 GBq and a metre the dose rate from ${p.key}'s own photons is already under 20 µSv/h with nothing in the way.`
        : sf || p.betaMaxMeV ? `At 1 GBq and a metre the photon dose rate is already under 20 µSv/h with nothing in the way.`
        : `At 1 GBq and a metre it is already under 20 µSv/h with nothing in the way.`)
      : `Reaching 20 µSv/h from 1 GBq at a metre takes ${mm(t20)} of lead.`;
    out.push(
      (truncated
        ? `For ${p.key}'s own photons, ${mm(pb.hvlCm)} of lead halves the air kerma rate, ${mm(fe.hvlCm)} ` +
          `if the material is steel, and ${mm(pb.tvlCm)} of lead takes it to a tenth. What thickness the ` +
          `source in front of you needs is a question about its chain, not about this line list.`
        /* ★ T12(2026-10-29) — 「thicknesses a source capsule is likely to exceed on its own」을 뺐다. 캡슐 두께 · 재질은 자료에
             없고(캡슐은 강 · 알루미늄이다) 같은 쪽 강 행과 맞지 않았다(Co-57 · Ce-139). ★ 「barely arises」는 **납 TVL 도
             1 mm 아래**일 때만 쓴다 — Pu-239 는 HVL 0.120 mm 지만 TVL 2.57 mm(TVL/HVL 21)라 1/10 에는 얇지 않다. */
        : hvlMm < 0.2 && pb.tvlCm * 10 < 1
        /* ★ T13 검토 — 주어 「X's own photons」가 한 문단에 세 번 서지 않게, 바로 앞 문장(Γ < 0.005 띠)이 주어를 세웠으면
             「those photons」로, 목표 문장은 「their dose rate」로 받는다. */
        ? (ownOnly || sf
            ? `For ${p.gamma < 0.005 ? `those photons` : ownOnly ? `${p.key}'s own photons` : `the photons in these figures`}, ` +
              `shielding barely arises: `
            : `Shielding barely arises: `) +
          `${mm(pb.hvlCm)} of lead halves the air kerma rate and ${mm(pb.tvlCm)} ` +
          `takes it to a tenth. Steel does the halving in ${mm(fe.hvlCm)}. ` +
          (t20 === 0 && (ownOnly || sf) ? `At 1 GBq and a metre their dose rate is already under 20 µSv/h with nothing in the way.` : target)
        : hvlMm < 1
        ? `A half-value layer of ${mm(pb.hvlCm)} in lead puts this in foil and thin sheet, with ${mm(fe.hvlCm)} ` +
          `needed if the material is steel; ten-fold attenuation comes at ${mm(pb.tvlCm)} of lead. ${target}`
        : hvlMm < 5
        ? `Halving the air kerma rate calls for ${mm(pb.hvlCm)} of lead, or ${mm(fe.hvlCm)} of steel where lead ` +
          `is unwelcome, and a factor of ten calls for ${mm(pb.tvlCm)} of lead — sheet thicknesses that a glovebox ` +
          `or a transport container can carry. ${target}`
        /* ★ T12 — 두께만 보고 「설계해야 하는 차폐」라고 한 뒤 바로 「1 GBq 에서 이미 20 µSv/h 아래」가 와서 부딪쳤다(K-40 ·
             Mo-99 · Sr-89). 목표두께가 0 이면 「큰 선원에서 필요할 때 두껍다」로 말한다. */
        : t20 === 0
        /* ★ T12 검토 — 「이미 20 µSv/h 아래」는 이 핵종 **자신의** 광자 이야기다(Mo-99 는 Tc-99m 이 자라 실제 선원이 더 높고,
             Sr-89 의 실제 광자장은 대부분 제동복사다). 그래서 주어를 그 광자로, 두께를 「these lines」로 한정한다. */
        ? `At 1 GBq and a metre the dose rate from ${p.key}'s own photons is already under 20 µSv/h with nothing in the way; ` +
          `where a larger source does need a shield for ${p.shares.length === 1 ? "this line" : "these lines"}, it is a thick one — ` +
          `${mm(pb.hvlCm)} of lead for a factor of two and ` +
          `${mm(pb.tvlCm)} for a factor of ten, or ${mm(fe.hvlCm)} of steel for a factor of two.`
        : `This is a shield that has to be designed: ${mm(pb.hvlCm)} of lead for a factor of two and ` +
          `${mm(pb.tvlCm)} for a factor of ten, or ${mm(fe.hvlCm)} of steel to halve it, at which point the ` +
          `mass of the shield is part of the problem. ${target}`) +
      (p.hardens
        ? ` The tenth-value layer runs ${pb.ratio.toFixed(1)} times the half-value layer, not the 3.32 a single ` +
          `energy would give.`
        : ``),
    );
  } else if (n.lines.length) {
    /* ★ T12(2026-10-29) — ① 「The strongest line」이 가장 높은 **에너지**의 줄이었다(Ge-68 의 10.37 keV 는 가장 약한 줄) — 세기로
         고르고 세기를 함께 적는다(이 쪽에는 대조할 선 표가 없다). ② 「A monitor calibrated on Cs-137 … understates … rather than
         missing it outright」을 뺐다 — 자료로 뒷받침되지 않고 같은 쪽 손글(「invisible」)과 어긋났다. ③ 줄이 하나면(Pu-241)
         「All 1 recorded photon lines」 · 「runs 16.7 to 16.7 keV」가 됐다 — 한 줄 꼴로 쓴다. */
    const nl = n.lines.length, top = n.lines.reduce((a, b) => (b[1] > a[1] ? b : a));
    out.push(
      (nl === 1
        ? `The one recorded photon line sits below the 20 keV cutoff, so Γ is zero by convention and no external ` +
          `dose rate is quoted. It is at ${top[0].toFixed(2)} keV with ${sig(top[1])}% emission probability` +
          /* ★ T12 검토 — 베타 방출체(Y-90 · Pu-241)는 이 줄로 찾지 않는다 — 검출기 꼬리는 베타가 없을 때만 붙인다. */
          (p.betaMaxMeV ? `.` : `, which sets what a thin-window or proportional detector has to see.`)
        : `All ${nl} recorded photon lines sit below the 20 keV cutoff, so Γ is zero by convention and no ` +
          `external dose rate is quoted. The strongest line is ${top[0].toFixed(2)} keV, at ${sig(top[1])}% emission ` +
          `probability. ` +
          ((): string => { const l = lineSpan(p.key)!;
            return `The recorded spectrum runs ${l.loKeV.toPrecision(3)} to ${l.hiKeV.toPrecision(3)} keV and ` +
                   `carries ${l.totPct.toPrecision(3)}% emission probability in all` +
                   (p.betaMaxMeV ? `.` : `, which sets what a thin-window or proportional detector has to see.`); })()),
    );
  }

  if (p.betaMaxMeV) {
    const acrylic = p.betaRanges.find((r) => r.material === "acrylic")!;
    const glass = p.betaRanges.find((r) => r.material === "glass")!;
    const end = betaEndpointBranch(p.key), dom = betaDominantBranch(p.key);
    /* ★★ 종점이 **희귀한 가지**에서 나오는 경우가 흔하다 — Co-60 의 1.49 MeV 는 세기 0.12% 이고
       실제로 나오는 것은 0.318 MeV(99.88%)다. 비정은 종점으로 잡는 것이 맞지만(가장 센 베타를
       막아야 한다) 그 에너지를 대표값처럼 읽게 두면 안 된다. */
    /* ★ 기준 10%(2026-10-29) — 5% 로 두었더니 Cs-137 의 1.18 MeV(5.3% 가지)가 대표값처럼 서고 94.7% 가 내는 0.514 MeV
       베타는 말해지지 않았다. */
    const rare = end && dom && end.iPct < 10 && dom.maxKeV && dom.maxKeV < end.maxKeV;
    /* ★ β− 가 붕괴의 일부뿐인 핵종(2026-10-29, β− 가지를 채우며) — Eu-152 는 27.9%, K-40 은 89%, Ir-192 는 95% 다.
       「over 12 branches」만 쓰면 모든 붕괴가 베타를 내는 것처럼 읽힌다. 가지 세기의 합을 그대로 밝힌다. */
    const part = (n.beta_yield_pct ?? 100) < 99
      ? ((n.beta?.length ?? 0) > 1 ? `, which between them occur in ` : `, which occurs in `) + `${sig(n.beta_yield_pct!)}% of decays` : ``;
    out.push(
      `The beta endpoint is ${sig(p.betaMaxMeV)} MeV, mean ${sig((n.beta_mean_keV ?? 0) / 1000)} MeV over ` +
      `${n.beta?.length} branch${(n.beta?.length ?? 0) > 1 ? "es" : ""}` + part +
      (rare ? `; that endpoint comes from a branch of only ${end!.iPct}%, while ${dom!.iPct}% of decays take the ` +
              `${(dom!.maxKeV! / 1000).toPrecision(3)} MeV branch. Shielding is sized on the endpoint, dose on the mean` : ``) +
      `. That endpoint stops in ${mm(acrylic.cm)} of ` +
      /* ★ 「몇 배」를 쓰지 않는다 — 수율이 Z 에 비례하므로 그 비는 82/6.5 로 **모든 핵종에서
         같다.** 쪽마다 다른 척하는 숫자를 147번 찍는 것이 정확히 틀에 값만 갈아 끼우는 짓이다. */
      /** ★★★ **제동복사도 모핵종의 종점으로 계산된다**(2026-09-23). Sr-90 쪽이 0.546 MeV 로
       *  「납에서 1.57%」라고 적는데 실제 선원에서 그 X선을 내는 것은 **Y-90 의 2.28 MeV** 다 —
       *  **베타를 납으로 막으면 안 되는 이유가 정확히 이것**이라 값이 낮게 나가면 결론이 뒤집힌다.
       *  ★ 여기서는 **누구의 에너지인지 밝히고**, 딸의 값은 아래 연쇄 문단이 든다. */
      /* ★ T13 검토 — 연쇄가 이 자료 밖으로 이어지는 쪽(Ra-228 → Ac-228)도 「X's own」으로 한정한다(`ownOnly`). */
      `acrylic or ${mm(glass.cm)} of glass. Of ${ownOnly ? `${p.key}'s own` : `the`} ` +
      `beta energy, ${frac(p.bremsLow)} turns into X-rays in acrylic and ${frac(p.bremsLead)} in lead` +
      /* ★ 흔적 가지 관례(T12) — 제동복사 몫은 세기 1% 이상 가지의 최대 끝점으로 계산한다(`betaBremsMeV`). 그 끝점이
         사정거리의 끝점과 다르면(Co-60 · I-131 · Cs-134 · Au-198) 어느 끝점으로 계산했는지 밝힌다. */
      (p.bremsMeV && p.bremsMeV !== p.betaMaxMeV
        ? `, worked out for the ${sig(p.bremsMeV)} MeV branch, the hardest in at least 1% of decays.`
        : `.`),
    );
  }

  /** ★★★ **막아야 할 것이 딸핵종인 경우**(2026-09-23). 그전에는 낱장이 딸을 한 번도 말하지
   *  않아 Ru-106 쪽이 「0.0215 mm 의 아크릴」이라고 적고 있었다 — Rh-106 의 3.54 MeV 에는
   *  **17 mm 남짓**이 필요하니 800배 틀린 결론이었다. 숫자는 맞고 결론이 틀렸다.
   *  ★ 판단은 `lib/decay-chain.ts` 한 곳이 든다 — 게이트가 **같은 목록**을 읽는다.
   *  ★ **분기비를 쓰지 않는다**(자료에 없다). 쓰는 것은 신원·반감기·종점·감마상수뿐이다.
   *  ★ 문장 꼴을 `present`/`ingrowing` 과 베타/감마로 갈라 둔다 — 11장에 같은 틀을 찍으면
   *    그것이 곧 이 파일이 경계하는 「값만 갈아 끼운 글」이 된다. */
  /** ★★★ **이 자료에 다음이 없으면 위의 광자 수치는 이 핵종 자신의 것뿐이다**(2026-09-23).
   *  Ra-226 쪽이 그 값을 「small · 88× less than Cs-137」이라고 소개하고 「22.8 GBq 라야
   *  20 µSv/h」까지 계산해 주고 있었다 — 라듐 선원의 광자장은 거의 전부 자손의 것인데
   *  Rn-222·Pb-214·Bi-214 는 이 자료에 없다.
   *  ★ **맞는 값을 지어내지 않는다.** 얼마나 높아지는지는 우리가 모르므로 쓰지 않고,
   *    **조건문으로만** 말한다. 아는 것은 「그 다음이 이 자료에 없다」 하나뿐이다. */
  if (CHAIN_TRUNCATED.includes(p.key)) {
    /* ★ 딸의 이름을 못 낼 수 있다 — 원소기호는 **이 자료에 있는 핵종에서만** 나오는데,
       Ra-226 의 딸 라돈은 자료에 한 종도 없다. 주기율표를 기억으로 적지 않고,
       **이름을 모르면 이름 없이** 말한다(모르는 것을 아는 척하지 않는다). */
    const next = daughterLabel(p.key);
    out.push(
      `These photon figures are ${p.key}'s own. ` +
      (next ? `Its decay product ${next} is not in this dataset, and neither is what follows it, so nothing below `
            : `What it decays into is not in this dataset, so nothing below `) +
      `${p.key} is counted here. A source left sealed long enough for the chain to build up reads higher than ` +
      `this — how much higher is outside what this page can compute.`,
    );
  }

  const prog = dominantProgeny(p.key);
  if (prog) {
    const d = NUCLIDES[prog.key];
    const dp = nuclidePage(prog.key);
    const dHl = halfLifeText(d);
    const dAcr = dp.betaRanges.find((r) => r.material === "acrylic");
    const parentAcr = p.betaRanges.find((r) => r.material === "acrylic");
    const ratio = dAcr && parentAcr && parentAcr.cm > 0 ? dAcr.cm / parentAcr.cm : 0;

    if (prog.presence === "present" && prog.betaHotter && dAcr) {
      out.push(
        `${p.key} does not stand alone. ${prog.key} follows it with a half-life of ${dHl}, so ingrowth is ` +
        `complete within ${fmtTime(d.t_half_s * 7)} of separation. Its endpoint is ` +
        `${sig((d.beta_max_keV ?? 0) / 1000)} MeV and stops in ${mm(dAcr.cm)} of acrylic` +
        (ratio > 1.5 ? `, ${ratioText(ratio)} the thickness above` : ``) +
        `. The shield is sized on ${prog.key}, and so is the bremsstrahlung: ${frac(dp.bremsLow)} of that ` +
        `energy turns into X-rays in acrylic and ${frac(dp.bremsLead)} in lead.` +
        (prog.gammaHotter ? ` ${prog.key} also carries the photons here — ` +
          `${sig(gammaOf(prog.key))} mGy·m²/(GBq·h), against nothing recorded for ${p.key}.` : ``),
      );
    } else if (prog.presence === "present" && prog.gammaHotter) {
      out.push(
        `The photon field around ${p.key} is ${prog.key}'s. ${prog.key} (${dHl}) follows close enough to be ` +
        `present in any aged source, and its air kerma rate constant is ${sig(gammaOf(prog.key))} mGy·m²/(GBq·h)` +
        /* ★ T12 1-24 — Γ 가 0 이어도 줄은 있을 수 있다(Ge-68: 줄 다섯, 모두 컷오프 아래). 「no photon line is recorded」는 그때 거짓이다. */
        (n.gamma_const > 0 ? `, against ${sig(gammaOf(p.key))} for ${p.key}`
          : n.lines.length ? `, against zero for ${p.key}`
          : `, where no photon line is recorded for ${p.key}`) +
        `. Shield for ${prog.key}.`,
      );
    } else {
      out.push(
        `${prog.key} grows in beneath ${p.key} with a half-life of ${dHl}. How much of it is present depends on ` +
        /* ★ 이성질체 전이는 **같은 원소**라 「화학적으로 분리」가 성립하지 않는다 —
           그 경우 기준 시점은 분리가 아니라 **그 이성질체가 만들어진 때**다. */
        (d.z === n.z ? `how long ago the isomer was produced` : `how long ago the material was chemically separated`) +
        `, which this page cannot know — ` +
        `at full ingrowth it brings ` +
        (prog.gammaHotter ? `${sig(gammaOf(prog.key))} mGy·m²/(GBq·h) of air kerma rate constant` : ``) +
        (prog.gammaHotter && prog.betaHotter ? ` and ` : ``) +
        (prog.betaHotter ? `a ${sig((d.beta_max_keV ?? 0) / 1000)} MeV beta endpoint` : ``) +
        `, which the figures above do not include.`,
      );
    }
  }

  if (n.alpha?.length) {
    const top = [...n.alpha].sort((a, b) => b[1] - a[1])[0];
    out.push(
      `Alpha emission is led by ${(top[0] / 1000).toPrecision(4)} MeV at ${top[1]}%` +
      (n.alpha.length > 1 ? `, one of ${n.alpha.length} recorded lines` : ``) +
      /** ★★★ **「the limit here」가 쪽 전체로 번졌다**(2026-09-23). 광자장이 있는 알파 방출체
       *  **12장**이 납 두께를 주면서 동시에 「여기서 한계는 섭취이지 외부선량이 아니다」라고
       *  말하고 있었다 — **쪽이 스스로 모순**이다. Am-241 은 59.5 keV 때문에 감마 선원으로
       *  쓰이고, Ra-226 은 고전적인 외부 위험이다.
       *  ★ 맞는 것은 **알파에 대한 진술**이다. 「None of it」의 it 은 알파인데 결론만 쪽 전체를
       *    가져갔다. 광자가 있으면 **거기까지만** 말하고 나머지는 위 수치에 맡긴다. */
      (p.gamma > 0
        ? `. None of it reaches through skin, so the alpha is an intake hazard rather than an external one — ` +
          `the photon figures above are the separate question.`
        /* ★ T12 h — 자발 핵분열 가지가 있으면(SPONTANEOUS_FISSION) 외부 위험이 이 자료 밖에 있다 — 「the limit here is intake」로
             쪽 전체를 결론짓지 않는다(Cf-252 는 중성자 선원으로 쓰인다). */
        /* ★ T14 — 「the limit here」는 쪽 전체의 판정으로 읽혔다. U-233 손글은 늘 따라오는 U-232(끝의 Tl-208)가 저장 U-233 을
             감마선원으로 만든다고 쓰고, Ra-224 · Am-243 · Np-237 손글은 외부선량이 딸의 것이라고 쓴다. 딸이 이 자료에 실리거나
             연쇄가 이 자료 밖으로 이어지는 쪽은 진술을 **알파로** 한정한다(자발 핵분열 쪽과 같은 문장). 뒤따르는 「For X itself,
             decay is the only handle」과 「itself」가 겹치지 않는다(T14 검토). 연쇄가 안정 핵종에서 끝나는 쪽(Po-210)은 그대로다. */
        : SPONTANEOUS_FISSION[p.key] || daughterOf(p.key) || chainLeavesDataset(p.key)
        ? `. None of it reaches through skin, so the alpha is an intake hazard rather than an external one.`
        : `. None of it reaches through skin, so the limit here is intake, not external dose.`),
    );
  }

  /* ★★ 조건은 `n.lines.length` 가 아니라 **`p.shares.length`** 다(2026-09-21 실측으로 고쳤다).
     Gd-148 은 기록된 선이 **있는데 전부 20 keV 컷오프 아래**라, 선량률·차폐 절이 통째로 빠져
     244어로 얇으면서도 `n.lines.length` 로는 안 걸렸다 — 문장을 더해도 그 쪽만 안 붙었다.
     **얇게 만드는 것은 「선이 있는가」가 아니라 「컷오프를 넘는 선이 있는가」다.**
     안쪽의 좁은 조건이 「선이 정말 하나도 없다」는 문장을 맡는다. */
  if (!p.shares.length) {
    /* ★ 시평은 **이 블록에서 다시 구한다.** 위쪽 분기의 `h` 는 그 분기의 지역 변수이고,
       그것을 그대로 쓰면 **타입 검사는 통과하고 빌드가 죽는다**(`h is not defined`) —
       실제로 그렇게 죽였다. Astro 의 쪽 생성은 죽은 쪽에서 멈추므로 **dist 가 반쯤 남고**,
       그 반쪽을 재던 게이트가 「색인 0쪽 · 통과」를 찍었다(그 구멍은 게이트에서 막았다). */
    /* ★★ T13 — 「Decay is the only handle」은 **이 쪽이 막을 것을 하나도 말하지 않을 때만** 판정으로 선다(25쪽 중 6쪽 — Fe-55 · Ni-59 · Po-210 · Th-230 · U-233 · U-236).
         그전에는 광자선이 없으면 늘 섰는데, 같은 쪽이 차폐를 말하는 경우와 부딪쳤다(T12 2차 검토) —
         · 베타 사정거리 표가 있다(Sr-90 · Y-90 · P-32 · Ho-166 … 손글도 「acrylic first」라고 쓴다)
         · 딸이 차폐를 정한다(Ge-68: 바로 앞 문장이 「Shield for Ga-68.」)
         · 자발 핵분열(Cf-252: 중성자 차폐 — T12 는 「Within the figures on this page」로 한정했었다)
         · 연쇄가 이 자료 밖으로 이어진다(Ra-224 · Am-243 · Np-237: 손글이 「외부선량은 딸의 이야기」라고 쓴다)
         그 쪽에서는 판정을 빼고, 문장의 값이 이미 쪽에 있으면(시평 둘은 첫 문단, 열 반감기 · 평균수명은 붕괴 캡션) **문장째 뺀다**
         (T13 검토 — 판정이 빠진 문장은 첫 문단을 글자 그대로 되풀이했다). 첫 문단에 시평이 없는 띠(비방사능 1e9 Bq/g 아래 —
         Cs-135 · I-129 · Se-79 · Tc-99 · Np-237)만 숫자를 남긴다.
       ★ T13 검토 — 이 자료에 딸이 실린 쪽(Th-230 · U-233 · U-236)은 판정을 「For X itself」로 한정한다 — U-233 손글이 늘 따라오는
         U-232(Tl-208)를 감마선원으로 말한다. 붕괴 캡션의 「for X itself」와 같은 꼴이다. */
    const nothingToShield =
      !p.betaRanges.length && !dominantProgeny(p.key) && !SPONTANEOUS_FISSION[p.key] && !chainLeavesDataset(p.key);
    const hz = (key: string): string | null => {
      const g2 = horizons(key);
      const lead = `${g2[0].label} leaves ${frac(g2[0].frac)} of today's activity ` +
                   `and ${g2[1].label} leaves ${frac(g2[1].frac)}, with ten half-lives at ` +
                   `${tenHalfLives(key)} and a mean life of ${meanLife(key)} per atom.`;
      if (nothingToShield)
        return `${daughterOf(key) ? `For ${key} itself, decay is the only handle` : `Decay is the only handle`}: ${lead}`;
      return n.sa_bq_g < 1e9 ? lead.charAt(0).toUpperCase() + lead.slice(1) : null;
    };
    /* 「선이 하나도 없다」는 말은 **정말 하나도 없을 때만** 한다 — 알파만 있는 낱장은
       위에서 알파를 이미 말했다. */
    if (!n.lines.length && !n.beta?.length && !n.alpha?.length) out.push(
      /* ★★ **설명은 쪽마다 두지 않는다** — 이 파일의 규칙인데 이 문단이 그것을 어기고 있었다
         (2026-09-21 실측). 「수확과 문턱에 대한 진술이지 방출이 없다는 뜻이 아니다」·「이런
         핵종은 보통 파괴분석으로 잰다」는 **선이 없는 핵종 전부에 똑같이 해당**하므로, 낱장에
         두면 그 낱장들이 서로 베낀 것처럼 보인다. 실측: Ca-41 ↔ Ni-59 의 겹치는 8어절 148개
         중 가장 긴 덩어리가 바로 이 문단이었다. 남기는 것은 **이 핵종의 수**뿐이다. */
      `At ${sig(n.sa_bq_g)} Bq per gram, a 1 kBq aliquot of ${p.key} is ${mass(1e3 / n.sa_bq_g)} — ` +
      `the quantity that has to be recovered, dissolved and counted, because this dataset carries no ` +
      `photon, beta or alpha line for it above the reporting thresholds.`,
    );
    /* ★ 광자선이 없는 낱장은 **쓸 것이 적어 얇아진다**(실측 232~264어, 하한 250). 분량을
       채우려고 일반론을 더하면 그 낱장들끼리 다시 겹친다 — 더하는 것은 **이 핵종에서만
       다른 수**다. 시평 둘·열 반감기·평균 수명은 핵종마다 자릿수가 갈린다. */
    const last = hz(p.key);
    if (last) out.push(last);
  }
  return out;
}

/** 붕괴 표의 캡션 — **표에 없는 값**(십 반감기의 경과 시간·평균수명)만 든다.
 *
 *  ★★ 147장에 같은 문장을 두면 그것이 곧 되풀이다(2026-09-20 실측: 한 문장을 147장에 넣자
 *    되풀이 몫 중앙이 52.8 → 55.3% 로 되올랐다). 게이트가 세는 것은 「**절반 이상의 쪽에
 *    나오는 5어절**」이므로, 반감기 자릿수로 띠를 나누면 어느 띠도 절반을 넘지 않는다
 *    (실측 36·48·34·29장, 절반은 74장).
 *  ★ 숫자를 피하려고 띠를 나눈 것이 아니다 — **6시간짜리와 10억년짜리에 같은 말을 하는 것이
 *    애초에 틀린 글**이다. 띠마다 그 눈금에서 실제로 문제가 되는 것을 말한다.
 *  ★ 평균수명/반감기 = 1.44 는 모든 핵종에서 같으므로 **찍지 않는다**(납/아크릴 Z 비와 같은 규칙). */
export function decayCaption(key: string): string {
  const T = NUCLIDES[key].t_half_s, D = 86400, Y = 31557600;
  const ten = tenHalfLives(key), tau = meanLife(key);
  if (T < D)
    return `Ten half-lives is ${ten}, so the activity moves measurably while a count is running: every ` +
           `figure has to carry the time it was referred to. The mean life 1/λ is ${tau}.`;
  /* ★ T12 §5-e — 1년 뒤 남는 몫이 0.1% 아래면 「7.2e-35% … still there after a year」(Tl-201)처럼 「남아 있다」가 거짓이 된다.
     그때는 0.1% 를 넘어갔다고만 쓴다. */
  if (T < Y) {
    const r1 = remainingAfterYears(key, 1);
    /* ★ T12 검토 — 「storage rather than disposal」은 **이 핵종 자신**의 판정이다(Lu-177 은 Lu-177m 이 처분을 정할 수 있다). */
    return `Ten half-lives is ${ten} — for ${key} itself, a storage problem rather than a disposal one, ` +
           (r1 >= 1e-3 ? `with ${frac(r1)} of today's activity still there after a year. `
                       : `since those ten half-lives already take it below 0.1% of today's activity. `) +
           `The mean life 1/λ is ${tau}.`;
  }
  /* ★★ T12 1-7 · 1-14 · 1-15 — 1~1000년을 한 문장(「which puts decay storage out of reach: X survives forty years」)으로 덮어
     Cd-109(3.0e-8%) · Cs-134 · Co-60(0.52%)에서 문장이 스스로 어긋났다. 띠를 쪽의 값으로 셋으로 가른다 —
     열 반감기가 40년 안 · 반감기가 40년 아래(40년이 대부분을 없앤다) · 반감기 40년 이상(지금 문장이 맞는 띠). */
  if (T < 1000 * Y) {
    const r40 = remainingAfterYears(key, 40);
    const lead = 10 * T <= 40 * Y
      ? `Ten half-lives is ${ten}, so forty years of decay takes it past the 0.1% mark, to ${frac(r40)}.`
      : T < 40 * Y
      ? `Ten half-lives is ${ten}, so forty years of decay stops short of the 0.1% mark: it removes most of the ` +
        `activity but leaves ${frac(r40)}.`
      : `Ten half-lives is ${ten}, which puts decay storage out of reach: ${frac(r40)} survives forty years.`;
    return `${lead} The mean life 1/λ, the quantity that enters an integrated dose, is ${tau}.`;
  }
  return `Ten half-lives is ${ten}. On any timescale a facility can be planned over the activity is ` +
         `constant — ${frac(remainingAfterYears(key, 40))} is left after forty years — and the mean ` +
         `life 1/λ is ${tau}.`;
}

/** 구획 제목 — ★★ 147장에 **글자까지 같은 제목 넷**이 서 있었다
 *  (`Key figures` · `How the activity falls` · `What this page does not tell you` ·
 *  `Open X in a calculator`). 이웃 lab 이 애드센스에서 걸린 모양이 정확히 그것이다.
 *
 *  ★★ **이름을 다른 상수로 바꾸는 것은 아무 소용이 없다**(2026-09-20 에 이미 확인하고 버렸다) —
 *    재는 자가 핵종 이름을 지운 뒤 비교하므로 「X at a glance」는 147장에서 같은 문자열이다.
 *    내려가게 하려면 **제목이 쪽마다 다른 것을 말해야** 한다.
 *  ★ 그래서 제목이 **그 쪽에 실제로 있는 것**을 말하도록 했다 — 표에 어떤 줄이 있는지,
 *    붕괴 표가 어느 눈금을 덮는지, 무엇이 한계인지, 어떤 계산기로 이어지는지.
 *    훑는 사람에게도 이쪽이 낫다: 제목만 읽어도 그 쪽에 감마가 있는지 알 수 있다.
 *  ★ 문체는 **명사형**을 지킨다(플랫폼 관행). 문장형 제목을 쓰지 않는다.
 *  ★★ **숫자를 제목에 쓰지 않는다** — 재는 자가 숫자를 `#` 으로 바꾸므로 「5 calculators」와
 *    「3 calculators」가 **같은 문자열로 접힌다.** 세는 말은 낱말로 쓰거나 아예 쓰지 않는다.
 *  ★ 모의로 먼저 쟀다: 제목 틀 중앙 **75.0% → 20.0%**, 전 낱장 공통 제목 **4 → 0개**. */
export function sectionHeads(p: NuclidePage) {
  const n = p.n, D = 86400, Y = 31557600, t10 = 10 * n.t_half_s;
  const g = p.gamma > 0, b = Boolean(p.betaMaxMeV), a = Boolean(n.alpha?.length);
  return {
    /* 표에 실제로 서는 줄을 그대로 부른다. */
    figures:
      g && b ? "Half-life, specific activity, dose rate and beta energies"
      : g    ? "Half-life, specific activity and dose rate"
      : b    ? "Half-life, specific activity and beta endpoint"
      /* ★★ 선이 하나도 없는 핵종은 **제목을 가를 것이 없다** — 감마도 베타도 알파도 없으니
         아래 넷이 전부 상수가 되고, 그 낱장들끼리 **제목 순서가 글자 그대로 같아진다**
         (실측: Ca-41 ↔ Ni-59 · Fe-55 ↔ Ra-228). 이름을 넣어도 소용없다 — 게이트가 이름을
         지우고 센다(그리고 그것이 맞다: 이름만 갈아 끼운 제목은 갈린 제목이 아니다).
         그래서 **이 핵종의 수**를 제목에 들린다. 표에 실제로 서는 두 줄이다. */
      /* ★ T12 1-25 · 1-26 · §5-c — 「no line recorded」가 줄이 있는 쪽(Fe-55 · Ge-68: 모두 컷오프 아래)과 알파 줄이 있는 쪽에도
           섰다. 여기는 Γ 가 0 인 자리라 줄이 있으면 전부 컷오프 아래다. */
      : n.lines.length ? `Half-life ${halfLifeText(n)}, ${sig(n.sa_bq_g)} Bq/g, and no line above the 20 keV cutoff`
      : a             ? `Half-life ${halfLifeText(n)}, ${sig(n.sa_bq_g)} Bq/g, and no photon line recorded`
      :                 `Half-life ${halfLifeText(n)}, ${sig(n.sa_bq_g)} Bq/g, and no line recorded`,
    /* 붕괴 표가 덮는 눈금 — 열 반감기가 어디까지 가는가.
       ★ 첫 판의 경계가 틀렸다(2026-09-20, 눈으로 잡았다) — 100년에서 바로 「millennia」로
         넘어가는 바람에 **H-3(열 반감기 123년)·Cs-137(301년)·Sr-90(288년)이 「천년 단위」**
         라고 말했다. 이름이 그 눈금을 실제로 가리키는지 **값을 넣어 확인할 것.** */
    /* ★★ T12 1-47 · §5-f — 띠를 열 반감기로 다시 짰다. 그전에는 30일 · 10년 · 1000년 셋뿐이라 Tl-201(30.4일)이 「months and
         years」, Tc-99m(2.5일)이 「days and weeks」, Cd-109(12.6년) · Co-60(52.7년)이 「decades and centuries」였다. 경계는 쪽의
         붕괴 표가 실제로 덮는 기간에 맞춘다 — 7일 · 91일(13주, `horizons()` 의 「three months」와 같은 눈금) · 1년 · 10년 · 100년. */
    decay:
      t10 < D          ? "Activity over the first hours"
      : t10 < 7 * D    ? "Activity over hours and days"
      : t10 < 91 * D   ? "Activity over days and weeks"
      : t10 < Y        ? "Activity over weeks and months"
      : t10 < 10 * Y   ? "Activity over months and years"
      : t10 < 100 * Y  ? "Activity over years and decades"
      : t10 < 1000 * Y ? "Activity over decades and centuries"
      : t10 < 1e4 * Y  ? "Activity over centuries and millennia"
      : t10 < 1e6 * Y  ? "Activity over millennia"
      :                  "Activity over geological time",
    /* 그 쪽에서 실제로 문제가 되는 한계.
       ★★ 감마를 먼저 보면 **Pu-239·U-238 이 「Limits of these dose rates」**가 된다 —
         Γ 가 1e-5 도 안 되는 알파 방출체이고 **그 쪽 본문은 「외부선량이 한계가 되는 일은
         드물다」고 말한다.** 제목이 본문과 어긋나면 제목이 거짓말을 하는 것이다.
       ★ 그래서 알파가 있고 Γ 가 약한 띠(0.005, 산문에서 쓰는 것과 같은 문턱)이면
         섭취 쪽을 든다. */
    /* ★ T12 1-41 — 연쇄가 이 자료에서 끊기는 알파 핵종(Ra-226 · U-238)은 Γ 가 작아도 자손의 광자장이 빠진 값이라 「intake, not
         external」로 결론짓지 않는다. ★ T12 h — 자발 핵분열 가지(SPONTANEOUS_FISSION, Cf-252 · T13 Cm-244)도 외부 위험이 이 자료 밖에 있다.
       ★ T14 — 단 Pu-238 · Pu-240 은 손글(소유주 통독)이 「Intake … governs」라고 써서 섭취 제목을 둔다(`SF_INTAKE_GOVERNS`).
       ★ T13 — 연쇄가 이 자료 밖으로 이어지는 쪽(`chainLeavesDataset`, Th-232)도 같다. Γ 가 0 인 쪽(Am-243 · Np-237 · Ra-224)은
         「dose rates」 제목을 세울 수치가 없어 아래 `a` 갈래로 그대로 간다(Am-243 손글이 그 제목을 가리킨다). */
    limits:
      a && p.gamma < 0.005 && !CHAIN_TRUNCATED.includes(p.key) && !chainLeavesDataset(p.key) &&
      (!SPONTANEOUS_FISSION[p.key] || SF_INTAKE_GOVERNS.includes(p.key))
        ? "Limits — intake, not external dose"
      : g ? "Limits of these dose rates"
      : SPONTANEOUS_FISSION[p.key] ? "Limits of these figures"
      : a ? "Limits — intake, not external dose"
      : b ? "Limits of these range figures"
      :     "Limits of these figures",
    /** ★★★ **아래 넷은 틀 그 자체였다**(2026-09-21). 낱장의 제목 넷이 템플릿에 **글자로
     *  박혀** 있어서, 같은 붕괴 모드끼리는 **제목 순서가 글자 그대로 같았다** — 147장 중
     *  **136장이 20개 묶음**으로 접혔고 가장 큰 묶음이 26장이다. 이웃 사이트를 애드센스에서
     *  탈락시킨 모양 그대로다.
     *  ★★ **그런데 게이트는 「0건」이라고 말하고 있었다.** 마지막 제목(`tools`)이 핵종 이름을
     *    들어 순서가 갈렸기 때문이다 — **한 줄이 검사를 통째로 속였다.** 지금은 게이트가
     *    이름을 지우고 다시 센다.
     *  ★★ 앞선 판의 「전 낱장 공통 제목 4 → 0개」도 **참이지만 다른 것을 잰 값**이다 —
     *    「147장 전부에 있는가」와 「같은 묶음 안에서 같은가」는 다른 질문이고, 실패 모드는
     *    뒤엣것이다. **재는 자를 고를 때 그 자가 실제 실패 모드를 재는지 확인할 것.**
     *  고치는 방법은 제목을 없애는 것이 아니라 **제목이 이 핵종의 수를 들게** 하는 것이다.
     *  읽는 사람에게도 그쪽이 낫다 — 「Photon lines」보다 「662 keV carries 95% of the dose
     *  rate」가 쪽을 열기 전에 말을 한다. */
    lines: (() => {
      if (!p.shares.length) return "Photon lines and what each contributes";
      const top = p.shares.reduce((a, b) => (b.share > a.share ? b : a));
      const keV = (x: number) => (x >= 100 ? String(Math.round(x)) : x.toPrecision(3));
      if (p.shares.length === 1) return `A single photon line at ${keV(top.eKeV)} keV`;
      if (top.share >= 0.8) return `${keV(top.eKeV)} keV carries ${Math.round(top.share * 100)}% of the dose rate`;
      if (p.linesFor90 <= 3) return `${keV(top.eKeV)} keV leads, and ${p.linesFor90} lines make 90%`;
      return `${p.shares.length} lines above the cutoff, and what each contributes`;
    })(),
    /* 납이 없으면(자료에 안 실린 조합) 표의 첫 줄을 든다 — 제목이 표와 어긋나지 않는다. */
    shield: (() => {
      const r = p.shields.find((x) => x.material === "lead") ?? p.shields[0];
      return r ? `${mm(r.hvlCm)} of ${r.material} halves this spectrum`
               : "Half- and tenth-value layers";
    })(),
    beta: (() => {
      const r = p.betaRanges.find((x) => /acrylic/i.test(x.material)) ?? p.betaRanges[0];
      return r && p.betaMaxMeV
        ? `${mm(r.cm)} of ${r.material} stops the ${sig(p.betaMaxMeV)} MeV endpoint`
        : "Beta range and bremsstrahlung";
    })(),
    alpha: (() => {
      const a = alphaSpread(p.key);
      if (!a) return "Alpha lines";
      return a.count === 1
        ? `One alpha line at ${a.topMeV.toPrecision(4)} MeV`
        : `${a.count} alpha lines, strongest ${a.topMeV.toPrecision(4)} MeV`;
    })(),
    /* 이어지는 계산기 — 목록은 아래가 온전히 든다. 제목은 가려 주는 말이다. */
    tools:
      g && b ? `Gamma, beta and decay calculators for ${p.key}`
      : g    ? `Gamma and decay calculators for ${p.key}`
      : b    ? `Beta and decay calculators for ${p.key}`
      :        `Decay and mass calculators for ${p.key}`,
  };
}
