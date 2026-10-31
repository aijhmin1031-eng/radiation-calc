import { SOURCES } from "../validation/sources";
import { SOURCE_CITATIONS } from "../../brand";

/** ★★ `/notes/` 구역의 글 등록부 — 정본이다(2026-11-01, 판 1.1.5).
 *
 *  계기: 소유주 지시(11/01) 「이메일 홍보 말고 블로그나 하자」. Medium 글 4편은 유입이 0 이었고 Search Console 클릭만 늘고 있어
 *  글을 **우리 사이트 안에** 둔다. 검색 노출이 영어권이라 영어로 쓴다.
 *  ★ `lib/notes.ts`(Methods 「Longer notes」)와 다른 층이다. 그쪽은 주제별 긴 글이고 게시일이 없다. 여기는 **날짜가 있는 풀이 글**이고
 *    목록 쪽 · 구조화 데이터 · 게이트가 이 배열 하나를 읽는다. `lib/notes.ts` 에는 목록 쪽(`/notes/`) 한 줄만 올린다.
 *  ★ 글을 더할 때: 여기 한 줄 + `src/pages/notes/<slug>.astro` + 수치는 `note-examples.ts` · 고정은 `note-examples.test.ts`.
 *    `check-notes` ⑥~⑧ 이 양방향으로 잰다(등록부에 없는 글 · 파일 없는 등록 · 어수 900~1500 · 날짜 · 출처 · 계산기 링크). */
export interface ArticleSource { label: string; href: string }
export interface ArticleCalc { path: string; label: string; note: string }
export interface Article {
  slug: string;
  /** 검색 결과 제목 — 꼬리 「 · Radiation Lab」까지 60자 안(`check-notes` ⑧). */
  title: string;
  h1: string;
  /** 90~155자. */
  description: string;
  /** ISO 날짜. 목록은 이 값의 역순이다. */
  published: string;
  /** 수치 · 출처를 마지막으로 대조한 날. 구조화 데이터의 dateModified 도 이 값이다. */
  reviewed: string;
  /** 목록 쪽에 서는 「이 글이 답하는 질문」. */
  question: string;
  summary: string;
  sources: ArticleSource[];
  calculators: ArticleCalc[];
  /** 같은 주제의 세로 영상 주소(W4). 있으면 글 머리 아래에 링크가 선다. */
  video?: string;
}

const cite = (k: string): ArticleSource => ({ label: SOURCES[k].cite, href: SOURCES[k].url });
const IAEA: ArticleSource = { label: SOURCE_CITATIONS[0].text, href: SOURCE_CITATIONS[0].url };

export const ARTICLES: Article[] = [
  {
    slug: "radioactive-decay-worked-examples",
    title: "Radioactive decay examples: how much is left",
    h1: "How much is left? Radioactive decay worked examples",
    description:
      "Worked decay problems: the fraction left after n half-lives, Ra-228 at 1/8 or 12.3%, a Cs-137 check source corrected to today, and working backwards.",
    published: "2026-11-01",
    reviewed: "2026-11-01",
    question: "A half-life and an elapsed time are given. What fraction remains, and why can two correct answers differ?",
    summary:
      "The 2^(−t/T½) rule with a table of half-lives, a textbook Ra-228 problem solved with the printed half-life and with the evaluated one, a Cs-137 check source brought from its certificate date to today, and a Co-60 reading taken back to its certificate.",
    sources: [
      IAEA,
      cite("ddep"),
    ],
    calculators: [
      { path: "/decay/", label: "Radioactive decay calculator", note: "activity after any interval, time to a target, and a half-life from two readings" },
      { path: "/natural-series/", label: "Natural decay series", note: "what happens when the daughters grow in, which the calculator does not follow" },
      { path: "/check-sources/", label: "Nuclides for check and calibration sources", note: "why Cs-137 and Co-60 are used and what each one tests" },
    ],
  },
  {
    slug: "lu-177-decay-worked-example",
    title: "Lu-177 decay calculator: a worked example",
    h1: "Lu-177 decay calculation: a 7.4 GBq dose worked through",
    description:
      "A 7.4 GBq Lu-177 dose followed through a decay calculation: activity to order, activity at infusion, cost of a delay, and what is left at 7 and 14 days.",
    published: "2026-11-01",
    reviewed: "2026-11-01",
    question: "How much Lu-177 has to be labelled days ahead, what does a delay cost, and what is left a week or two later?",
    summary:
      "One therapy dose from calibration to storage: the activity needed for each transit time, a Monday calibration carried to a Thursday infusion, the window around a ±10% tolerance, a time-zone slip, the vial at 7 and 14 days, and why Lu-177m decides storage.",
    sources: [
      IAEA,
      { label: "European Medicines Agency, Lutathera (lutetium (177Lu) oxodotreotide): EPAR product information, for the 7.4 GBq ± 10% vial activity and the 6.647-day half-life it prints.",
        href: "https://www.ema.europa.eu/en/documents/product-information/lutathera-epar-product-information_en.pdf" },
    ],
    calculators: [
      { path: "/decay/", label: "Radioactive decay calculator", note: "any other interval, with Lu-177 or Lu-177m selected" },
      { path: "/radiopharmaceutical-decay/#lu-177", label: "Lu-177 remaining-activity table", note: "0 to 14 days at 6-hour steps, the table the percentages here are read from" },
      { path: "/units/", label: "Radiation unit converter", note: "GBq and mCi with the exact factor" },
    ],
  },
  {
    slug: "mda-worked-example",
    title: "Minimum detectable activity: worked example",
    h1: "Minimum detectable activity: an MDA calculation worked step by step",
    description:
      "An MDA calculation worked step by step with Currie's equations: L_C, L_D, turning counts into Bq, paired and well-known blanks, and where results go wrong.",
    published: "2026-11-01",
    reviewed: "2026-11-01",
    question: "What is the smallest activity a given count could reliably have seen, and how is a real result read against it?",
    summary:
      "A one-hour Cs-137 gamma count taken from background to critical level, detection limit and becquerels with the equations the MDA calculator uses, three real results read against those limits, paired against well-known blanks, and the errors that move the answer most.",
    sources: [
      cite("currie"),
      { label: "Lindstrom, R. M., commentary on Currie (1968) with its Table I of paired and well-known blank expressions, in A Century of Excellence in Measurements, Standards, and Technology, NIST Special Publication 958 (2001), 164-166.",
        href: "https://nvlpubs.nist.gov/nistpubs/sp958-lide/html/164-166.html" },
      cite("marssim"),
      { label: "Multi-Agency Radiological Laboratory Analytical Protocols Manual (MARLAP), NUREG-1576 / EPA 402-B-04-001C, July 2004. Chapter 20, Detection and Quantification Capabilities, Equations 20.8 to 20.11.",
        href: "https://www.epa.gov/radiation/marlap-manual-and-supporting-documents" },
      IAEA,
    ],
    calculators: [
      { path: "/mda/", label: "MDA calculator", note: "L_C, L_D and MDA for a fixed count with a paired blank, and scan MDC" },
      { path: "/validation/mda/", label: "MDA validation report", note: "MARSSIM's printed examples reproduced, and the difference in its constant" },
      { path: "/decay/", label: "Radioactive decay calculator", note: "carrying an MDA back to the sampling date" },
    ],
  },
];

/** 새 글이 위 — 같은 날짜는 등록 순서를 지킨다(`sort` 는 안정 정렬이다). */
export const ARTICLES_NEWEST: readonly Article[] = [...ARTICLES].sort((a, b) => b.published.localeCompare(a.published));
export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug);
export const articlePath = (a: Article) => `/notes/${a.slug}/`;
