/** 이름·주소 정본 — 한 곳이다. 쪽에서 이름을 글자로 적지 않는다.
 *  주소는 환경변수 SITE_URL 이 이기고, env 가 닿지 않는 자리는 아래 기본값을 쓴다. */
export const SITE_NAME = "RadCalc";
export const SITE_TAGLINE = "Radiation protection calculators";
export const SITE_URL_DEFAULT = "https://radiation-lab.com";
export const BASE_PATH = "/calc/";
export const UMBRELLA_NAME = "Radiation Lab";
/** 데이터 출처 — 화면과 내보내는 파일이 함께 든다(IAEA 는 출처 표기 조건이다). */
export const DATA_SOURCES = [
  { name: "IAEA Nuclear Data Section — Livechart API (ENSDF)", url: "https://nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
  { name: "NIST X-Ray Mass Attenuation Coefficients", url: "https://physics.nist.gov/PhysRefData/XrayMassCoef/cover.html" },
] as const;

/** ★★ **원천의 서지와 조건 — 원문에서 확인한 것만 적는다**(2026-09-16).
 *  「인용하는 법」을 쪽에 싣기로 하면서 두 원천의 약관을 실제로 열어 보았고, 그 과정에서
 *  이 레포가 **NIST 를 「public domain」이라고 잘못 적고 있던 것**을 잡았다.
 *  ★ IAEA 약관(nucleus.iaea.org/Pages/Others/Terms-Of-Use.aspx) — 데이터의 「use, reproduction
 *    and dissemination」을 장려하고 **상용·비상용 제품에서의 사용까지 허용**한다. 조건 둘:
 *    **출처 표기**, 그리고 **IAEA 가 보증한다고 말하거나 암시하지 않을 것.**
 *  ★★ NIST 는 다르다. 이 표는 **NIST Standard Reference Database 126** 이고 쪽에
 *    「© 1989, 1990, 1996 copyright by the U.S. Secretary of Commerce … **All rights reserved.**
 *    NIST reserves the right to charge for these data in the future.」라고 적혀 있다 —
 *    **공용저작물이 아니다**(SRD 는 15 U.S.C. §290e 로 별도 권리가 붙는다).
 *    제품에 넣어 계산에 쓰는 것과 **표 자체를 데이터셋으로 재배포하는 것은 다른 층**이다.
 *    후자를 하려면 NIST 에 확인할 것(data@nist.gov · nist.gov/srd). */
export const SOURCE_CITATIONS = [
  {
    key: "iaea",
    text: "IAEA Nuclear Data Section, Livechart of Nuclides — evaluated nuclear structure and decay data (ENSDF), International Atomic Energy Agency, Vienna.",
    url: "https://nds.iaea.org/relnsd/vcharthtml/VChartHTML.html",
    terms: "Used with acknowledgement under the IAEA website terms of use, which permit reproduction and dissemination of IAEA data provided the IAEA is credited as the source. The IAEA does not endorse this site, its methods or its results.",
  },
  {
    key: "nist",
    text: "J. H. Hubbell and S. M. Seltzer, Tables of X-Ray Mass Attenuation Coefficients and Mass Energy-Absorption Coefficients from 1 keV to 20 MeV for Elements Z = 1 to 92 and 48 Additional Substances of Dosimetric Interest, NISTIR 5632, NIST Standard Reference Database 126, National Institute of Standards and Technology, Gaithersburg MD (data content last updated July 2004).",
    url: "https://doi.org/10.18434/T4D01F",
    terms: "NIST Standard Reference Database 126, \u00a9 1989, 1990, 1996 by the U.S. Secretary of Commerce on behalf of the United States of America, all rights reserved. Used here for computation with attribution. NIST does not endorse this site and makes no warranty as to the accuracy of any result derived from these data.",
  },
] as const;
