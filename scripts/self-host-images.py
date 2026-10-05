#!/usr/bin/env python3
"""Download the site imagery from the Higgsfield CDN, compress it to WebP,
and point index.html at the local copies in assets/img/.

Usage:  python3 scripts/self-host-images.py
Needs:  Python 3 and either `cwebp` or ImageMagick (`magick` / `convert`) on PATH.
"""
import json, shutil, subprocess, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
manifest = json.loads((ROOT / "scripts/images.json").read_text())
base, images = manifest["base"], manifest["images"]
out = ROOT / "assets/img"
out.mkdir(parents=True, exist_ok=True)
tmp = ROOT / "scripts/.raw"
tmp.mkdir(exist_ok=True)

magick = shutil.which("magick") or shutil.which("convert")
cwebp = shutil.which("cwebp")
if not (magick or cwebp):
    sys.exit("Install ImageMagick or cwebp first (e.g. `brew install webp` or `apt install webp`).")

def to_webp(src, dst, width, quality):
    if cwebp:
        subprocess.run([cwebp, "-quiet", "-q", str(quality), "-resize", str(width), "0", str(src), "-o", str(dst)], check=True)
    else:
        subprocess.run([magick, str(src), "-resize", f"{width}x>", "-quality", str(quality), str(dst)], check=True)

html_path = ROOT / "index.html"
html = html_path.read_text()
for key, meta in images.items():
    raw = tmp / f"{key}.png"
    if not raw.exists():
        print(f"downloading {key}…")
        urllib.request.urlretrieve(base + meta["file"] + ".png", raw)
    to_webp(raw, out / f"{key}.webp", meta["width"], 80)
    to_webp(raw, out / f"{key}-sm.webp", 800, 74)
    html = html.replace(base + meta["file"] + ".png", f"assets/img/{key}.webp")
    html = html.replace(base + meta["file"] + "_min.webp", f"assets/img/{key}-sm.webp")
    print(f"  ✓ {key}")

html_path.write_text(html)
shutil.rmtree(tmp)
print("Done. index.html now uses assets/img/*.webp")
