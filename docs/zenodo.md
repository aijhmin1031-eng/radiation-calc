# Zenodo 준비 — DOI 를 붙이기 전에 정할 것과 확인한 것

★ 이 문서는 **작업 전 점검표**다. 두 가지가 소유주 결정이고, 그 둘이 정해지기 전에는 올리지 않는다.

---

## 0. 아직 막혀 있는 것 둘 (소유주 결정)

| | 무엇을 정해야 하나 | 왜 내가 못 정하나 |
|---|---|---|
| **저자 이름** | Zenodo 는 사람 이름을 요구한다(소속·ORCID 는 선택) | 사이트 어디에도 개인 이름이 없다. **지어내지 않는다** |
| **라이선스** | 우리 기여분에 붙일 것 — 코드와 데이터가 다를 수 있다 | 법적 선언이다. 권고안은 아래 3절 |

ORCID 가 없으면 `orcid.org` 에서 5분이면 만든다 — 있으면 인용이 사람에게 정확히 붙는다.

---

## 1. ★★ 원천 조건을 원문에서 확인했다 — 계획이 바뀌었다

「데이터셋을 통째로 올린다」가 처음 생각이었는데, **두 원천의 조건이 서로 다르다.**

### IAEA — 재배포를 명시적으로 허용한다

[IAEA 웹사이트 이용약관](https://nucleus.iaea.org/Pages/Others/Terms-Of-Use.aspx) 원문:

> the IAEA is committed to making its content freely available and **encourages the use, reproduction
> and dissemination** of the text, multimedia and **data** presented. Content may be **adapted,
> translated, copied, printed and downloaded** for private study, research and teaching purposes,
> **and for use in commercial and non-commercial products or services**, provided that **appropriate
> acknowledgement of the IAEA as the source is given** and that the IAEA's endorsement of users'
> views, products or services **is not stated or implied in any way.**

→ 조건 둘: **출처 표기**, **보증 암시 금지**. 둘 다 이미 지키고 있다(`/methods/` 의 「How to cite」).

### NIST — 공용저작물이 **아니다**

[NIST X-Ray Mass Attenuation Coefficients](https://www.nist.gov/pml/x-ray-mass-attenuation-coefficients) 쪽 원문:

> **NIST Standard Reference Database 126** … © 1989, 1990, 1996 copyright by the U.S. Secretary of
> Commerce on behalf of the United States of America. **All rights reserved. NIST reserves the right
> to charge for these data in the future.**

★★ **이 레포는 이것을 「public domain」이라고 적고 있었다**(2026-09-16 정정). 미국 정부 저작물의
공용 원칙(17 U.S.C. §105)은 **SRD 에 적용되지 않는다** — SRD 는 **15 U.S.C. §290e** 로 별도 권리가 붙는다.

→ **제품에 넣어 계산에 쓰는 것**(지금 하는 것)과 **표 자체를 데이터셋으로 재배포하는 것**은 다른 층이다.

---

## 2. 그래서 무엇을 올리고 무엇을 안 올리나

| 올릴 것 | 근거 |
|---|---|
| **우리가 쓴 코드** — `src/engine/`(스펙트럼 차폐 포함)·게이트·수확 스크립트 | 우리 저작물 |
| **우리가 계산한 결과** — 96핵종 × 7물질의 반가층·십가층·TVL/HVL 비, 선별 커마 기여도 | **파생 결과**이고 이 작업의 알맹이다 |
| **IAEA 에서 파생한 핵종 표**(반감기·방출선·비방사능) | IAEA 약관이 허용. 출처·보증 문구를 함께 싣는다 |
| **방법 문서** — 수확의 함정 여섯, 검증 69건 | 우리 저작물 |

| **올리지 않을 것** | 근거 |
|---|---|
| **NIST μ/ρ 원표**(`src/data/attenuation.json`) | SRD 126, all rights reserved. 대신 **`scripts/nist.py` 를 함께 올려** 쓰는 사람이 직접 받게 한다 |

★ 이렇게 하면 재현이 막히지 않는다 — 스크립트 한 번 돌리면 같은 표가 생긴다.
★ 정말로 표까지 넣고 싶으면 **NIST 에 먼저 확인**한다(`data@nist.gov` · <https://www.nist.gov/srd>).
  답이 오기 전에는 넣지 않는다.

---

## 3. 라이선스 권고 (소유주 결정)

**갈라서 붙이는 것을 권한다** — 코드와 데이터는 성질이 다르다.

| 대상 | 권고 | 이유 |
|---|---|---|
| 코드(`src/engine/`·스크립트·게이트) | **MIT** | 짧고, 누구나 알고, 인용 의무가 없어 마찰이 없다 |
| 우리가 만든 데이터(파생 결과·핵종 표) | **CC BY 4.0** | 데이터에는 이쪽이 관행이고, **출처 표기가 조건**이라 인용이 늘어난다 |

★★ **우리가 라이선스할 수 있는 것은 우리 기여분뿐이다.** IAEA 원자료에 우리가 라이선스를 붙일 수는
없다 — 기록에 이렇게 적는다: 「파생 데이터의 라이선스는 이 기여분에 적용되고, 바탕이 된 평가 자료는
IAEA NDS(ENSDF)의 것이며 IAEA 약관에 따라 출처를 밝히고 쓴다.」

---

## 4. 절차

1. **GitHub 저장소를 공개로 전환**한다(지금 비공개다). Zenodo 의 GitHub 연동은 공개 저장소만 본다.
   · ★ 전환 전에 이력 전체에 평문 비밀이 없는지 확인할 것 — `git log -p | grep -iE 'api[_-]?key|token|secret'`
   · ★ `secret` 레포는 **절대 공개 금지**(그 레포 `CLAUDE.md` 절대규칙 4).
2. Zenodo 에 로그인(ORCID 나 GitHub 계정) → **Settings → GitHub** → 저장소 스위치를 켠다.
3. 저장소에 `CITATION.cff` 와 `.zenodo.json` 을 둔다(이 레포에 준비해 두었다 — 이름·라이선스만 채우면 된다).
4. GitHub 에서 **Release** 를 만든다(`v1.0.0`). Zenodo 가 그 시점의 사본을 보관하고 **DOI 를 발급**한다.
5. 발급된 DOI 를 `/methods/` 의 「How to cite」에 넣는다(지금은 「버전 번호가 아직 없다」고 적혀 있다).
6. README 에 DOI 배지를 단다.

★ Zenodo 는 **개념 DOI**(항상 최신)와 **판본 DOI**(그 릴리스)를 함께 준다. 쪽에는 **개념 DOI** 를 싣는다.

---

## 5. 올리기 전 점검

- [ ] 저자 이름·소속·ORCID 가 `CITATION.cff` 와 `.zenodo.json` 에 들어갔다
- [ ] 라이선스를 정하고 `LICENSE` 파일을 두었다
- [ ] `src/data/attenuation.json` 이 배포물에 **빠져 있다**(2절)
- [ ] IAEA 출처·보증 문구가 배포물 README 에 있다
- [ ] 이력에 평문 비밀이 없다
- [ ] `npm test` 와 `npm run gate` 가 그 커밋에서 통과한다
