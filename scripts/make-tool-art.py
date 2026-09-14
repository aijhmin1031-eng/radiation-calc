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

필요: Pillow. Pollo AI 의 GPT Image 2 를 쓴다(quality=low 로 충분하다 — 평면 일러스트에서
low 와 medium 의 차이가 보이지 않고 값은 1/9 이다: 0.11 vs 0.97 credit).
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

# ★ 공통 문체. 팔레트 규약을 문장으로 못 박는다 —
#   「앰버는 정확히 하나」가 이 사이트의 규칙이고, 모델은 두 곳을 칠하려 든다.
STYLE = (
    "Friendly, simple flat 2D illustration. Warm off-white paper background. Drawn in soft warm "
    "graphite grey ink with a calm, even, slightly rounded line weight. EXACTLY ONE element is "
    "coloured, in a warm amber ochre — every other part is grey ink on the off-white paper, with no "
    "other colour anywhere. Only two or three simple shapes in total. The subject fills about 70 "
    "percent of the frame with small even margins, centred. Friendly and approachable rather than "
    "technical. Absolutely no text, no letters, no numerals, no watermark, no signature. No "
    "photorealism, no 3D rendering, no drop shadows, no gradients."
)

# ★ 소재는 `lib/tool-icons.ts` 의 16px 기호와 **짝을 이룬다** — 같은 도구가 두 곳에서
#   다른 그림이면 한쪽에서 배운 것이 다른 쪽에서 쓸모없다. 하나를 바꾸면 둘 다 바꾼다.
SUBJECTS = {
    "units": "Two rounded measuring beakers of different sizes standing side by side, with one simple "
             "two-way arrow curving between them. THE AMBER ELEMENT IS: the two-way arrow.",
    "decay": "A softly rounded hourglass with the sand gathered in the lower bulb and a few grains "
             "falling. THE AMBER ELEMENT IS: the sand.",
    "gamma-shielding": "A thick rounded upright shield slab, with three soft wavy rays arriving from "
             "the left and stopping against it. THE AMBER ELEMENT IS: the three rays.",
    "specific-activity": "A small solid rounded cube resting on one pan of a simple two-pan balance "
             "scale. THE AMBER ELEMENT IS: the cube.",
    "mda": "A round magnifying glass with a friendly rounded handle, held over one very small dot. "
             "THE AMBER ELEMENT IS: the small dot.",
    "beta": "A tall upright rounded rectangular panel standing vertically on the right, like a small "
             "screen or sheet seen edge-on. One small round particle approaches it from the left along "
             "a gentle wavy dashed path and comes to rest against the panel's left face. "
             "THE AMBER ELEMENT IS: the small round particle.",
    "alara": "A simple round wall clock with a plain friendly face and two hands, with no numerals and "
             "no markings on the face. THE AMBER ELEMENT IS: the minute hand.",
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
                           "resolution": "1K", "quality": "low"}})["data"]["taskId"]
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

    ★ 여백을 그대로 두면 안 된다 — 모델이 주는 여백이 장마다 달라(내용이 프레임의 34~62%),
      56px 로 줄이면 여백만 큰 장이 **비어 보인다.** 실측으로 두 장이 그랬다.
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
        half = max(max(xs) - min(xs), max(ys) - min(ys)) / 2 * 1.18   # 내용 + 18% 숨통
        k = im.size[0] / 256
        side = int(min(im.size[0], half * 2 * k))
        L = max(0, min(im.size[0] - side, int(cx * k - side / 2)))
        T = max(0, min(im.size[1] - side, int(cy * k - side / 2)))
        im = im.crop((L, T, L + side, T + side))
    return im.resize((256, 256), Image.LANCZOS)


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
        im.save(p, "WEBP", quality=88, method=6)
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
