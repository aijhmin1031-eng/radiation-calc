import re, html, json, urllib.request, sys
# NIST X-Ray Mass Attenuation Coefficients — 미국 정부 저작물(public domain)
BASE="https://physics.nist.gov/PhysRefData/XrayMassCoef/"
def fetch(u):
    r=urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"})
    return urllib.request.urlopen(r,timeout=40).read().decode("utf8","replace")
def parse(h):
    t=re.sub(r'<[^>]+>',' ',h); t=html.unescape(t); t=re.sub(r'[ \t]+',' ',t)
    # 행: E(MeV)  mu/rho  mu_en/rho  — 과학표기 3개가 연달아 오는 자리
    rows=re.findall(r'(\d\.\d{4,5}E[+-]\d\d)\s+(\d\.\d{3}E[+-]\d\d)\s+(\d\.\d{3}E[+-]\d\d)',t)
    return [[float(a),float(b),float(c)] for a,b,c in rows]
MAT={"air":"ComTab/air.html","water":"ComTab/water.html","concrete":"ComTab/concrete.html",
     "lead":"ElemTab/z82.html","iron":"ElemTab/z26.html","tungsten":"ElemTab/z74.html",
     "aluminum":"ElemTab/z13.html","copper":"ElemTab/z29.html"}
out={}
for k,p in MAT.items():
    try:
        rows=parse(fetch(BASE+p))
        out[k]=rows
        print(f"{k:10s} {len(rows):3d}행  {rows[0][0]:.0e}~{rows[-1][0]:.0f} MeV", flush=True)
    except Exception as e:
        print(f"{k:10s} 실패 {e}", flush=True)
json.dump(out,open("nist_muen.json","w"))
print("\n저장 nist_muen.json", sum(len(v) for v in out.values()), "행")
