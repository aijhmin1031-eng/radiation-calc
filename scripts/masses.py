"""원자질량 수확 — AME2020(원자질량) + NUBASE2020(이성질체 들뜬에너지).

★ 왜 이 스크립트가 있나(2026-09-18, 비방사능 유효성 평가에서 잡았다):
  그전에는 비방사능을  a = ln2·N_A/(T½·A)  로 계산하며 **질량수 A 를 몰 질량으로** 썼고,
  화면·문서가 그 근사를 「모든 핵종에서 0.03% 이내」라고 적고 있었다. 실측하니
  **147 중 95 가 0.03% 를 넘었고** 최악은 H-3 의 **+0.535%** 였다(주장의 18배).
  질량수 근사의 오차는 **핵의 결합에너지**다 — A≈56 부근에서 −0.11%, 가벼운 핵에서 +0.5%.
  근사의 한계를 다시 적는 대신 **근사를 없앴다**: 실제 원자질량을 데이터에 넣는다.

★ 원자질량은 계산할 수 없다 — 측정·평가값이다. 1차 출처는 AME2020 하나이고
  그것을 **손으로 옮기지 않으려고** 이 스크립트가 있다(절대규칙 3).

★ 중성 원자의 질량을 쓴다(전자 Z개 포함). 시료는 중성 원자의 덩어리다.
★ 이성질체는 들뜬 에너지만큼 무겁다:  m = m(바닥) + E_exc/c².
  최대가 U-238m 의 2557.9 keV = 상대 1.2×10⁻⁵ — 고칠 오차의 400분의 1이지만,
  AME 불확도(≤1.4×10⁻⁷)보다는 크므로 **빼지 않고 넣는다.**

씀:  python3 scripts/masses.py            # nuclides.json 갱신 + 케이스 자료 생성
"""
import json, math, os, urllib.request

BASE = "https://www-nds.iaea.org/amdc/ame2020/"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, ".cache")

# 1 u 의 에너지 등가 — **SI 정의값에서 유도한다**(기억으로 적지 않는다).
#   m_u c² = M_u c²/N_A,  eV 로 옮기려면 e 로 나눈다. c·N_A·e 는 정의값이고
#   M_u 만 측정값이다(CODATA 2022: 1.000 000 001 05(31)×10⁻³ kg/mol).
#   NIST 표값 931.494 103 72 MeV 를 3.1×10⁻¹² 로 재현한다.
M_U_KG_PER_MOL = 1.00000000105e-3
C_M_PER_S, N_A, E_C = 299792458.0, 6.02214076e23, 1.602176634e-19
U_KEV = M_U_KG_PER_MOL * C_M_PER_S**2 / (N_A * E_C) / 1e3
LN2 = math.log(2)


def fetch(name):
    os.makedirs(CACHE, exist_ok=True)
    p = os.path.join(CACHE, name)
    if not os.path.exists(p):
        req = urllib.request.Request(BASE + name, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=180) as r, open(p, "wb") as f:
            f.write(r.read())
    return open(p, encoding="utf8", errors="replace").read().splitlines()


def read_ame():
    """AME2020 mass_1.mas20 — 고정폭 포트란. 원자질량은 micro-u 이고 i3 + f13.6 으로 쪼개져 있다."""
    out = {}
    for ln in fetch("mass_1.mas20.txt"):
        if len(ln) < 123:
            continue
        try:
            A = int(ln[14:19])
        except ValueError:
            continue
        el = ln[20:23].strip()
        if not el:
            continue
        est = "#" in ln[106:135] or "#" in ln[28:42]
        try:
            m = float(ln[106:123].replace("#", ".").replace(" ", "")) / 1e6   # u
            u = float(ln[123:135].replace("#", ".")) / 1e6                    # u
            dx = float(ln[28:42].replace("#", "."))                           # 질량결손 keV
        except ValueError:
            continue
        out[(el, A)] = {"m_u": m, "u_u": u, "excess_keV": dx, "est": est,
                        "line": " ".join(ln.split())}
    return out


def read_nubase():
    """NUBASE2020 — 이성질체 들뜬 에너지(keV). 4자리 ZZZi 의 i 가 이성질체 번호다."""
    out = {}
    for ln in fetch("nubase_4.mas20.txt"):
        if ln.startswith("#") or len(ln) < 55:
            continue
        try:
            A, Z, i = int(ln[0:3]), int(ln[4:7]), ln[7]
        except ValueError:
            continue
        if i in "0":
            continue
        exc = ln[42:54].replace("#", "").strip()
        if not exc:
            continue
        try:
            out[(Z, A, i)] = (float(exc), " ".join(ln[:68].split()))
        except ValueError:
            pass
    return out


ISO_INDEX = {"m": "1", "m1": "1", "m2": "2", "n": "2"}


def main():
    ame, nub = read_ame(), read_nubase()
    path = os.path.join(ROOT, "src/data/nuclides.json")
    D = json.load(open(path, encoding="utf8"))

    refs, fails, changed = [], [], []
    for key in sorted(D):
        n = D[key]
        g = ame.get((n["sym"], n["a"]))
        if g is None:
            fails.append(f"{key}: AME2020 에 없다")
            continue
        if g["est"]:
            fails.append(f"{key}: AME2020 추정값(#) — 쓰지 않는다")
            continue

        exc_keV, exc_line = 0.0, None
        iso = n.get("iso") or ""
        if iso:
            idx = ISO_INDEX.get(iso)
            hit = nub.get((n["z"], n["a"], idx)) if idx else None
            if hit is None:
                fails.append(f"{key}: NUBASE2020 에서 들뜬에너지를 못 찾았다 (iso={iso})")
                continue
            exc_keV, exc_line = hit

        m_u = g["m_u"] + exc_keV / U_KEV
        # 추출 점검 ① 질량결손 항등식: m = A + Δ/c²  (AME 의 서로 다른 두 열이 맞아야 한다)
        resid = abs((n["a"] + g["excess_keV"] / U_KEV) - g["m_u"]) / g["m_u"]
        if resid > 1e-9:
            fails.append(f"{key}: 질량결손 항등식 잔차 {resid:.2e} — 열을 잘못 읽었다")
            continue

        sa = LN2 * N_A / (n["t_half_s"] * m_u)
        old = n.get("sa_bq_g")
        if old:
            changed.append((abs(sa - old) / old, key))
        n["m_u"], n["sa_bq_g"] = m_u, sa
        refs.append({"nuclide": key, "a": n["a"], "mGround_u": g["m_u"], "u_u": g["u_u"],
                     "excess_keV": g["excess_keV"], "exc_keV": exc_keV, "m_u": m_u,
                     "line": g["line"], "excLine": exc_line})

    # 추출 점검 ② u 의 정의: C-12 는 정확히 12
    c12 = ame[("C", 12)]["m_u"]
    if c12 != 12.0:
        fails.append(f"C-12 = {c12!r} — u 의 정의에 어긋난다")

    if fails:
        print("중단 — " + f"{len(fails)}건:")
        for f in fails:
            print("   ", f)
        raise SystemExit(1)

    json.dump(D, open(path, "w", encoding="utf8"), separators=(",", ":"), ensure_ascii=False)
    json.dump(refs, open(os.path.join(ROOT, "src/validation/ame2020.json"), "w", encoding="utf8"),
              indent=0, ensure_ascii=False)

    changed.sort(reverse=True)
    print(f"1 u = {U_KEV:.6f} keV (유도)   ·   C-12 = {c12} (정의 확인)")
    print(f"{len(refs)} 핵종 · 비방사능 재계산. 질량수 근사 대비 변화:")
    for r, k in changed[:5]:
        print(f"   {k:9s} {r*100:+.4f}%")
    print(f"   … 중앙 {changed[len(changed)//2][0]*100:.4f}% · 최소 {changed[-1][0]*100:.4f}%")


if __name__ == "__main__":
    main()
