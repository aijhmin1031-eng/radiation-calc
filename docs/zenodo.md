# Zenodo — DOI 발급 기록과 절차 정본

★★ **끝났다**(2026-09-16). 개념 DOI **`10.5281/zenodo.22794265`** · 판본 DOI(v1.0.1)
`10.5281/zenodo.22794266` · 기록 <https://zenodo.org/records/22794266>.
화면 정본은 `brand.ts` 의 `DOI`/`DOI_URL` 한 곳이고 `/methods/`·`README`·`CITATION.cff` 가 그것을 든다.

★ 아래는 **그때 정한 것과 확인한 것**이고, 다음 릴리스·다음 레포를 위한 절차 정본이다.

---

## 0. 정해진 것과 남은 것

| | 상태 |
|---|---|
| **라이선스** | **MIT** (2026-09-16 소유주 결정). `LICENSE` 에 적용 범위를 덧붙였다 — 3절 |
| **저자** | **Min, Jeho** — **소속은 넣지 않는다**(개인 작업, 아래) |
| ORCID | 아직 없음 — 있으면 두 파일에 한 줄씩 더한다(동명이인과 갈린다. <https://orcid.org> 에서 5분) |
| **저장소 공개 전환** | **끝났다**(2026-09-16). Zenodo 연동 조건이었다 — 4절 |
| **GitHub 릴리스** | **`v1.0.1`**(커밋 `8923f6f`). `v1.0.0` 은 스위치 전이라 Zenodo 에 닿지 않았다 — 4절 ★★ |
| **DOI** | **발급됨**(2026-09-16). 개념 `10.5281/zenodo.22794265` · 판본 `…266`(v1.0.1) |

### 저자 칸에 무엇을 넣고 무엇을 넣지 않았나

| 항목 | Zenodo | `CITATION.cff` | 우리 선택 |
|---|---|---|---|
| 이름 | 필수 | 필수 | `Min, Jeho` |
| 소속 | 선택 | 선택 | **비움** — 개인 작업이다 |
| ORCID | 선택 | 선택 | 아직 없음 |
| 국가 | **필드가 없다** | 선택 | **넣지 않는다** — 소속에 들어간다 |
| 주소(번지) | **없다** | 선택 | **넣지 않는다** — 아래 |

· ★★ **DOI 기록은 영구 보관이고 지울 수 없다.** 학술 관행에서 저자에게 필요한 것은
  **이름 + 소속**이고 번지를 적는 경우는 거의 없다. 소속 기관명으로 국가·기관이 다 식별된다.
  개인 주소를 영구 공개 기록에 넣는 것은 되돌릴 수 없으므로 넣지 않는다.
· ★ **표기를 바꾸려면 지금이다.** `Min, Jeho` 대신 `Min, Je-Ho` 로 쓰는 표기도 흔하다 —
  DOI 가 발급된 뒤에는 그 기록의 저자명을 고칠 수 없다. 두 파일(`CITATION.cff` · `.zenodo.json`)의
  값은 **항상 같아야 한다.**
· ★★ **소속을 비운 이유**(2026-09-16 소유주 확인: 「내 개인적인 작품이야. kara와는 상관없어」).
  처음에는 계정 도메인에서 확인한 기관명을 넣었는데, **개인 작업에 근무처를 적으면 그 기관이
  뒤를 받친다는 인상**을 준다. 이 저장소가 IAEA·NIST 에 대해 「보증하지 않는다」를 명시한 것과
  **같은 이유**로 여기서도 암시하지 않는다. 기관 일로 바뀌면 그때 `affiliation:` 한 줄을 넣는다.
· ★ `LICENSE` 의 저작권자는 **`Jeho Min`**(개인)이고, 같은 확인으로 **이대로 간다.**

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

★ `LICENSE` 의 저작권자는 **`Jeho Min`** 이다(2026-09-16 소유주 확인: 「내 개인적인 작품이야.
  kara와는 상관없어」). 처음에는 사이트 이름 `Radiation Lab` 으로 두었는데 — 사이트에 개인
  이름이 없어 지어내지 않았다 — 소유주가 개인 명의로 정했다. **기관명은 넣지 않는다**:
  저자 칸에 소속을 뺀 것과 같은 이유다(0절).

---

## 4. 절차

1. **GitHub 저장소를 공개로 전환**한다. Zenodo 의 GitHub 연동은 공개 저장소만 본다
   (연동 화면이 직접 적는다: 「Private repositories are not supported」).
   · ★ 전환 전에 이력 전체에 평문 비밀이 없는지 확인할 것 — `git log -p | grep -iE 'api[_-]?key|token|secret'`
   · ★ `secret` 레포는 **절대 공개 금지**(그 레포 `CLAUDE.md` 절대규칙 4).
2. Zenodo 에 로그인(ORCID 나 GitHub 계정) → **Settings → GitHub** → 저장소 스위치를 **ON** 으로 켠다.
   켜지면 그 저장소가 위쪽 **`Enabled Repositories`** 묶음으로 올라간다 — **그 묶음에 있는지로 확인한다.**
3. 저장소에 `CITATION.cff` 와 `.zenodo.json` 을 둔다(둘의 값이 어긋나면 안 된다).
4. GitHub 에서 **Release** 를 만든다(`v1.0.0`). Zenodo 가 그 시점의 사본을 보관하고 **DOI 를 발급**한다.
5. 발급된 DOI 를 `/methods/` 의 「How to cite」에 넣는다(지금은 「버전 번호가 아직 없다」고 적혀 있다).
6. README 에 DOI 배지를 단다.

★ Zenodo 는 **개념 DOI**(항상 최신)와 **판본 DOI**(그 릴리스)를 함께 준다. 쪽에는 **개념 DOI** 를 싣는다.

### ★★ 2번이 4번보다 **먼저**여야 한다 — 순서를 어겨 한 번 헛돌았다 (2026-09-16)

`v1.0.0` 을 게시하고 기다렸는데 Zenodo 에 아무것도 나타나지 않았다. 공개 API 를 네 가지
질의(`"spectrum-solved shielding"` · `"radiation-calc"` · `creators.name:"Min, Jeho"` · `"RadCalc"`)로
찾아 **전부 0건**이었다. 그때 Zenodo 가 **「slowness and intermittent outages」** 공지를 띄우고 있어서
**장애로 인한 지연이라고 읽었다 — 틀렸다.** 소유주가 연동 화면을 캡처해 보내자 원인이 한눈에 보였다:
`radiation-calc` 의 스위치가 **아직 `OFF`** 였고 `Enabled Repositories` 가 비어 있었다.

· **왜 그러면 안 되나**: 스위치를 켜는 동작이 곧 **GitHub 웹훅을 그 저장소에 설치하는 것**이다.
  스위치가 꺼져 있으면 웹훅이 없고, **릴리스 이벤트가 Zenodo 에 아예 도달하지 않는다.**
  Zenodo 는 지난 릴리스를 거슬러 올라가 주워 오지 않는다 — **켠 뒤에 게시된 릴리스만** 받는다.
· **복구**: 스위치를 켠 뒤 **릴리스 이벤트를 한 번 더 일으킨다.** 둘 중 하나다 —
  ① 그 릴리스를 지우고 **같은 태그로 다시 게시**한다(버전 번호가 `v1.0.0` 그대로 남는다. 태그는
    지우지 않아도 되고, 「Create release from existing tag」로 다시 만든다), 또는
  ② **다음 태그로 새 릴리스**를 만든다(지우지 않아 안전하지만 「1.0.1 이 뭐가 바뀐 건가」가 남는다).
· ★★ **관측 하나로 원인을 단정하지 말 것.** 「0건」은 ㉠ 아직 색인 전 ㉡ 애초에 도달 안 함 —
  **둘 다와 맞는다.** 마침 눈에 띄던 장애 공지가 ㉠ 쪽 이야기를 그럴듯하게 만들어 주었지만,
  그 공지는 **우리 기록이 왜 없는지에 대한 증거가 아니다.** 갈랐어야 할 것은
  **웹훅이 설치되어 있는가**(= `Enabled Repositories` 에 있는가)이고, 그것은 기다림이 아니라
  **한 번의 확인**으로 끝난다. 결과가 안 보일 때는 **결과를 다시 조회하지 말고 경로를 점검한다.**
· ★ 같은 화면에서 **저장소 목록이 낡아 있을 수 있다** — 최근에 공개로 바꿨거나 새로 만든
  저장소가 안 보이면 오른쪽 위 **`Sync now`** 를 누른다.

---

## 5. 올리기 전 점검

- [x] 저자 이름이 `CITATION.cff` 와 `.zenodo.json` 에 들어갔다 — **소속은 일부러 뺐다**(0절). ORCID 는 아직 없다
- [x] **저장소를 공개로 전환**했다
- [x] ★★ **Zenodo 스위치가 `Enabled Repositories` 에 올라와 있다** — 릴리스보다 **먼저**(4절 ★★)
- [x] 라이선스를 정하고 `LICENSE` 파일을 두었다 — **MIT**
- [x] **데이터셋 배포물**(`dist-dataset/`)에 `src/data/attenuation.json` 이 **빠져 있다**(2절)
- [x] ★★ **레포 zip 에는 그 파일이 들어 있고, 고지 문구가 그 사실과 맞는다** — 6절
- [x] IAEA 출처·보증 문구가 배포물 README 에 있다
- [x] 이력에 평문 비밀이 없다
- [x] `npm test`(69/69) 와 `npm run gate`(exit 0) 가 그 커밋에서 통과한다

---

## 6. ★★ 「재배포하지 않는다」고 적고 있었다 — 릴리스 직전에 잡았다 (2026-09-16)

스위치를 켜고 다시 릴리스하기 전에 **그때 영구 보관될 것**을 훑다가 나왔다.

**`LICENSE`·`.zenodo.json`·`CITATION.cff`·릴리스 본문** 넷이 NIST 표를 두고
**「are not redistributed」**라고 적고 있었다. 그런데 `src/data/attenuation.json` 은
`scripts/nist.py` 가 NIST 쪽에서 긁어 그대로 적어 둔 **표 자체**다 —
8종 재료 × 36~53행 × (에너지, μ/ρ, μen/ρ).

· **왜 이제야 문제가 되나**: 그 문장은 **데이터셋 배포물**(`dist-dataset/`, 2절)을 두고 쓴 것이고
  거기서는 사실이다(`make-dataset.mjs` 의 수치 지문 검사가 지킨다). 그런데 Zenodo 가 보관하는
  것은 **레포 zip 전체**다. 그대로 릴리스했으면 **「여기 없다」고 적힌 기록의 파일 안에 그것이
  들어 있는** 자기모순이 **지울 수 없는 기록**에 박혔다.
· **고친 것은 데이터가 아니라 문구다.** 「제품에 넣어 계산에 쓰는 것과 표를 데이터셋으로
  재배포하는 것은 다른 층」이라는 판단(1~2절)은 그대로다. 바꾼 것은 **상자에 무엇이 들었는지를
  정확히 적은 것**이다 — 「그 파일은 **NIST 조건이 덮고 MIT 가 덮지 않는다**, 데이터셋으로
  내놓는 것이 아니며, 정본 표는 NIST 에서 받을 것」.
· 함께 나온 것 하나: **`scripts/nist.py` 머리 주석이 아직 「미국 정부 저작물(public domain)」**
  이었다. 9/16 에 README·`brand.ts`·`/methods/` 를 정정하면서 **이 파일만 빠졌다.**
  ★ **「옛 주장 전수 삭제」는 주석까지다** — 주석은 grep 에서 잊기 쉽다.

★★ **되돌릴 수 없는 일 앞에서는 「무엇이 나가는가」를 한 번 더 읽는다.** 이 결함은
**게이트가 잡을 수 있는 종류가 아니다** — 「`LICENSE` 의 문장이 레포 안의 파일과 맞는가」는
사람이 원문을 읽어야 나온다. 배포·공개·발급처럼 **무르기 어려운 단계 직전**에는
통과 로그가 아니라 **산출물 자체**를 펴 볼 것.

### 보관된 것을 실제로 확인했다

발급 뒤 기록의 zip 을 **내려받아 열어** 대조했다(`zenodo.org/api/records/22794266/files/…`) —
루트가 `…-8923f6f`(고침이 든 커밋)이고, `LICENSE` 에 옛 문장이 **없고** 새 문구가 **있으며**,
저작권자가 `Jeho Min`, `CITATION.cff` 에도 옛 문장이 없다. 파일 296개.
★ **발급됐다는 것과 옳은 것이 보관됐다는 것은 다른 주장이다** — 뒤엣것은 열어 봐야 안다.

### Zenodo 공개 API 를 부를 때

**파이썬 `urllib` 은 403 이 난다**(User-Agent 로 막는다). **`curl` 은 200 이다.**
이 컨테이너의 프록시 탓으로 오해하기 쉬운데 `__agentproxy/status` 의 `recentRelayFailures` 는
비어 있었다 — **막은 것은 상대 쪽이다.** 기록 조회는 `curl` 로 한다.
