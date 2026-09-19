/** ★★ 유효성 평가가 인용하는 **1차 원천 등록부** — 정본이다.
 *
 *  ★ 유효성 평가 자료의 값어치는 **기대값이 어디서 왔는가** 하나에 달려 있다.
 *    기대값을 우리 `engine/constants.ts` 에서 계산하면 「도구가 도구와 같다」를 증명할 뿐이고,
 *    그것은 증명이 아니라 **순환논증**이다. 그래서 이 파일의 원천만이 기대값의 출처이고,
 *    케이스 파일은 **엔진의 어떤 값도 import 하지 않는다**(`gate/check-validation.mjs` ②가 지킨다).
 *
 *  ★ 여기 적힌 서지·인용문은 전부 **원문을 실제로 열어 확인한 것**이다(2026-09-17).
 *    레포 절대규칙 3 — 문헌값을 기억으로 적지 않는다. 이 레포를 세우는 동안 기억으로 적은
 *    기준값 넷이 틀렸고, 유효성 평가 자료에서 같은 일을 하면 자료 자체가 무의미해진다.
 *
 *  ★ **유료 규격 본문을 옮기지 않는다**(절대규칙 2). 아래는 전부 **무상 공개 문서**이고,
 *    인용하는 것은 정의 한 줄과 상수 한 개씩이다 — 표나 본문을 재현하지 않는다. */

export interface Source {
  key: string;
  /** 각주에 다는 짧은 이름. */
  label: string;
  /** 서지 — 쪽에 그대로 그린다. */
  cite: string;
  url: string;
  /** 접근 조건 — 어느 것이 무상인지 밝힌다. */
  access: string;
}

export const SOURCES: Record<string, Source> = {
  si: {
    key: "si",
    label: "SI Brochure",
    cite: "Bureau International des Poids et Mesures, The International System of Units (SI), 9th edition (2019), V4.01, June 2026. doi:10.59161/AUEZ1291.",
    url: "https://www.bipm.org/en/publications/si-brochure",
    access: "Published by the BIPM under CC BY 4.0.",
  },
  cgpm1964: {
    key: "cgpm1964",
    label: "12th CGPM (1964)",
    cite: "12th Conférence Générale des Poids et Mesures (1964), Resolution 7 — Curie. Reproduced in the SI Brochure, 9th edition, Appendix 1.",
    url: "https://www.bipm.org/en/committees/cg/cgpm/12-1964/resolution-7",
    access: "Published by the BIPM under CC BY 4.0.",
  },
  cgpm1975: {
    key: "cgpm1975",
    label: "15th CGPM (1975)",
    cite: "15th Conférence Générale des Poids et Mesures (1975), Resolutions 8 and 9 — SI units for ionizing radiation (becquerel and gray). Reproduced in the SI Brochure, 9th edition, Appendix 1.",
    url: "https://www.bipm.org/en/committees/cg/cgpm/15-1975/resolution-8",
    access: "Published by the BIPM under CC BY 4.0.",
  },
  sp811: {
    key: "sp811",
    label: "NIST SP 811",
    cite: "Thompson, A. and Taylor, B. N., Guide for the Use of the International System of Units (SI), NIST Special Publication 811, 2008 edition, Appendix B.9 (factors printed in boldface are exact).",
    url: "https://www.nist.gov/physical-measurement-laboratory/nist-guide-si-appendix-b9",
    access: "Freely published by NIST.",
  },
  trs398: {
    key: "trs398",
    label: "IAEA TRS-398",
    cite: "International Atomic Energy Agency, Absorbed Dose Determination in External Beam Radiotherapy, Technical Reports Series No. 398, IAEA, Vienna (2000), Appendix II.2.2.",
    url: "https://www-pub.iaea.org/MTCD/Publications/PDF/TRS398_scr.pdf",
    access: "Freely published by the IAEA.",
  },
  /** ★★ **정식 간행물은 BIPM 쪽이다**(2026-09-18 소유주 제안으로 확인 — 「bipm 방사선 table
   *  자료를 찾아서 이용해」). DDEP 평가는 **BIPM Monographie-5 『Table of Radionuclides』**
   *  로 간행되고, LNE-LNHB 가 낱장 형태로 최신판을 유지한다. **같은 평가의 두 얼굴**이므로
   *  인용은 국제 계량기구의 간행물로 하고, 실제로 읽은 낱장 주소를 함께 적는다. */
  ddep: {
    key: "ddep",
    label: "BIPM Monographie-5",
    cite: "Table of Radionuclides, Monographie BIPM-5, Bureau International des Poids et Mesures — the Decay Data Evaluation Project evaluation, maintained in per-nuclide form by the Laboratoire National Henri Becquerel (LNE-LNHB).",
    url: "https://www.bipm.org/en/publications/monographies-ri",
    access: "Freely published by the BIPM; the current per-nuclide sheets are at lnhb.fr/nuclides/.",
  },
  ornl45: {
    key: "ornl45",
    label: "ORNL/RSIC-45",
    cite: "Unger, L. M. and Trubey, D. K., Specific Gamma-Ray Dose Constants for Nuclides Important to Dosimetry and Radiological Assessment, ORNL/RSIC-45, Oak Ridge National Laboratory (1981).",
    url: "https://www.osti.gov/biblio/6246345",
    access: "Freely published by the US Department of Energy through OSTI.",
  },
  nist126: {
    key: "nist126",
    label: "NIST SRD 126",
    cite: "Hubbell, J. H. and Seltzer, S. M., Tables of X-Ray Mass Attenuation Coefficients and Mass Energy-Absorption Coefficients, NIST Standard Reference Database 126, doi:10.18434/T4D01F.",
    url: "https://physics.nist.gov/PhysRefData/XrayMassCoef/cover.html",
    access: "Published by NIST as a Standard Reference Database; not a public-domain work. Used here to compute, not redistributed as a dataset.",
  },
  ame2020: {
    key: "ame2020",
    label: "AME2020",
    cite: "Wang, M., Huang, W. J., Kondev, F. G., Audi, G. and Naimi, S., The AME2020 atomic mass evaluation (II). Tables, graphs and references, Chinese Physics C 45, 030003 (2021). Data file mass_1.mas20, Atomic Mass Data Center, dated 3 March 2021.",
    url: "https://www-nds.iaea.org/amdc/",
    access: "The evaluation and its data files are distributed without charge by the Atomic Mass Data Center through the IAEA Nuclear Data Section.",
  },
  nubase2020: {
    key: "nubase2020",
    label: "NUBASE2020",
    cite: "Kondev, F. G., Wang, M., Huang, W. J., Naimi, S. and Audi, G., The NUBASE2020 evaluation of nuclear physics properties, Chinese Physics C 45, 030001 (2021). Data file nubase_4.mas20.",
    url: "https://www-nds.iaea.org/amdc/",
    access: "Distributed without charge by the Atomic Mass Data Center through the IAEA Nuclear Data Section.",
  },
  codata: {
    key: "codata",
    label: "CODATA 2022",
    cite: "Mohr, P. J., Newell, D. B., Taylor, B. N. and Tiesinga, E., CODATA recommended values of the fundamental physical constants: 2022, as published by NIST in the Fundamental Physical Constants complete listing.",
    url: "https://physics.nist.gov/cuu/Constants/Table/allascii.txt",
    access: "Freely published by NIST.",
  },
  estar: {
    key: "estar",
    label: "NIST ESTAR",
    cite: "Berger, M. J., Coursey, J. S., Zucker, M. A. and Chang, J., ESTAR: Stopping Powers and Range Tables for Electrons, NIST Standard Reference Database 124, National Institute of Standards and Technology. The method description cites ICRU (1984) for the treatment of mean excitation energies.",
    url: "https://physics.nist.gov/PhysRefData/Star/Text/ESTAR.html",
    access: "Freely published by NIST as an online database.",
  },
  katzPenfold: {
    key: "katzPenfold",
    label: "Katz & Penfold (1952)",
    cite: "Katz, L. and Penfold, A. S., Range-Energy Relations for Electrons and the Determination of Beta-Ray End-Point Energies by Absorption, Reviews of Modern Physics 24, 28-44 (1952). doi:10.1103/RevModPhys.24.28.",
    url: "https://doi.org/10.1103/RevModPhys.24.28",
    access: "Behind a subscription. The bibliographic record was confirmed through Crossref; the full text was not opened for this report, and what that limits is stated in the report itself.",
  },
  podgorsak: {
    key: "podgorsak",
    label: "IAEA STI/PUB/1196",
    cite: "Podgorsak, E. B. (ed.), Radiation Oncology Physics: A Handbook for Teachers and Students, IAEA, Vienna (2005), STI/PUB/1196, Section 2.7.4.",
    url: "https://www-pub.iaea.org/mtcd/publications/pdf/pub1196_web.pdf",
    access: "Freely published by the IAEA.",
  },
};

/** 인용한 정의 — **원문에서 옮긴 한 줄씩**. 쪽이 이것을 그려 독자가 대조할 수 있게 한다.
 *  ★ 여기 없는 값은 케이스에서 쓸 수 없다. 새 상수를 쓰려면 먼저 원문을 열어 이 표에 올린다. */
export interface Statement {
  id: string;
  /** 원문이 말하는 것 — 우리 말로 줄이지 않고 그 문장의 요지를 그대로 적는다. */
  text: string;
  source: string;
  /** 어디에 있는가. */
  locator: string;
}

export const STATEMENTS: Statement[] = [
  { id: "bq", source: "cgpm1975", locator: "Resolution 8",
    text: "The becquerel, symbol Bq, is the special name for the SI unit of activity, equal to one reciprocal second." },
  { id: "gy", source: "cgpm1975", locator: "Resolution 9",
    text: "The gray, symbol Gy, is the special name for the SI unit of absorbed dose, equal to one joule per kilogram." },
  { id: "sv", source: "si", locator: "Table 4",
    text: "The sievert, symbol Sv, is the coherent SI unit of dose equivalent, expressed in SI base units as m² s⁻², that is, joule per kilogram." },
  { id: "ckg", source: "si", locator: "Table 5",
    text: "The coherent SI unit of exposure (x- and γ-rays) is the coulomb per kilogram, C kg⁻¹." },
  { id: "ci", source: "cgpm1964", locator: "Resolution 7",
    text: "The curie is retained, outside the SI, as a unit of activity with the value 3.7 × 10¹⁰ s⁻¹; the symbol for this unit is Ci. A note records that 1 Ci = 3.7 × 10¹⁰ Bq." },
  { id: "ci-exact", source: "sp811", locator: "Appendix B.9, radiology",
    text: "curie (Ci) → becquerel (Bq): 3.7 E+10, printed in boldface, which the table defines as meaning the factor is exact." },
  { id: "rad-exact", source: "sp811", locator: "Appendix B.9, radiology",
    text: "rad → gray (Gy): 1.0 E−02, printed in boldface, that is, exact." },
  { id: "rem-exact", source: "sp811", locator: "Appendix B.9, radiology",
    text: "rem → sievert (Sv): 1.0 E−02, printed in boldface, that is, exact." },
  { id: "r-exact", source: "sp811", locator: "Appendix B.9, radiology",
    text: "roentgen (R) → coulomb per kilogram (C/kg): 2.58 E−04, printed in boldface, that is, exact." },
  { id: "prefixes", source: "si", locator: "Table 7",
    text: "SI prefixes: kilo (k) 10³, mega (M) 10⁶, giga (G) 10⁹, tera (T) 10¹², centi (c) 10⁻², milli (m) 10⁻³, micro (µ) 10⁻⁶, nano (n) 10⁻⁹, pico (p) 10⁻¹²." },
  { id: "minute", source: "si", locator: "Table 8",
    text: "1 min = 60 s." },
  { id: "litre", source: "si", locator: "Table 8",
    text: "1 l = 1 L = 1 dm³ = 10⁻³ m³." },
  { id: "wair", source: "trs398", locator: "Appendix II.2.2",
    text: "W_air is the mean energy expended in air per ion pair formed, more usually expressed as W_air/e. For dry air the value is taken to be 33.97 J/C, with a standard uncertainty estimated at 0.2%." },
  { id: "halflife-ddep", source: "ddep", locator: "per-nuclide data sheets",
    text: "Recommended half-lives with standard uncertainties, evaluated independently of the ENSDF file that this site's nuclear data are taken from. Each sheet quotes the value in the form T1/2 = value (uncertainty on the last digits), with the comma as the decimal separator and 'a' for the year." },
  { id: "ddep-transitions", source: "ddep", locator: "per-nuclide sheets, section 2.2",
    text: "Gamma transition energies with transition probabilities Pγ+ce and internal conversion coefficients αT, and for transitions above 1.022 MeV an internal pair creation coefficient απ. The photon emission probability is not tabulated directly; it follows as Pγ = Pγ+ce / (1 + αT + απ)." },
  { id: "bipm-no-gamma-constant", source: "ddep", locator: "Volume 1 (2004), introduction and full text",
    text: "The recommended data comprise half-lives, decay modes, alpha, beta, gamma, X-ray and electron emissions, and the characteristics of the transitions. No gamma-ray constant of any kind is tabulated: the words kerma, exposure and dose rate constant do not appear anywhere in the volume. The evaluation stops at the emissions, which is where the conventions end and the application-specific ones begin." },
  { id: "ornl-quantity", source: "ornl45", locator: "page 1, equations (1) and (2)",
    text: "The tabulated constant is the unshielded gamma-ray dose-equivalent rate at 1 m, computed as Γ = (1/4πR²) Σ Sᵢ D(Eᵢ) with D(E) the fluence-to-dose-rate conversion function of ANSI/ANS-6.1.1-1977. It is therefore a dose-equivalent rate constant, not an air kerma rate constant." },
  { id: "atomic-mass", source: "ame2020", locator: "file mass_1.mas20, column ATOMIC MASS (micro-u)",
    text: "The evaluated atomic mass of the neutral atom, in micro-atomic-mass-units, with its standard uncertainty. The same line also carries the mass excess in keV, from which the atomic mass follows as m = A + Δ/c²; the two columns are independent renderings of the same adjustment." },
  { id: "u-definition", source: "ame2020", locator: "file mass_1.mas20, carbon-12 line",
    text: "Carbon-12 is listed with an atomic mass of exactly 12 000 000 micro-u and zero uncertainty, which is the definition of the unified atomic mass unit." },
  { id: "isomer-energy", source: "nubase2020", locator: "file nubase_4.mas20, columns 43-54",
    text: "Isomer excitation energy in keV, with its uncertainty, for each excited state identified by the isomer index i in the four-character ZZZi field." },
  { id: "molar-mass-constant", source: "codata", locator: "molar mass constant",
    text: "molar mass constant: 1.000 000 001 05 e-3 kg mol^-1, with a standard uncertainty of 0.000 000 000 31 e-3 kg mol^-1." },
  { id: "u-energy", source: "codata", locator: "atomic mass constant energy equivalent in MeV",
    text: "atomic mass constant energy equivalent in MeV: 931.494 103 72, with a standard uncertainty of 0.000 000 29 MeV." },
  { id: "avogadro", source: "codata", locator: "Avogadro constant",
    text: "Avogadro constant: 6.022 140 76 e23 mol^-1, marked (exact)." },
  { id: "estar-csda", source: "estar", locator: "Appendix, definition of CSDA range",
    text: "CSDA range: a very close approximation to the average path length traveled by a charged particle as it slows down to rest, calculated in the continuous-slowing-down approximation. In this approximation, the rate of energy loss at every point along the track is assumed to be equal to the total stopping power. Energy-loss fluctuations are neglected. The CSDA range is obtained by integrating the reciprocal of the total stopping power with respect to energy." },
  { id: "estar-projected", source: "estar", locator: "Appendix, definitions of projected range and detour factor",
    text: "Projected range: average value of the depth to which a charged particle will penetrate in the course of slowing down to rest. This depth is measured along the initial direction of the particle. Detour factor: ratio of the projected range to the CSDA range. As the result of multiple scattering, the trajectory of the particle is wiggly rather than straight, and the detour factor is always smaller than unity." },
  { id: "estar-yield", source: "estar", locator: "Appendix, definition of radiation yield",
    text: "Radiation yield: average fraction of the initial kinetic energy of an electron that is converted to bremsstrahlung energy as a particle slows down to rest, calculated in the continuous-slowing-down approximation. Important only for electrons." },
  { id: "kerma", source: "podgorsak", locator: "Section 2.7.4, Eqs (2.29) and (2.30)",
    text: "Collision kerma in air and exposure are related by K_col = X · (W_air/e). Total air kerma is larger by the factor 1/(1 − g), where g is the fraction of the charged-particle energy lost to bremsstrahlung." },
];

export const statementById = (id: string) => STATEMENTS.find((s) => s.id === id);
