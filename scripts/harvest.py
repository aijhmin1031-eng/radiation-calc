"""IAEA Live Chart (ENSDF 파생) 에서 핵종 붕괴 데이터를 받는다.
   ★ 함정 둘 — 실측으로 잡았다(2026-09-13):
     ① rad_types=g 응답에 **X선이 이미 들어 있다**. x 를 따로 받아 합치면 전부 두 번 센다.
     ② 한 요청에 **이성질체 부모까지 섞여 온다**(Ir-192m 의 선이 Ir-192 에 붙는다).
        p_energy 로 갈라야 한다 — 0 이 바닥상태, 그 밖은 이성질체(Tc-99m = 142.68).
     ③ g 응답의 X선에는 **Kβ 전체(KB) 줄과 그 구성 줄(K′β1 · K′β2)이 이름표 없이 함께** 있다(2026-10-29 실측 —
        I-125 31.359 keV 25.574% = 31.093 keV 21.014% + 31.698 keV 4.560%). 셋을 다 실으면 Kβ 를 두 번 센다.
        이름표는 rad_types=x 에만 있다(shell = KB · KpB1 · KpB2). 같은 준위 · 같은 원소(d_symbol)에서 구성 줄이 함께 오고
        세기가 그 합과 1% 안에서 같은 KB 줄을 뺀다. 이미 수확된 자료는 scripts/clean-dataset.mjs 가 같은 규칙으로 고쳤다.
   ★ β · α 가지(rad_types=bm · bp · a)는 이 스크립트가 받지 않는다 — 비어 있는 β− 가지는 clean-dataset.mjs 가 채운다."""
import csv, io, json, time, urllib.request
B="https://nds.iaea.org/relnsd/v1/data?fields={f}&nuclides={n}"
def get(f,n,extra=""):
    u=B.format(f=f,n=n)+extra
    return urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"}),timeout=45).read().decode("utf8","replace")
def fl(x):
    try: return float(x)
    except: return None
BASES=["60co","137cs","192ir","241am","99tc","131i","125i","18f","67ga","201tl","111in","99mo",
 "133ba","152eu","22na","24na","54mn","59fe","57co","65zn","75se","85sr","88y","95nb","95zr",
 "106ru","106rh","124sb","125sb","141ce","144ce","226ra","134cs","85kr","133xe","177lu","153sm",
 "188re","90y","90sr","32p","14c","3h","239pu","240pu","238pu","241pu","235u","238u","234u","63ni",
 "36cl","45ca","147pm","154eu","244cm","232th","40k","137ba","210pb","228th","55fe","109cd",
 "113sn","139ce","203hg","51cr","46sc","110agm","182ta","198au","192pt","68ga","68ge","89sr","223ra"]
out={}
for b in BASES:
    try: raw=get("decay_rads",b,"&rad_types=g")
    except Exception as e: print(f"{b:8s} 실패 {e}",flush=True); continue
    rows=[r for r in csv.DictReader(io.StringIO(raw)) if r.get("energy")]
    try: xr=[r for r in csv.DictReader(io.StringIO(get("decay_rads",b,"&rad_types=x"))) if r.get("energy")]
    except Exception as e: print(f"{b:8s} X선 이름표 실패 {e}",flush=True); xr=[]
    kb_total=set()                                   # ③ Kβ 전체 줄 — (p_energy, 에너지, 세기)
    for r in xr:
        if r.get("shell")!="KB": continue
        grp=[q for q in xr if q.get("p_energy")==r.get("p_energy") and q.get("d_symbol")==r.get("d_symbol")]
        cq=[q for q in grp if q.get("shell") in ("KpB1","KpB2")]
        # 가벼운 원소는 KB 와 K′β1 이 같은 줄로 두 번 온다(Co-57 7.082 keV) — 그때 KB 는 묶음이 아니고 아래 seen 이 하나로 합친다
        if any(q["energy"]==r["energy"] for q in cq): continue
        comp=[fl(q["intensity"]) or 0 for q in cq]
        # 구성 줄이 아래 0.001% 문턱에서 버려지면 KB 가 Kβ 의 유일한 표현이다 — 그때는 남긴다(Y-90 · Pu-239 · U-234 …)
        if comp and min(comp)>0.001 and abs(fl(r["intensity"])-sum(comp))<=0.01*fl(r["intensity"]):
            kb_total.add((r.get("p_energy"),r["energy"],r["intensity"]))
    rows=[r for r in rows if (r.get("p_energy"),r["energy"],r["intensity"]) not in kb_total]
    lv={}
    for r in rows:
        pe=fl(r.get("p_energy"))
        if pe is None: continue
        lv.setdefault(round(pe,3),[]).append(r)
    for pe,rs in lv.items():
        r0=rs[0]
        sym=r0.get("p_symbol") or ""; z=r0.get("p_z"); n_=r0.get("p_n")
        A=(int(z)+int(n_)) if z and n_ else None
        iso = "" if pe==0 else ("m" if len(lv)<=2 else f"m{sorted(x for x in lv if x>0).index(pe)+1}")
        key=f"{sym}-{A}{iso}" if A else b
        seen=set(); lines=[]
        for r in rs:
            e,i=fl(r["energy"]), fl(r["intensity"])
            if e is None or i is None or i<=0.001: continue
            k=(round(e,3),round(i,6))
            if k in seen: continue
            seen.add(k); lines.append([round(e,4),round(i,5)])
        lines.sort(key=lambda x:-x[1])
        hl=fl(r0.get("half_life_sec"))
        if not lines and pe!=0: continue
        rec={"z":int(z) if z else None,"a":A,"sym":sym,"iso":iso,"p_energy":pe,
             "half_life_s":hl,"hl":r0.get("half_life"),"hl_unit":r0.get("unit_hl"),
             "decay":r0.get("decay"),"decay_pct":fl(r0.get("decay_%")),
             "lines":lines[:80],"n_lines":len(lines),
             "sum_intensity":round(sum(x[1] for x in lines),2)}
        out[key]=rec
    print(f"{b:8s} 준위 {len(lv)}개 → {', '.join(k for k in out if k.startswith((r0.get('p_symbol') or '')+'-'))[:60]}",flush=True)
    time.sleep(0.25)
json.dump(out,open("nuclides.json","w"),separators=(",",":"))
print(f"\n저장 nuclides.json — {len(out)} 핵종 · {sum(v['n_lines'] for v in out.values())} 선")
