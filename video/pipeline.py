"""LMAP Academy lesson-video pipeline: HeyGen -> your Mac -> lmapacademy.org.

Setup: copy video/.env.example to video/.env and fill it in. Then, from the LMAP-Academy folder:

    python3 video/pipeline.py avatars             # list your HeyGen avatars (copy an id into .env)
    python3 video/pipeline.py voices [english]    # list voices, optionally filtered
    python3 video/pipeline.py test                # one 20-second test video to check the look
    python3 video/pipeline.py generate --course ai-in-60-minutes --limit 3
    python3 video/pipeline.py generate            # every lesson that has no video yet
    python3 video/pipeline.py status              # progress summary
    python3 video/pipeline.py upload              # push downloaded videos to the site

Re-run `generate` any time: it never resubmits a lesson that is already rendering or downloaded,
it just checks HeyGen and downloads whatever has finished. Videos land in video/output/<course>/.
"""
import argparse
import json
import os
import sys
import time

import requests

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPTS = os.path.join(HERE, "scripts")
OUTPUT = os.path.join(HERE, "output")
STATE_FILE = os.path.join(HERE, "state.json")
API = "https://api.heygen.com"


def load_env():
    path = os.path.join(HERE, ".env")
    if not os.path.exists(path):
        sys.exit("Missing video/.env — copy video/.env.example to video/.env and fill it in.")
    env = {}
    for line in open(path, encoding="utf-8"):
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


ENV = load_env()


def need(key):
    if not ENV.get(key):
        sys.exit(f"Set {key} in video/.env first.")
    return ENV[key]


def hg(method, path, **kw):
    r = requests.request(method, API + path, headers={"x-api-key": need("HEYGEN_API_KEY")}, timeout=60, **kw)
    if r.status_code >= 400:
        raise RuntimeError(f"HeyGen {method} {path} -> {r.status_code}: {r.text[:500]}")
    body = r.json()
    return body.get("data", body) if isinstance(body, dict) else body


def items(data, *keys):
    """HeyGen list responses nest the array under varying keys; find it."""
    if isinstance(data, list):
        return data
    for k in keys + ("items", "list", "data", "results"):
        if isinstance(data.get(k), list):
            return data[k]
    return []


def load_state():
    return json.load(open(STATE_FILE)) if os.path.exists(STATE_FILE) else {}


def save_state(state):
    tmp = STATE_FILE + ".tmp"
    json.dump(state, open(tmp, "w"), indent=1, sort_keys=True)
    os.replace(tmp, STATE_FILE)


def all_scripts(course=None, lesson=None):
    out = []
    for slug in sorted(os.listdir(SCRIPTS)):
        if course and slug != course:
            continue
        folder = os.path.join(SCRIPTS, slug)
        for f in sorted(os.listdir(folder)):
            if f.endswith(".txt") and (not lesson or f[:-4] == lesson):
                out.append((slug, f[:-4], os.path.join(folder, f)))
    return out


def out_path(slug, stem):
    return os.path.join(OUTPUT, slug, stem + ".mp4")


# ---------------------------------------------------------------- commands

def cmd_avatars(_):
    for ownership in ("private", "public"):
        try:
            looks = items(hg("GET", f"/v3/avatars/looks?ownership={ownership}"), "looks", "avatars")
        except RuntimeError as e:
            print(f"[{ownership}] {e}")
            continue
        print(f"\n== {ownership} avatars ({len(looks)}) ==")
        for a in looks[:200]:
            print(f"{a.get('id') or a.get('avatar_id')}\t{a.get('name') or a.get('avatar_name')}\t{a.get('avatar_type', '')}")


def cmd_voices(args):
    voices = items(hg("GET", "/v3/voices"), "voices")
    q = (args.filter or "").lower()
    shown = 0
    for v in voices:
        line = f"{v.get('voice_id') or v.get('id')}\t{v.get('name')}\t{v.get('language')}\t{v.get('gender')}"
        if q in line.lower():
            print(line)
            shown += 1
    print(f"\n{shown} of {len(voices)} voices shown")


def submit(slug, stem, text, title):
    body = {
        "type": "avatar",
        "avatar_id": need("HEYGEN_AVATAR_ID"),
        "voice_id": need("HEYGEN_VOICE_ID"),
        "script": text,
        "title": title,
        "resolution": ENV.get("HEYGEN_RESOLUTION", "1080p"),
        "aspect_ratio": "16:9",
    }
    if ENV.get("HEYGEN_ENGINE"):
        body["engine"] = {"type": ENV["HEYGEN_ENGINE"]}
    if ENV.get("HEYGEN_VOICE_SPEED"):
        body["voice_settings"] = {"speed": float(ENV["HEYGEN_VOICE_SPEED"])}
    if ENV.get("HEYGEN_BACKGROUND_COLOR"):
        body["background"] = {"type": "color", "value": ENV["HEYGEN_BACKGROUND_COLOR"]}
    data = hg("POST", "/v3/videos", json=body)
    return data.get("video_id") or data.get("id")


def download(url, dest):
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with requests.get(url, stream=True, timeout=300) as r:
        r.raise_for_status()
        with open(dest + ".part", "wb") as f:
            for chunk in r.iter_content(1 << 20):
                f.write(chunk)
    os.replace(dest + ".part", dest)


def poll(state):
    """Check every in-flight job once; download finished ones. Returns number still rendering."""
    rendering = 0
    for key, job in sorted(state.items()):
        if job.get("status") in ("downloaded", "failed"):
            continue
        slug, stem = key.split("/", 1)
        try:
            data = hg("GET", f"/v3/videos/{job['video_id']}")
        except RuntimeError as e:
            print(f"  ? {key}: {e}")
            rendering += 1
            continue
        status = data.get("status")
        if status == "completed" and data.get("video_url"):
            print(f"  ↓ {key} ({data.get('duration') or '?'}s)")
            download(data["video_url"], out_path(slug, stem))
            job.update(status="downloaded", duration=data.get("duration"))
        elif status == "failed":
            job.update(status="failed", error=f"{data.get('failure_code')}: {data.get('failure_message')}")
            print(f"  ✗ {key}: {job['error']}")
        else:
            job["status"] = status or "pending"
            rendering += 1
        save_state(state)
    return rendering


def cmd_generate(args):
    state = load_state()
    todo = [
        (slug, stem, path) for slug, stem, path in all_scripts(args.course, args.lesson)
        if not os.path.exists(out_path(slug, stem))
        and state.get(f"{slug}/{stem}", {}).get("status") not in ("pending", "processing", "waiting", "downloaded")
    ]
    if args.limit:
        todo = todo[: args.limit]
    print(f"{len(todo)} lessons to submit (max {args.parallel} rendering at once)")

    while True:
        rendering = poll(state)
        while todo and rendering < args.parallel:
            slug, stem, path = todo.pop(0)
            text = open(path, encoding="utf-8").read().strip()
            try:
                vid = submit(slug, stem, text, f"{slug} — {stem}")
            except RuntimeError as e:
                print(f"  ✗ submit {slug}/{stem}: {e}")
                if "credit" in str(e).lower() or "quota" in str(e).lower() or " 402" in str(e) or " 429" in str(e):
                    print("Stopping: out of credits or rate-limited. Re-run later to continue.")
                    return
                continue
            state[f"{slug}/{stem}"] = {"video_id": vid, "status": "pending", "submitted": int(time.time())}
            save_state(state)
            rendering += 1
            print(f"  → submitted {slug}/{stem} ({len(text.split())} words)")
        if not rendering and not todo:
            break
        print(f"  … {rendering} rendering, {len(todo)} queued — checking again in 60s (Ctrl+C is safe; re-run to resume)")
        time.sleep(60)
    cmd_status(args)


def cmd_test(_):
    state = load_state()
    text = ("Hi, and welcome to LMAP Academy. This is a short test of our lesson video setup. "
            "If you can see and hear me clearly, we're ready to record the full courses.")
    vid = submit("_test", "test", text, "LMAP test video")
    state["_test/test"] = {"video_id": vid, "status": "pending"}
    save_state(state)
    print("Submitted test video, waiting for HeyGen…")
    while poll(state):
        time.sleep(20)
    print(f"Saved: {out_path('_test', 'test')}" if os.path.exists(out_path("_test", "test")) else state["_test/test"])


def cmd_status(_):
    state = load_state()
    scripts = all_scripts()
    by = {}
    for slug, stem, _p in scripts:
        s = "downloaded" if os.path.exists(out_path(slug, stem)) else state.get(f"{slug}/{stem}", {}).get("status", "not started")
        by.setdefault(slug, {}).setdefault(s, 0)
        by[slug][s] += 1
    for slug, counts in by.items():
        print(f"{slug:45} " + "  ".join(f"{k}: {v}" for k, v in sorted(counts.items())))
    failed = {k: v.get("error") for k, v in state.items() if v.get("status") == "failed"}
    if failed:
        print("\nFailed (delete their entries from video/state.json to retry):")
        for k, e in failed.items():
            print(f"  {k}: {e}")


def cmd_upload(args):
    site = ENV.get("SITE_API", "https://lmap-academy.onrender.com").rstrip("/")
    headers = {"X-Upload-Token": need("VIDEO_UPLOAD_TOKEN")}
    r = requests.get(f"{site}/admin/lesson-videos", headers=headers, timeout=90)
    r.raise_for_status()
    done = set(r.json())
    files = [
        (slug, stem) for slug, stem, _p in all_scripts(args.course, args.lesson)
        if os.path.exists(out_path(slug, stem)) and (args.force or f"{slug}/{stem}" not in done)
    ]
    print(f"{len(files)} videos to upload ({len(done)} already on the site)")
    for i, (slug, stem) in enumerate(files, 1):
        path = out_path(slug, stem)
        mb = os.path.getsize(path) / 1e6
        print(f"  [{i}/{len(files)}] {slug}/{stem} ({mb:.0f} MB)…", end=" ", flush=True)
        with open(path, "rb") as f:
            resp = requests.put(f"{site}/admin/lesson-video/{slug}/{stem}", data=f,
                                headers={**headers, "Content-Type": "video/mp4"}, timeout=1800)
        print("ok" if resp.ok else f"FAILED {resp.status_code}: {resp.text[:200]}")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("avatars")
    v = sub.add_parser("voices"); v.add_argument("filter", nargs="?")
    sub.add_parser("test")
    sub.add_parser("status")
    for name in ("generate", "upload"):
        c = sub.add_parser(name)
        c.add_argument("--course")
        c.add_argument("--lesson", help="lesson file stem, e.g. 01-02-setting-up-safely")
        if name == "generate":
            c.add_argument("--limit", type=int, default=0)
            c.add_argument("--parallel", type=int, default=int(ENV.get("HEYGEN_PARALLEL", 3)))
        else:
            c.add_argument("--force", action="store_true", help="re-upload even if the site already has it")
    args = p.parse_args()
    {"avatars": cmd_avatars, "voices": cmd_voices, "test": cmd_test, "status": cmd_status,
     "generate": cmd_generate, "upload": cmd_upload}[args.cmd](args)


if __name__ == "__main__":
    main()
