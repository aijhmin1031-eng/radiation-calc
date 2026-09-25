/** ★ 읽을 글 등록부 — 정본이다(2026-09-26 신설).
 *
 *  계기: 소유주가 화면에서 잡았다 — 「Shield materials for beta emitters … 이건 랜딩페이지에서
 *  어디로 어디로 들어와야 해? 찾기가 힘드네」. 실측하니 **허브에서 가는 길이 0개**였고,
 *  닿는 유일한 경로가 `/beta/`(도구 쪽) **본문 산문 속의 링크 한 개**였다.
 *
 *  ★★★ **「고아가 아니다」와 「찾을 수 있다」는 다른 층이다.**
 *    이 쪽 셋을 세울 때 나는 「고아 쪽을 만들지 않는다 — 베타 도구·methods·서로에서 잇는다」를
 *    확인하고 통과시켰다. **들어오는 링크가 1개 이상인 것은 맞았다.** 그런데 그 검사는
 *    **허브에서 닿는가**를 묻지 않는다. 앞엣것만 재고 뒤엣것을 잰 것처럼 넘어간 것이다.
 *
 *  ★★ **왜 별도 등록부인가.** `TOOLS` 에 끼워 넣을 수 없다 — 그 배열은 **계산기**의 정본이고
 *    `assumes`·`excludes`·`checked`(신뢰도 삼항)와 입력 요구(`needs`)를 든다. 읽을 글에는
 *    그중 무엇도 뜻이 없고, 억지로 채우면 **도구 카드가 말하는 것이 무엇인지 흐려진다.**
 *    허브가 두 목록을 **다른 구획으로** 그리는 것이 읽는 사람에게도 맞다 —
 *    하나는 **쓰는 것**이고 하나는 **읽는 것**이다.
 *
 *  ★ **글을 늘릴 때 여기만 추가한다.** 허브 구획과 게이트가 같은 배열을 읽으므로,
 *    등록하지 않은 쪽은 **게이트가 「허브에서 닿지 않는다」로 잡지 못한다** —
 *    그래서 새 읽을 글을 만들면 **먼저 여기에 적는다.**
 */
export interface Note {
  /** base 없는 정본 경로. 끝 슬래시까지 적는다(이 레포는 Astro 라 그것이 정본이다). */
  path: string;
  /** 허브 카드의 제목. 쪽의 h1 과 같을 필요는 없다 — 목록에서는 짧아야 한다. */
  name: string;
  /** 「이 글이 답하는 질문」. 목록에서 고르는 근거가 된다. */
  question: string;
  /** 한 줄 설명. 새 주장을 만들지 않는다 — 그 쪽이 이미 말하는 범위 안이다. */
  blurb: string;
}

export const NOTES: Note[] = [
  {
    path: "/daughter-shielding/",
    name: "When the thing to shield is the daughter",
    question: "The parent is weak but the shield still has to be thick — why?",
    blurb:
      "Nuclides whose decay product is the harder radiation, which of them reach equilibrium " +
      "fast enough for it to matter, and where a sheet calculated for the parent alone is wrong.",
  },
  {
    path: "/beta-shield-materials/",
    name: "Shield materials for beta emitters",
    question: "How thick, and made of what?",
    blurb:
      "Why a low-Z material goes first and a high-Z one only behind it, what that order costs " +
      "in bremsstrahlung, and the endpoint energies the thickness follows from.",
  },
  {
    path: "/dataset-limits/",
    name: "What this dataset cannot tell you",
    question: "Where does the answer stop being trustworthy?",
    blurb:
      "The edges of the nuclide and attenuation data, counted from the data itself rather than " +
      "written down — so the statement cannot go stale while the dataset grows.",
  },
];
