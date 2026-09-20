import type { NuclidePage } from "./nuclides";
import { NUCLIDES } from "./nuclides";
import { decayWord, halfLifeText, gammaRank, gammaVs, leadForTarget, horizons,
         betaEndpointBranch, betaDominantBranch, lineSpan,
         tenHalfLives, meanLife, remainingAfterYears } from "./nuclides";

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
const pct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;
const mm = (cm: number, d = 3) => `${(cm * 10).toPrecision(d)} mm`;
const sig = (x: number, d = 3) => (Number.isFinite(x) ? x.toPrecision(d) : "—");
const times = (r: number) => (r >= 1 ? `${r.toPrecision(2)}×` : `${(1 / r).toPrecision(2)}× less than`);
/** ★ 질량은 자리수가 24자리를 넘나든다(Tc-99m 의 5 pg 대 Ca-41 의 0.3 g) — 고정 소수점으로
 *  쓰면 `0.0000239 g`, 단위 고르기를 잘못하면 `2.39e+4 ng` 가 된다. **눈금마다 위 경계를 준다.** */
const mass = (g: number) => {
  if (!Number.isFinite(g) || g <= 0) return "—";
  const S: [number, string, number][] = [
    [1e-9, "pg", 1e12], [1e-6, "ng", 1e9], [1e-3, "µg", 1e6], [1, "mg", 1e3], [1e3, "g", 1],
  ];
  for (const [hi, unit, k] of S) if (g < hi) return `${(g * k).toPrecision(3)} ${unit}`;
  return `${(g / 1e3).toPrecision(3)} kg`;
};
/** ★ 0.00% 는 아무것도 알려 주지 않는다 — 아주 작아지면 지수로 바꾼다. */
const frac = (x: number) => (x >= 1e-4 ? `${(x * 100).toFixed(2)}%` : x > 0 ? `${(x * 100).toExponential(1)}%` : "0%");

export function paragraphs(p: NuclidePage): string[] {
  const out: string[] = [];
  const { n } = p;

  out.push(
    `${p.name} (${p.key}) decays by ${decayWord(n.decay)} with a half-life of ${halfLifeText(n)}. ` +
    `A gram of it holds ${sig(n.sa_bq_g)} Bq (${sig(p.saCiPerG)} Ci), so 1 GBq is ${mass(1e9 / n.sa_bq_g)}. ` +
    (() => { const h = horizons(p.key);
      return `After ${h[0].label} ${frac(h[0].frac)} of today's activity is left, and after ${h[1].label} ${frac(h[1].frac)}.`; })(),
  );

  if (p.gamma > 0) {
    const top = p.shares[0];
    const r = gammaRank(p.key);
    out.push(
      `Γ comes out at ${sig(p.gamma)} mGy·m²/(GBq·h), ` +
      ((): string => {
        /* ★ 자기 자신과 비교하지 않는다 — Co-60 쪽에 「1.0× Co-60」이 뜨고 있었다. */
        const refs = (["Cs-137", "Co-60"] as const).filter((k) => k !== p.key);
        return refs.length === 2
          ? `which is ${times(gammaVs(p.key, refs[0]))} ${refs[0]} and ${times(gammaVs(p.key, refs[1]))} ${refs[1]}, `
          : `which is ${times(gammaVs(p.key, refs[0]))} ${refs[0]}, `;
      })() +
      `and ranks ${r.rank} of the ${r.of} photon emitters in this dataset. ` +
      `1 GBq at 1 m reads ${sig(p.doseAt1mPerGBq)} mGy/h; 1 Ci at 1 m reads ${sig(p.doseAt1mPerCi)} mGy/h.`,
    );
    out.push(
      p.shares.length === 1
        ? `One line at ${top.eKeV.toFixed(1)} keV carries all of that.`
        : `${p.shares.length} lines clear the 20 keV cutoff, but ${p.linesFor90 === 1 ? "one of them carries" : `${p.linesFor90} of them carry`} 90% of the dose rate. ` +
          `The leading one is ${top.eKeV.toFixed(1)} keV at ${pct(top.share)} of the total — its emission ` +
          `probability is ${top.yPct}%, which is ${top.yPct >= p.shares[1].yPct ? "also the highest" : `lower than the ${p.shares[1].yPct}% of the ${p.shares[1].eKeV.toFixed(1)} keV line it outranks`}.`,
    );

    const pb = p.shields.find((s) => s.material === "lead")!;
    const fe = p.shields.find((s) => s.material === "iron")!;
    const t20 = leadForTarget(p.key, 0.02);
    out.push(
      `Halving the air kerma rate takes ${mm(pb.hvlCm)} of lead or ${mm(fe.hvlCm)} of steel; a tenth takes ` +
      `${mm(pb.tvlCm)} of lead. Bringing 1 GBq at 1 m down to 20 µSv/h needs ${t20 === 0 ? "no shielding at all — it is already below that" : `${mm(t20)} of lead`}.` +
      (p.hardens
        ? ` Note the tenth-value layer is ${pb.ratio.toFixed(1)} times the half-value layer here, not the 3.32 of a ` +
          `single energy: this spectrum hardens as it penetrates, so three half-value layers do not give an eighth.`
        : ``),
    );
  } else if (n.lines.length) {
    out.push(
      `All ${n.lines.length} recorded photon lines sit below the 20 keV cutoff, so Γ is zero by convention and no ` +
      `external dose rate is quoted. The strongest line is ${Math.max(...n.lines.map(([e]) => e)).toFixed(2)} keV. ` +
      `A monitor calibrated on Cs-137 under-responds at these energies, so a reading taken without an energy ` +
      `correction understates ${p.key} rather than missing it outright. ` +
      ((): string => { const l = lineSpan(p.key)!;
        return `The recorded spectrum runs ${l.loKeV.toPrecision(3)} to ${l.hiKeV.toPrecision(3)} keV and ` +
               `carries ${l.totPct.toPrecision(3)}% emission probability in all, which sets what a thin-window ` +
               `or proportional detector has to see.`; })(),
    );
  }

  if (p.betaMaxMeV) {
    const acrylic = p.betaRanges.find((r) => r.material === "acrylic")!;
    const glass = p.betaRanges.find((r) => r.material === "glass")!;
    const end = betaEndpointBranch(p.key), dom = betaDominantBranch(p.key);
    /* ★★ 종점이 **희귀한 가지**에서 나오는 경우가 흔하다 — Co-60 의 1.49 MeV 는 세기 0.12% 이고
       실제로 나오는 것은 0.318 MeV(99.88%)다. 비정은 종점으로 잡는 것이 맞지만(가장 센 베타를
       막아야 한다) 그 에너지를 대표값처럼 읽게 두면 안 된다. */
    const rare = end && dom && end.iPct < 5 && dom.maxKeV && dom.maxKeV < end.maxKeV;
    out.push(
      `The beta endpoint is ${sig(p.betaMaxMeV)} MeV, mean ${sig((n.beta_mean_keV ?? 0) / 1000)} MeV over ` +
      `${n.beta?.length} branch${(n.beta?.length ?? 0) > 1 ? "es" : ""}` +
      (rare ? `; that endpoint comes from a branch of only ${end!.iPct}%, while ${dom!.iPct}% of decays take the ` +
              `${(dom!.maxKeV! / 1000).toPrecision(3)} MeV branch. Shielding is sized on the endpoint, dose on the mean` : ``) +
      `. That endpoint stops in ${mm(acrylic.cm)} of ` +
      /* ★ 「몇 배」를 쓰지 않는다 — 수율이 Z 에 비례하므로 그 비는 82/6 으로 **모든 핵종에서
         같다.** 쪽마다 다른 척하는 숫자를 147번 찍는 것이 정확히 틀에 값만 갈아 끼우는 짓이다. */
      `acrylic or ${mm(glass.cm)} of glass. Of the beta energy, ${frac(p.bremsLow)} turns into X-rays in ` +
      `acrylic and ${frac(p.bremsLead)} in lead.`,
    );
  }

  if (n.alpha?.length) {
    const top = [...n.alpha].sort((a, b) => b[1] - a[1])[0];
    out.push(
      `Alpha emission is led by ${(top[0] / 1000).toPrecision(4)} MeV at ${top[1]}%` +
      (n.alpha.length > 1 ? `, one of ${n.alpha.length} recorded lines` : ``) +
      `. Nothing of that reaches through skin, so ${p.key} contributes no external dose; what matters is intake, ` +
      `and committed dose per becquerel is outside what this site computes.`,
    );
  }

  if (!n.lines.length && !n.beta?.length && !n.alpha?.length) {
    out.push(
      `This dataset records no photon, beta or alpha lines for ${p.key} — a statement about the harvest and its ` +
      `thresholds, not a claim that the nuclide emits nothing. Half-life, decay mode and specific activity are ` +
      `therefore available here and dose rate and shielding are not. Nuclides in this position are normally ` +
      `assayed destructively rather than with a survey meter. At ${sig(n.sa_bq_g)} Bq per gram, a 1 kBq ` +
      `aliquot is ${mass(1e3 / n.sa_bq_g)} of ${p.key} — the quantity that has to be recovered, dissolved ` +
      `and counted before any of it becomes a number.`,
    );
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
 *  ★ 평균수명/반감기 = 1.44 는 모든 핵종에서 같으므로 **찍지 않는다**(82/6 과 같은 규칙). */
export function decayCaption(key: string): string {
  const T = NUCLIDES[key].t_half_s, D = 86400, Y = 31557600;
  const ten = tenHalfLives(key), tau = meanLife(key);
  if (T < D)
    return `Ten half-lives is ${ten}, so the activity moves measurably while a count is running: every ` +
           `figure has to carry the time it was referred to. The mean life 1/λ is ${tau}.`;
  if (T < Y)
    return `Ten half-lives is ${ten} — a storage problem rather than a disposal one, with ` +
           `${frac(remainingAfterYears(key, 1))} of today's activity still there after a year. ` +
           `The mean life 1/λ is ${tau}.`;
  if (T < 1000 * Y)
    return `Ten half-lives is ${ten}, which puts decay storage out of reach: ` +
           `${frac(remainingAfterYears(key, 40))} survives forty years. The mean life 1/λ, the quantity that ` +
           `enters an integrated dose, is ${tau}.`;
  return `Ten half-lives is ${ten}. On any timescale a facility can be planned over the activity is ` +
         `constant — ${frac(remainingAfterYears(key, 40))} is left after forty years — and the mean ` +
         `life 1/λ is ${tau}.`;
}
