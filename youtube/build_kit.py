"""Build the YouTube upload kit for the free course: thumbnails, channel art and upload text.

    video/.venv/bin/python youtube/build_kit.py

Reads youtube/videos.json, the slide plans and the rendered videos; writes everything to youtube/kit/.
Chapters come from the actual slide-change times detected in each video.
"""
import json
import os
import re
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, "video"))
import imageio_ffmpeg  # noqa: E402
import slides  # noqa: E402  (fonts, themed backgrounds)
from PIL import Image, ImageDraw  # noqa: E402

COURSE = "ai-in-60-minutes"
SITE = "https://lmapacademy.org"
KIT = os.path.join(HERE, "kit")
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
YELLOW = (250, 204, 21)


def utm(path, video):
    return f"{SITE}{path}?utm_source=youtube&utm_medium=video&utm_campaign={video}"


def slide_times(mp4):
    """Seconds at which each slide starts, from frame differences (slides are static between cuts)."""
    p = subprocess.run([FFMPEG, "-i", mp4, "-vf", "scale=320:-1,select='gt(scene,0.002)',showinfo", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    times = [0.0]
    for t in (float(x) for x in re.findall(r"pts_time:([\d.]+)", p)):
        if t - times[-1] > 3:
            times.append(t)
    return times


def stamp(sec):
    sec = int(sec)
    return f"{sec // 60}:{sec % 60:02d}" if sec < 3600 else f"{sec // 3600}:{sec % 3600 // 60:02d}:{sec % 60:02d}"


def chapters(plan, times):
    labels = ["Introduction" if s.get("kind") == "title" else s["title"].replace(" · ", " – ") for s in plan["segments"]]
    if len(labels) != len(times):
        raise SystemExit(f"Slide count mismatch for {plan['title']}: {len(labels)} slides, {len(times)} cuts")
    out = []
    for label, t in zip(labels, times):
        if out and out[-1][1] == label:  # same slide title repeated (e.g. a list revealed step by step)
            continue
        if out and t - out[-1][0] < 10:  # YouTube needs chapters of at least 10 seconds
            continue
        out.append((t, label))
    return out


def thumbnail(lines, lesson_no, path):
    img = slides.background("AI Fundamentals", dark=True)
    img = img.resize((1280, 720))
    d = ImageDraw.Draw(img)
    # darken the left side for legibility
    shade = Image.new("RGBA", (1280, 720), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shade)
    for x in range(0, 900):
        sd.line([(x, 0), (x, 720)], fill=(8, 8, 20, int(170 * (1 - x / 900))))
    img = Image.alpha_composite(img.convert("RGBA"), shade).convert("RGB")
    d = ImageDraw.Draw(img)
    y = 150
    for i, line in enumerate(lines):
        size = 128 if len(line) <= 9 else 104
        fnt = slides.font("bold", size)
        fill = YELLOW if i == 1 else (255, 255, 255)
        # dark outline for contrast on any screen
        for dx, dy in ((-4, 0), (4, 0), (0, -4), (0, 4), (-3, -3), (3, 3), (-3, 3), (3, -3)):
            d.text((70 + dx, y + dy), line, font=fnt, fill=(10, 10, 20))
        d.text((70, y), line, font=fnt, fill=fill)
        y += int(size * 1.08)
    # course badge
    badge = f"FREE COURSE · LESSON {lesson_no}"
    bf = slides.font("bold", 34)
    w = d.textlength(badge, font=bf)
    d.rounded_rectangle([70, 70, 70 + w + 40, 128], radius=12, fill=(109, 40, 217))
    d.text((90, 78), badge, font=bf, fill="white")
    # brand
    d.rounded_rectangle([1040, 610, 1100, 670], radius=12, fill=(109, 40, 217))
    d.text((1070, 640), "L", font=slides.font("bold", 40), fill="white", anchor="mm")
    d.text((1112, 618), "LMAP", font=slides.font("bold", 30), fill="white")
    d.text((1112, 648), "Academy", font=slides.font("regular", 22), fill=(203, 213, 225))
    img.save(path, quality=90)


def channel_art():
    # Banner 2560x1440; everything important inside the 1546x423 centre safe area.
    banner = slides.background("AI Fundamentals", dark=True).resize((2560, 1440))
    d = ImageDraw.Draw(banner)
    cx, cy = 1280, 720
    d.text((cx, cy - 70), "LMAP Academy", font=slides.font("bold", 120), fill="white", anchor="mm")
    d.text((cx, cy + 40), "Practical AI skills for India — learn free, in plain English", font=slides.font("demi", 52), fill=(226, 232, 240), anchor="mm")
    d.text((cx, cy + 120), "Free AI lessons  ·  lmapacademy.org", font=slides.font("regular", 42), fill=YELLOW, anchor="mm")
    banner.save(os.path.join(KIT, "channel-banner-2560x1440.jpg"), quality=90)

    logo = Image.new("RGB", (800, 800), (109, 40, 217))
    ld = ImageDraw.Draw(logo)
    for r in range(400, 0, -4):
        t = r / 400
        ld.ellipse([400 - r, 400 - r, 400 + r, 400 + r], fill=slides.mix((219, 39, 119), (76, 29, 149), t))
    ld.text((400, 360), "LMAP", font=slides.font("bold", 190), fill="white", anchor="mm")
    ld.text((400, 520), "ACADEMY", font=slides.font("demi", 78), fill=(254, 240, 138), anchor="mm")
    logo.save(os.path.join(KIT, "channel-logo-800x800.png"))


def main():
    os.makedirs(KIT, exist_ok=True)
    meta = json.load(open(os.path.join(HERE, "videos.json"), encoding="utf-8"))
    sheet = ["# YouTube upload sheet — AI in 60 Minutes (free course)", "",
             f"Playlist title: {meta['playlist']['title']}", "", "Playlist description:", meta["playlist"]["description"], ""]
    for n, v in enumerate(meta["videos"], 1):
        plan = json.load(open(os.path.join(ROOT, "video", "slides", COURSE, v["stem"] + ".json"), encoding="utf-8"))
        mp4 = os.path.join(ROOT, "video", "output", COURSE, v["stem"] + ".mp4")
        chaps = chapters(plan, slide_times(mp4))
        upload_name = f"lesson-{n}-{v['stem'][6:]}"
        shutil.copy2(mp4, os.path.join(KIT, upload_name + ".mp4"))
        thumbnail(v["thumb"], n, os.path.join(KIT, upload_name + "-thumbnail.jpg"))

        campaign = f"ai60-lesson{n}"
        description = "\n".join([
            v["hook"],
            "",
            f"This is lesson {n} of 6 in AI in 60 Minutes, a free beginner course from LMAP Academy.",
            f"Get the full free course with exercises, notes and a free certificate: {utm('/courses/ai-in-60-minutes/', campaign)}",
            "",
            "Chapters",
            *[f"{stamp(t)} {label}" for t, label in chaps],
            "",
            "Want to go further?",
            f"Prompt Engineering Masterclass: {utm('/courses/prompt-engineering-masterclass/', campaign)}",
            f"All courses: {utm('/courses/', campaign)}",
            "",
            "About LMAP Academy: practical AI courses for Indian learners — students, working professionals, career returners and small business owners.",
            "",
            "This video uses an AI-generated voiceover. Tools change often; check the official websites for the latest features and pricing.",
            "",
            "#AI #ChatGPT #LearnAI",
        ])
        tags = list(dict.fromkeys(v["tags"] + meta["common_tags"]))
        sheet += [
            "---", "", f"## Video {n}: upload `{upload_name}.mp4`", "",
            f"**Thumbnail:** `{upload_name}-thumbnail.jpg`", "",
            "**Title** (copy):", "```", v["title"], "```", "",
            "**Description** (copy):", "```", description, "```", "",
            f"**Tags** (copy, {len(', '.join(tags))} characters):", "```", ", ".join(tags), "```", "",
            "**Settings:** Playlist = AI in 60 Minutes · Audience = No, it's not made for kids · Category = Education · "
            "Language = English (India) · Altered or synthetic content = No (narration only) · Visibility = Public (or Schedule)", "",
        ]
        print(f"lesson {n}: {len(chaps)} chapters, {len(v['title'])}-char title")
    channel_art()
    with open(os.path.join(KIT, "UPLOAD-SHEET.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(sheet) + "\n")
    print(f"Kit written to {KIT}")


if __name__ == "__main__":
    main()
