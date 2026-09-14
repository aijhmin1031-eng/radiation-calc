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
