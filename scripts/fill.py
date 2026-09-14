"""순수 베타·알파 방출체 보충 — decay_rads 는 감마가 없으면 빈 응답이라
   dataset 에서 통째로 빠진다(Sr-90·H-3·C-14·Ni-63 …). ground_states 로 채운다."""
import csv, io, json, math, time, urllib.request
def get(f,n):
    u=f"https://nds.iaea.org/relnsd/v1/data?fields={f}&nuclides={n}"
    return urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"}),timeout=45).read().decode("utf8","replace")
def fl(x):
    try: return float(x)
    except: return None
D=json.load(open("dataset.json"))
NA=6.02214076e23; LN2=math.log(2)
WANT={"90sr":"Sr-90","3h":"H-3","14c":"C-14","63ni":"Ni-63","32p":"P-32","45ca":"Ca-45",
 "147pm":"Pm-147","106ru":"Ru-106","36cl":"Cl-36","35s":"S-35","89sr":"Sr-89","210po":"Po-210",
 "241pu":"Pu-241","99tc":"Tc-99","55fe":"Fe-55","228ra":"Ra-228","227ac":"Ac-227","238pu":"Pu-238",
 "240pu":"Pu-240","242pu":"Pu-242","243am":"Am-243","237np":"Np-237","234u":"U-234","233u":"U-233"}
added=0
for nid,key in WANT.items():
    if key in D: continue
    try: rows=list(csv.DictReader(io.StringIO(get("ground_states",nid))))
    except Exception as e: print(f"  {key:8s} 실패 {e}"); continue
    if not rows: print(f"  {key:8s} 빈 응답"); continue
    g=rows[0]; T=fl(g.get("half_life_sec"))
    z,n_=fl(g.get("z")),fl(g.get("n"))
    if not T or z is None: print(f"  {key:8s} T½ 없음"); continue
    A=int(z)+int(n_)
    D[key]={"z":int(z),"a":A,"sym":g["symbol"],"iso":"","t_half_s":T,
            "hl":g.get("half_life"),"hl_unit":g.get("unit_hl"),
            "decay":g.get("decay_1"),"sa_bq_g":LN2*NA/(T*A),
            "gamma_const":0,"lines":[]}
    added+=1
    print(f"  {key:8s} T½={g.get('half_life')}{g.get('unit_hl')}  비방사능 {D[key]['sa_bq_g']:.3e} Bq/g")
    time.sleep(0.25)
json.dump(D,open("dataset.json","w"),separators=(",",":"))
import os
print(f"\n보충 {added}개 → 총 {len(D)} 핵종 · {os.path.getsize('dataset.json'):,} B")
print("검증:", {k:f"{D[k]['sa_bq_g']:.3e}" for k in ("Sr-90","H-3","Pu-241") if k in D},
      " (문헌 Sr-90 5.11e12 · H-3 3.56e14 · Pu-241 3.81e15)")
