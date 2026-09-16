# Zenodo 준비 — DOI 를 붙이기 전에 정할 것과 확인한 것

★ 이 문서는 **작업 전 점검표**다. 두 가지가 소유주 결정이고, 그 둘이 정해지기 전에는 올리지 않는다.

---

## 0. 아직 막혀 있는 것 — **저자 이름 하나**

라이선스는 정해졌다(**MIT**, 2026-09-16). 남은 것은 저자다.

### 필드마다 사정이 다르다

| 항목 | Zenodo | `CITATION.cff` | 판단 |
|---|---|---|---|
| **이름** | **필수** | **필수** | 실명. **발표될 로마자 표기를 소유주가 정한다** |
| **소속(affiliation)** | 선택(관행상 필수) | 선택 | `Korean Association for Radiation Application (KARA), Seoul, Republic of Korea` |
| **ORCID** | 선택 | 선택 | 권장 — 동명이인과 갈린다. 없으면 <https://orcid.org> 에서 5분 |
| **국가** | **창작자 필드가 없다** | 선택 | 소속에 이미 들어간다. 따로 넣지 않는다 |
| **주소(번지)** | **없다** | 선택 | ⚠️ **넣지 않기를 권한다** — 아래 |

· ★★ **DOI 기록은 영구 보관이고 지울 수 없다.** 학술 관행에서 저자에게 필요한 것은
  **이름 + 소속**이고 번지를 적는 경우는 거의 없다. 소속 기관명만으로 국가·기관이 다 식별된다.
  개인 주소를 영구 공개 기록에 넣는 것은 되돌릴 수 없는 선택이므로 기본값으로 두지 않는다.
· ★★ **로마자 표기는 짐작하지 않는다.** 계정 메일에서 머리글자까지는 보이지만
  `Min, Jae-Hyun` · `Jaehyun Min` · `Min Jae Hyun` 중 어느 것인지는 **본인이 쓰는 표기가 정본**이다.
  한 번 박히면 바꿀 수 없다.
· 기관명은 확인했다 — `ri.or.kr` 은 **한국방사선진흥협회**(Korean Association for Radiation
  Application, KARA), 서울 성동구 성수일로 77 서울숲IT밸리.

### 채울 자리 (두 파일, 값은 같아야 한다)

`CITATION.cff`
```yaml
authors:
  - family-names: "Min"            # ← 성(姓) 로마자
    given-names: "Jae-Hyun"        # ← 이름 로마자 — 본인 표기로
    affiliation: "Korean Association for Radiation Application (KARA), Seoul, Republic of Korea"
    orcid: "https://orcid.org/0000-0000-0000-0000"   # 없으면 이 줄을 지운다
```

`.zenodo.json`
```json
"creators": [
  { "name": "Min, Jae-Hyun",
    "affiliation": "Korean Association for Radiation Application (KARA), Seoul, Republic of Korea",
    "orcid": "0000-0000-0000-0000" }
]
```
★ Zenodo 의 `name` 은 **`성, 이름`** 꼴이다. ORCID 는 **주소 없이 숫자만** 넣는다.
★ 위 값은 **꼴을 보이는 예시**다 — 실제 표기로 바꾸기 전에는 올리지 않는다.

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

## 3. 라이선스 — **MIT** (2026-09-16 소유주 결정)

코드와 데이터에 **같은 라이선스(MIT)** 를 쓴다. 처음 권고는 코드 MIT · 데이터 CC BY 4.0 이었으나
소유주가 MIT 하나로 정했다.

· **알아 둘 것 하나** — MIT 는 소프트웨어 라이선스라 조문이 「Software」를 가리킨다. 데이터에 붙여도
  동작하고 실제로 흔하지만, **CC BY 와 달리 인용이 조건이 아니다.** MIT 는 「저작권 고지를 사본에
  남길 것」만 요구하는데, **논문은 파일 머리글을 들고 다니지 않는다.** 즉 학술 인용을 라이선스로
  강제할 수는 없다 — 대신 `CITATION.cff` 와 `/methods/` 의 「How to cite」가 그 일을 맡는다.
  (인용을 라이선스 조건으로 걸고 싶어지면 데이터만 CC BY 4.0 으로 바꾸면 된다. 한 줄이다.)

★★ **우리가 라이선스할 수 있는 것은 우리 기여분뿐이다.** IAEA 원자료에 우리가 조건을 붙일 수는
없다 — `LICENSE` 파일 아래쪽에 **적용 범위(SCOPE)** 를 붙여 그 사실과 두 원천의 조건을 함께 적었다.

★ `LICENSE` 의 저작권자를 **`Radiation Lab`**(사이트 이름)으로 두었다 — 사이트에 개인 이름이 없어
  지어내지 않았다. 실명으로 바꾸려면 그 한 줄만 고치면 된다.

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
- [x] 라이선스를 정하고 `LICENSE` 파일을 두었다 — **MIT**
- [ ] `src/data/attenuation.json` 이 배포물에 **빠져 있다**(2절)
- [ ] IAEA 출처·보증 문구가 배포물 README 에 있다
- [ ] 이력에 평문 비밀이 없다
- [ ] `npm test` 와 `npm run gate` 가 그 커밋에서 통과한다
