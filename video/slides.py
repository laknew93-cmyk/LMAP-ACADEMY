"""Free lesson videos: branded slides + neural Indian-English voiceover, stitched into an MP4.

    video/.venv/bin/python video/slides.py video/slides/<course>/<lesson>.json
    video/.venv/bin/python video/slides.py --all            # every slide plan without a video yet

Each slide plan (JSON) lists segments: what the slide shows and what the voice says. Output goes to
video/output/<course>/<lesson>.mp4 — the same place pipeline.py uploads from.
"""
import argparse
import asyncio
import json
import os
import re
import subprocess
import sys
import tempfile

import edge_tts
import imageio_ffmpeg
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
VOICE = os.environ.get("LMAP_VOICE", "en-IN-NeerjaNeural")
RATE = os.environ.get("LMAP_VOICE_RATE", "+0%")
W, H = 1920, 1080

PURPLE, PURPLE_DARK, PURPLE_LIGHT = (109, 40, 217), (76, 29, 149), (237, 233, 254)
INK, MUTED, BORDER = (17, 24, 39), (107, 114, 128), (229, 231, 235)
AMBER, AMBER_LIGHT, GREEN = (217, 119, 6), (254, 243, 199), (5, 150, 105)

FONT_FILES = {
    "regular": [("/System/Library/Fonts/Avenir Next.ttc", 7), ("/System/Library/Fonts/Supplemental/Arial.ttf", 0)],
    "bold": [("/System/Library/Fonts/Avenir Next.ttc", 0), ("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 0)],
    "demi": [("/System/Library/Fonts/Avenir Next.ttc", 2), ("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 0)],
}
_fonts = {}


def font(kind, size):
    key = (kind, size)
    if key not in _fonts:
        for path, index in FONT_FILES[kind]:
            try:
                _fonts[key] = ImageFont.truetype(path, size, index=index)
                break
            except OSError:
                continue
        else:
            _fonts[key] = ImageFont.load_default()
    return _fonts[key]


def wrap(draw, text, fnt, width):
    lines, line = [], ""
    for word in text.split():
        trial = f"{line} {word}".strip()
        if draw.textlength(trial, font=fnt) <= width:
            line = trial
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def clean(text):
    # The slide fonts have no arrow glyph.
    return text.replace(" → ", " to ").replace("→", "to")


def text_block(draw, xy, text, fnt, fill, width, spacing=1.3):
    x, y = xy
    text = clean(text)
    for line in wrap(draw, text, fnt, width):
        draw.text((x, y), line, font=fnt, fill=fill)
        y += int(fnt.size * spacing)
    return y


def gradient(img, top, bottom):
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)], fill=tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))


def chrome(draw, plan, progress):
    """Header label, footer brand and progress bar shared by content slides."""
    draw.text((120, 70), f"{plan['course']}  ·  {plan['lesson']}", font=font("demi", 30), fill=PURPLE)
    draw.rounded_rectangle([64, H - 30, W - 64, H - 22], radius=4, fill=(255, 255, 255))
    draw.rounded_rectangle([64, H - 30, 64 + int((W - 128) * progress), H - 22], radius=4, fill=PURPLE)
    draw.text((120, H - 112), "LMAP Academy", font=font("bold", 28), fill=INK)
    draw.text((W - 120, H - 112), "lmapacademy.org", font=font("regular", 28), fill=MUTED, anchor="ra")


# Course colour themes (match the course cards on the website): (start, end) RGB.
THEMES = {
    "AI Fundamentals": ((109, 40, 217), (219, 39, 119)),
    "Prompt Engineering": ((79, 70, 229), (6, 182, 212)),
    "AI for Business": ((234, 88, 12), (219, 39, 119)),
    "AI for Marketing": ((219, 39, 119), (245, 158, 11)),
    "AI for Data": ((5, 150, 105), (14, 165, 233)),
    "AI Automation": ((15, 118, 110), (109, 40, 217)),
    "Generative AI Engineering": ((55, 48, 163), (124, 58, 237)),
}
_backgrounds = {}


def mix(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def background(theme, dark):
    """Abstract 'AI' backdrop: soft colour glows, a dot grid and a faint neural-network constellation."""
    key = (theme, dark)
    if key in _backgrounds:
        return _backgrounds[key].copy()
    c1, c2 = THEMES.get(theme, THEMES["AI Fundamentals"])
    rnd = random.Random(f"{theme}-{dark}")
    base = mix((12, 12, 24), c1, 0.18) if dark else mix((255, 255, 255), c1, 0.06)
    img = Image.new("RGB", (W, H), base)

    glow = Image.new("RGB", (W, H), base)
    g = ImageDraw.Draw(glow)
    for (cx, cy, r, col) in ((W * 0.85, H * 0.15, 520, c1), (W * 0.1, H * 0.95, 460, c2), (W * 0.55, H * 0.7, 380, mix(c1, c2, 0.5))):
        strength = 0.85 if dark else 0.30
        g.ellipse([cx - r, cy - r, cx + r, cy + r], fill=mix(base, col, strength))
    img = Image.blend(img, glow.filter(ImageFilter.GaussianBlur(160)), 1.0)

    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    dot = (255, 255, 255, 26) if dark else (*c1, 22)
    for x in range(40, W, 48):
        for y in range(40, H, 48):
            d.ellipse([x - 2, y - 2, x + 2, y + 2], fill=dot)
    # Neural-network constellation on the right-hand side.
    nodes = [(rnd.randint(int(W * 0.58), W - 60), rnd.randint(60, H - 60)) for _ in range(26)]
    line = (255, 255, 255, 46) if dark else (*c2, 40)
    node = (255, 255, 255, 120) if dark else (*c1, 70)
    for i, a in enumerate(nodes):
        for b in sorted(nodes, key=lambda n: (n[0] - a[0]) ** 2 + (n[1] - a[1]) ** 2)[1:3]:
            d.line([a, b], fill=line, width=2)
    for (x, y) in nodes:
        r = rnd.choice((5, 7, 9))
        d.ellipse([x - r, y - r, x + r, y + r], fill=node)
    img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
    _backgrounds[key] = img
    return img.copy()


def render_slide(plan, seg, progress, path):
    kind = seg.get("kind", "content")
    theme = plan.get("_category", "AI Fundamentals")

    if kind == "title":
        img = background(theme, dark=True)
        draw = ImageDraw.Draw(img)
        draw.rounded_rectangle([120, 120, 200, 200], radius=18, fill=THEMES.get(theme, THEMES["AI Fundamentals"])[0])
        draw.text((160, 160), "L", font=font("bold", 48), fill="white", anchor="mm")
        draw.text((228, 136), "LMAP Academy", font=font("bold", 44), fill="white")
        draw.text((120, 380), plan["course"].upper(), font=font("demi", 34), fill=(196, 181, 253))
        draw.text((120, 430), plan["lesson"], font=font("regular", 34), fill=(209, 213, 219))
        text_block(draw, (120, 520), plan["title"], font("bold", 88), "white", W - 360, 1.15)
        draw.text((120, H - 110), "lmapacademy.org", font=font("regular", 30), fill=(156, 163, 175))
        img.save(path)
        return

    accent = AMBER if kind == "exercise" else GREEN if kind == "recap" else PURPLE
    # Content sits on a soft white card over the themed background.
    img = background(theme, dark=False).convert("RGBA")
    card = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cd = ImageDraw.Draw(card)
    cd.rounded_rectangle([72, 36, W - 72, H - 44], radius=36, fill=(0, 0, 0, 40))
    card = card.filter(ImageFilter.GaussianBlur(18))
    cd = ImageDraw.Draw(card)
    cd.rounded_rectangle([64, 28, W - 64, H - 52], radius=36, fill=(255, 255, 255, 236))
    img = Image.alpha_composite(img, card).convert("RGB")
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([64, 28, 80, H - 52], radius=8, fill=accent)
    chrome(draw, plan, progress)
    y = text_block(draw, (120, 140), seg["title"], font("bold", 72), INK, W - 240, 1.15) + 40
    left, width = 120, W - 240

    if seg.get("bullets"):
        for b in seg["bullets"]:
            if kind == "recap":  # drawn tick: the fonts lack a check-mark glyph
                draw.line([(left + 2, y + 32), (left + 16, y + 46), (left + 40, y + 16)], fill=accent, width=7, joint="curve")
            else:
                draw.ellipse([left + 8, y + 22, left + 24, y + 38], fill=accent)
            y = text_block(draw, (left + 60, y), b, font("regular", 46), INK, width - 60, 1.3) + 22

    if seg.get("numbered"):
        hl = seg.get("highlight")
        for i, item in enumerate(seg["numbered"]):
            active = hl is None or hl == i
            if hl == i:
                draw.rounded_rectangle([left - 24, y - 16, left + width, y + 78], radius=16, fill=PURPLE_LIGHT)
            circle = accent if active else BORDER
            draw.ellipse([left, y, left + 62, y + 62], fill=circle)
            draw.text((left + 31, y + 31), str(i + 1), font=font("bold", 34), fill="white" if active else MUTED, anchor="mm")
            y = text_block(draw, (left + 96, y + 4), item, font("demi" if hl == i else "regular", 44),
                           INK if active else MUTED, width - 120, 1.3) + 34

    if seg.get("grid"):
        cells = seg["grid"]
        cols = 3 if len(cells) in (3, 6) else 2
        gap = 32
        cw = (width - gap * (cols - 1)) // cols
        ch = 190 if len(cells) > 3 else 230
        for i, (head, body) in enumerate(cells):
            cx, cy = left + (i % cols) * (cw + gap), y + (i // cols) * (ch + gap)
            draw.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=20, fill=(250, 249, 255), outline=BORDER, width=2)
            draw.text((cx + 32, cy + 28), head, font=font("bold", 42), fill=PURPLE_DARK)
            text_block(draw, (cx + 32, cy + 92), body, font("regular", 32), MUTED, cw - 64, 1.3)
        y += ((len(cells) + cols - 1) // cols) * (ch + gap) + 10

    for key, fill, border in (("quote", PURPLE_LIGHT, PURPLE), ("note", AMBER_LIGHT, AMBER)):
        if seg.get(key):
            lines = wrap(draw, clean(seg[key]), font("demi", 40), width - 100)
            box_h = len(lines) * 54 + 56
            top = max(y + 10, H - 170 - box_h)
            draw.rounded_rectangle([left, top, left + width, top + box_h], radius=18, fill=fill)
            draw.rectangle([left, top, left + 10, top + box_h], fill=border)
            text_block(draw, (left + 50, top + 28), seg[key], font("demi", 40), INK, width - 100, 1.35)
            y = top + box_h + 20

    img.save(path)


async def tts(text, path):
    await edge_tts.Communicate(text, VOICE, rate=RATE).save(path)


def ffmpeg(*args):
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", *args], check=True)


def build(plan_path, out_path=None):
    plan = json.load(open(plan_path, encoding="utf-8"))
    course_slug = os.path.basename(os.path.dirname(plan_path))
    course_json = os.path.join(os.path.dirname(HERE), "backend", "content", "courses", course_slug, "course.json")
    if os.path.exists(course_json):
        plan["_category"] = json.load(open(course_json, encoding="utf-8")).get("category")
    stem = os.path.splitext(os.path.basename(plan_path))[0]
    out_path = out_path or os.path.join(HERE, "output", course_slug, stem + ".mp4")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    segs = plan["segments"]

    with tempfile.TemporaryDirectory() as tmp:
        parts = []
        for i, seg in enumerate(segs):
            png, mp3, mp4 = (os.path.join(tmp, f"{i:03d}.{ext}") for ext in ("png", "mp3", "mp4"))
            render_slide(plan, seg, (i + 1) / len(segs), png)
            if i == 0:
                Image.open(png).convert("RGB").resize((1280, 720)).save(out_path[:-4] + ".jpg", quality=82)
            # Natural pause between sections; strip characters TTS would read awkwardly.
            asyncio.run(tts(re.sub(r"[*_#`]", "", seg["say"]), mp3))
            ffmpeg("-loop", "1", "-framerate", "30", "-i", png, "-i", mp3,
                   "-af", "apad=pad_dur=0.6", "-c:v", "libx264", "-tune", "stillimage", "-preset", "medium",
                   "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "80k", "-ac", "1", "-ar", "44100",
                   "-shortest", mp4)
            parts.append(mp4)
            print(f"  segment {i + 1}/{len(segs)}", flush=True)
        listing = os.path.join(tmp, "parts.txt")
        with open(listing, "w") as f:
            f.writelines(f"file '{p}'\n" for p in parts)
        ffmpeg("-f", "concat", "-safe", "0", "-i", listing, "-c", "copy", "-movflags", "+faststart", out_path)
    print(f"Saved {out_path}")
    return out_path


def publish():
    """Copy rendered videos of free/preview lessons into the website and write its video manifest.

    These lessons are free to watch anyway, so they are served as static files with the site.
    """
    import shutil
    root = os.path.dirname(HERE)
    courses = os.path.join(root, "backend", "content", "courses")
    public = os.path.join(root, "frontend", "public", "videos")
    manifest = {}
    for slug in sorted(os.listdir(courses)):
        manifest_path = os.path.join(courses, slug, "course.json")
        if not os.path.isfile(manifest_path):
            continue
        course = json.load(open(manifest_path, encoding="utf-8"))
        for module in course["modules"]:
            for lesson in module["lessons"]:
                stem = lesson["file"][:-3]
                src = os.path.join(HERE, "output", slug, stem + ".mp4")
                if not (course["price"] == 0 or lesson.get("preview")) or not os.path.exists(src):
                    continue
                os.makedirs(os.path.join(public, slug), exist_ok=True)
                for ext in (".mp4", ".jpg"):
                    if os.path.exists(src[:-4] + ext):
                        shutil.copy2(src[:-4] + ext, os.path.join(public, slug, stem + ext))
                probe = subprocess.run([FFMPEG, "-i", src], capture_output=True, text=True).stderr
                h, m, sec = re.search(r"Duration: (\d+):(\d+):([\d.]+)", probe).groups()
                manifest[f"{slug}/{stem}"] = {
                    "src": f"/videos/{slug}/{stem}.mp4",
                    "poster": f"/videos/{slug}/{stem}.jpg",
                    "seconds": round(int(h) * 3600 + int(m) * 60 + float(sec)),
                }
    out = os.path.join(root, "frontend", "src", "data", "videos.json")
    json.dump(manifest, open(out, "w"), indent=1, sort_keys=True)
    print(f"Published {len(manifest)} videos to frontend/public/videos")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("plans", nargs="*")
    p.add_argument("--all", action="store_true")
    p.add_argument("--force", action="store_true")
    p.add_argument("--publish", action="store_true", help="copy free/preview videos into the website")
    args = p.parse_args()
    if args.publish:
        return publish()
    plans = args.plans
    if args.all:
        root = os.path.join(HERE, "slides")
        plans = [os.path.join(root, c, f) for c in sorted(os.listdir(root)) for f in sorted(os.listdir(os.path.join(root, c))) if f.endswith(".json")]
    for plan in plans:
        course, stem = os.path.basename(os.path.dirname(plan)), os.path.splitext(os.path.basename(plan))[0]
        out = os.path.join(HERE, "output", course, stem + ".mp4")
        if os.path.exists(out) and not args.force:
            continue
        print(f"{course}/{stem}")
        build(plan)


if __name__ == "__main__":
    sys.exit(main())
