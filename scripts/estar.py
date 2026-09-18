"""전자 저지능·비정 수확 — NIST ESTAR.

★ 왜 필요한가(2026-09-19, 베타 유효성 평가): 베타 도구의 세 경험식(Katz–Penfold 비정 ·
  질량흡수계수 · 제동복사 수율)은 **정의도 아니고 평가된 핵자료도 아니다.** 「맞는가」를
  물을 대상이 없으면 검증이 성립하지 않으므로, **독립한 근대 자료**를 들여 잔차를 잰다.

★★ **양을 섞지 않는 것이 이 자료를 쓰는 전부다.**
  · ESTAR 의 `CSDA range` 는 **경로길이**다(전자가 실제로 지나간 길의 총합).
    Katz–Penfold 의 R 은 흡수곡선에서 얻은 **투사비정**이라 산란 때문에 늘 더 짧다.
    둘의 비가 **우회인자**이고, 그 차이는 오차가 아니라 물리다. 감마 라운드의 Γ 와 같은 함정이다.
  · ESTAR 의 `radiation yield` 는 **단일에너지 전자**가 낸 제동복사 분율이다.
    우리 식 f = 3.5e-4·Z·E_max 는 **베타 스펙트럼**에 대한 어림이다 — 스펙트럼의 평균이
    E_max/3 쯤이므로 두 값이 다른 것이 정상이다. **절대값 대신 Z 의존성**을 대조한다.

★ 여섯 흡수체는 도구 화면의 것과 같다(`Beta.tsx` 의 ABSORBERS).
  유리는 ESTAR 의 `Glass, Plate`(171)를 쓴다.

씀:  python3 scripts/estar.py     # src/validation/estar.json 생성
"""
import json, os, re, urllib.request

URL = "https://physics.nist.gov/cgi-bin/Star/e_table.pl"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, ".cache")

# 도구의 흡수체 → (ESTAR 재료번호, 화면이 쓰는 Z, ESTAR 재료명)
MATERIALS = {
    "acrylic":  ("223", 6.5, "Polymethyl Methacralate (Lucite, Perspex)"),
    "water":    ("276", 7.4, "Water, Liquid"),
    "glass":    ("171", 11,  "Glass, Plate"),
    "aluminum": ("013", 13,  "Aluminum"),
    "iron":     ("026", 26,  "Iron"),
    "lead":     ("082", 82,  "Lead"),
}


def fetch(matno):
    os.makedirs(CACHE, exist_ok=True)
    p = os.path.join(CACHE, f"estar-{matno}.html")
    if not os.path.exists(p):
        b = "----estar"
        body = "".join(
            f"--{b}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n"
            for k, v in (("matno", matno), ("GraphType", "None"), ("ShowDefault", "on"))
        ) + f"--{b}--\r\n"
        req = urllib.request.Request(URL, data=body.encode(), headers={
            "Content-Type": f"multipart/form-data; boundary={b}",
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://physics.nist.gov/PhysRefData/Star/Text/ESTAR.html"})
        with urllib.request.urlopen(req, timeout=180) as r, open(p, "wb") as f:
            f.write(r.read())
    return open(p, encoding="utf8", errors="replace").read()


def rows(html):
    """열 일곱: E · 충돌 · 복사 · 전체 저지능 · CSDA 비정 · 복사수율 · 밀도효과.
    ★ 표가 <td> 없이 이어 붙어 나오므로 **지수표기 토큰을 세어** 자른다.
      7 로 나누어떨어지지 않으면 형식이 바뀐 것이니 멈춘다(조용히 어긋난 표를 쓰지 않는다)."""
    n = re.findall(r"\d\.\d{3}E[+-]\d{2}", re.sub(r"<[^>]+>", "\n", html))
    if not n or len(n) % 7:
        raise SystemExit(f"ESTAR 표 형식이 바뀌었다 — 토큰 {len(n)}개, 7로 나눈 나머지 {len(n) % 7}")
    return [[float(x) for x in n[i:i + 7]] for i in range(0, len(n), 7)]


def main():
    out = {}
    for name, (matno, z, label) in MATERIALS.items():
        r = rows(fetch(matno))
        out[name] = {"matno": matno, "z": z, "estarMaterial": label,
                     # [E MeV, CSDA g/cm², 복사수율] 만 싣는다 — 쓰지 않는 열은 들이지 않는다.
                     "rows": [[x[0], x[4], x[5]] for x in r]}
        print(f"  {name:9s} {label:44s} {len(r)}행  "
              f"E {r[0][0]:.4g}–{r[-1][0]:.4g} MeV")
    p = os.path.join(ROOT, "src/validation/estar.json")
    json.dump(out, open(p, "w", encoding="utf8"), separators=(",", ":"))
    print(f"\n{p} · {os.path.getsize(p):,} B")


if __name__ == "__main__":
    main()
