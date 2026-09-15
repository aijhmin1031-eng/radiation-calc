#!/usr/bin/env python3
"""도구 그림 일곱 장을 다시 굽는다 — 허브 카드가 쓰는 것.

★ **커밋된 산출물은 반드시 낡는다.** 그림이 레포에 들어 있으므로 어떻게 만들었는지가
  함께 있어야 한다. 프롬프트를 여기 정본으로 두고, 결과의 sha256 을
  `public/img/tools/sources.json` 에 적는다.

쓰는 법:
    POLLO_API_KEY=... python3 scripts/make-tool-art.py            # 일곱 장 전부
    POLLO_API_KEY=... python3 scripts/make-tool-art.py decay beta # 골라서

★ **키를 레포에 두지 않는다** — 환경변수로만 받는다. 명령줄 인자로도 받지 않는다
  (셸 기록에 남는다).

필요: Pillow. Pollo AI 의 GPT Image 2 를 쓴다.

★★ **quality=medium 을 쓴다**(2026-09-15 소유주 지시 「더 고급지게 … 전문가가 그린 것처럼
  디테일 살려줘」). 평면 도형 그림일 때는 low 로 충분했지만, **해칭으로 계조를 쌓는 각판화
  기법은 low 에서 뭉갠다.** 값은 0.11 → 0.97 credit(장당 약 $0.06).
"""
import hashlib, json, os, sys, time, urllib.request
from io import BytesIO
from PIL import Image

BASE = "https://pollo.ai/api/platform"
MODEL = "openai/gpt-image-2-0"
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "img", "tools")

# ★ 바탕을 한 색으로 맞춘다 — 생성 결과가 #f4f0e7~#fbf7e8 로 갈렸고,
#   일곱이 **나란히 놓이면 그 차이가 보인다.**
GROUND = (250, 245, 230)   # #faf5e6

# ★★ 공통 문체 — **각판화(engraving) 기법**이다(2026-09-15 개정).
#   그전에는 「둥근 도형 두셋」이었는데 고급스러움과는 반대 방향이었다. 우산의 lab 그림
#   (`calc.webp`)이 이미 세선 잉크인데 도구 타일만 납작해 **한 집안으로 안 보였다.**
#   ★ 팔레트 규약을 문장으로 못 박는다 — 「앰버는 정확히 하나」가 이 사이트의 규칙이고
#     모델은 두 곳을 칠하려 든다.
#   ★ **방사선 삼엽 표지를 막는다** — 안 막으면 선원 캡슐에 그려 넣는다(실측). 플랫폼은
#     그 기호를 브랜드로 쓰지 않는다: 「위험을 경고하는 곳」으로 읽히고 용도가 규제된다.
STYLE = (
    "A finely detailed technical pen-and-ink illustration in the manner of a classic "
    "nineteenth-century scientific instrument engraving. Drawn entirely in fine hatching and "
    "cross-hatching with a sharp nib, in warm graphite grey ink on warm off-white laid paper. "
    "Precise draughtsman's linework with confident contour lines and tonal shading built only from "
    "line work — no flat fills, no airbrush, no soft shading. Exactly ONE element is picked out in a "
    "warm amber ochre; every other part is grey ink on the off-white paper, with no other colour "
    "anywhere. Centred composition, the subject filling most of the frame with a small even margin. "
    "IMPORTANT: no radiation trefoil, no hazard symbols, no warning signs, no logos of any kind. "
    "No text, no letters, no numerals, no watermark, no signature. Square format, plain paper "
    "background with no scenery."
)

# ★ 소재는 `lib/tool-icons.ts` 의 16px 기호와 **짝을 이룬다** — 같은 도구가 두 곳에서
#   다른 그림이면 한쪽에서 배운 것이 다른 쪽에서 쓸모없다. 하나를 바꾸면 둘 다 바꾼다.
#   기법을 각판화로 올리면서 **소재는 그대로 두었다** — 짝이 깨지지 않게.
SUBJECTS = {
    "units": "Two graduated glass measuring cylinders of different heights standing side by side on a "
             "level bench, each with finely etched scale rings and a poured lip, and one slender "
             "two-way arrow curving between them. THE AMBER ELEMENT IS: the two-way arrow.",
    "decay": "An hourglass with turned hardwood posts, brass collars and blown glass bulbs, the sand "
             "gathered in the lower bulb with a fine thread still falling through the waist. "
             "THE AMBER ELEMENT IS: the sand.",
    "gamma-shielding": "A small cylindrical sealed source capsule standing on a machined flanged "
             "pedestal at the left, and a neatly interlocked stack of lead shielding bricks rising at "
             "the right, with a narrow fan of rays travelling from the capsule and striking the brick "
             "face. THE AMBER ELEMENT IS: the fan of rays.",
    "specific-activity": "A precision two-pan analytical balance with a slender beam, knife-edge pivot "
             "and hanging pans, a small machined metal block resting on the left pan. "
             "THE AMBER ELEMENT IS: the machined block.",
    "mda": "A magnifying lens with a brass rim and a turned hardwood handle, held above a plain plate "
             "on which sits one single very small speck. THE AMBER ELEMENT IS: the small speck.",
    "beta": "A thin flat absorber sheet standing upright in a slotted machined holder, with the curved "
             "track of a single particle approaching from the left and terminating at the sheet's "
             "face. THE AMBER ELEMENT IS: the particle at the end of the track.",
    "alara": "A mechanical stopwatch with a knurled crown, a hinged bezel and a plain dial bearing "
             "only tick marks and two hands. THE AMBER ELEMENT IS: the long sweep hand.",
}


def call(path, key, body=None):
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(body).encode() if body else None,
        headers={"x-api-key": key, "content-type": "application/json"},
        method="POST" if body else "GET",
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def generate(slug, key):
    prompt = f"{SUBJECTS[slug]} {STYLE}"
    task = call(f"/generation/{MODEL}/image", key,
                {"input": {"prompt": prompt, "aspectRatio": "1:1",
                           "resolution": "1K", "quality": "medium"}})["data"]["taskId"]
    for _ in range(40):
        time.sleep(4)
        g = (call(f"/generation/{task}/status", key)["data"].get("generations") or [{}])[0]
        if g.get("status") == "succeed":
            with urllib.request.urlopen(g["url"], timeout=120) as r:
                return Image.open(BytesIO(r.read())).convert("RGB")
        if g.get("status") == "failed":
            raise RuntimeError(f"{slug}: {g.get('failMsg')}")
    raise TimeoutError(slug)


def finish(im):
    """바탕을 맞추고 **내용 경계로 자른다.**

    ★ 여백을 그대로 두면 안 된다 — 모델이 주는 여백이 장마다 다르다(내용이 프레임의 52~99%).
      줄여서 쓰면 여백만 큰 장이 **비어 보인다.**
    ★ 숨통은 8% 다 — 각판화 판은 이미 프레임을 꽉 채우므로 넓게 주면 도로 작아진다.
    ★★ 내보내는 크기는 **320px** 이고 화면에서는 112px 로 쓴다. 56px 로 줄이면
      **해칭이 뭉개져 회색 덩어리**가 된다 — 디테일은 크기를 요구한다.
    """
    w, h = im.size
    corners = [im.getpixel(p) for p in [(5, 5), (w - 6, 5), (5, h - 6), (w - 6, h - 6)]]
    bg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))
    off = tuple(GROUND[i] - bg[i] for i in range(3))
    im = Image.merge("RGB", [ch.point(lambda v, o=off[i]: max(0, min(255, v + o)))
                             for i, ch in enumerate(im.split())])

    probe = im.resize((256, 256), Image.LANCZOS).load()
    xs, ys = [], []
    for y in range(256):
        for x in range(256):
            p = probe[x, y]
            if sum(abs(p[i] - GROUND[i]) for i in range(3)) > 40:
                xs.append(x); ys.append(y)
    if xs:
        cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
        half = max(max(xs) - min(xs), max(ys) - min(ys)) / 2 * 1.08   # 내용 + 8% 숨통
        k = im.size[0] / 256
        side = int(min(im.size[0], half * 2 * k))
        L = max(0, min(im.size[0] - side, int(cx * k - side / 2)))
        T = max(0, min(im.size[1] - side, int(cy * k - side / 2)))
        im = im.crop((L, T, L + side, T + side))
    return im.resize((320, 320), Image.LANCZOS)


def main():
    key = os.environ.get("POLLO_API_KEY")
    if not key:
        sys.exit("POLLO_API_KEY 가 없다. 환경변수로 준다 — 인자로 주면 셸 기록에 남는다.")
    want = sys.argv[1:] or list(SUBJECTS)
    os.makedirs(OUT, exist_ok=True)
    src_path = os.path.join(OUT, "sources.json")
    src = json.load(open(src_path)) if os.path.exists(src_path) else {"model": MODEL, "images": {}}
    for slug in want:
        im = finish(generate(slug, key))
        p = os.path.join(OUT, f"{slug}.webp")
        im.save(p, "WEBP", quality=86, method=6)
        src["images"][slug] = {
            "subject": SUBJECTS[slug],
            "sha256": hashlib.sha256(open(p, "rb").read()).hexdigest(),
            "bytes": os.path.getsize(p),
        }
        print(f"{slug:18} {os.path.getsize(p):>6} B")
    json.dump(src, open(src_path, "w"), indent=2, ensure_ascii=False)
    print(f"출처를 적었다 → {src_path}")


if __name__ == "__main__":
    main()
