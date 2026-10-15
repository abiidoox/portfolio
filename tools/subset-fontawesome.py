#!/usr/bin/env python3
"""
Subsets the Font Awesome fonts (solid + brands) down to the glyphs the site
actually uses.

Reads tools/fontawesome-subset.json (written by
tools/build-fontawesome-subset.cjs) and writes
src/assets/fonts/fa-solid-subset.woff2 + fa-brands-subset.woff2.

The .ttf sources are used rather than the .woff2: fontTools can only emit
woff2 from a TrueType-flavoured source it fully supports, and the .ttf is the
flavour woff2 compression is defined for.

The codepoint list is a union across both families; each source font keeps
only the glyphs it actually contains, filtered through its cmap here so the
report stays honest about what landed in each file.

Requires: pip install fonttools brotli
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEC = os.path.join(ROOT, "tools", "fontawesome-subset.json")
PKG_FONTS = os.path.join(ROOT, "node_modules", "@fortawesome", "fontawesome-free", "webfonts")
OUT_DIR = os.path.join(ROOT, "src", "assets", "fonts")

FONTS = [
    ("fa-solid-900.ttf", "fa-solid-subset.woff2"),
    ("fa-brands-400.ttf", "fa-brands-subset.woff2"),
]

try:
    import fontTools  # noqa: F401
    import brotli  # noqa: F401
    from fontTools.ttLib import TTFont
except ImportError:
    sys.exit("missing dependency: pip install fonttools brotli")

with open(SPEC, encoding="utf-8") as fh:
    spec = json.load(fh)

codepoints = spec["codepoints"]
if not codepoints:
    sys.exit("no codepoints in tools/fontawesome-subset.json - run tools/build-fontawesome-subset.cjs first")

os.makedirs(OUT_DIR, exist_ok=True)

total = 0
for src_name, out_name in FONTS:
    src_font = os.path.join(PKG_FONTS, src_name)
    out_font = os.path.join(OUT_DIR, out_name)

    # Keep only the codepoints this font can actually render.
    with TTFont(src_font, lazy=True) as f:
        cmap = f.getBestCmap()
    present = [cp for cp in codepoints if cp in cmap]
    if not present:
        sys.exit("none of the codepoints exist in %s" % src_name)

    unicodes = ",".join("U+%04X" % cp for cp in present)

    cmd = [
        sys.executable, "-m", "fontTools.subset", src_font,
        "--unicodes=" + unicodes,
        "--flavor=woff2",
        "--layout-features=",
        "--no-hinting",
        "--desubroutinize",
        "--name-IDs=",
        "--output-file=" + out_font,
    ]
    subprocess.run(cmd, check=True)

    size = os.path.getsize(out_font)
    original = os.path.getsize(src_font)
    total += size
    print("%s: %d of %d codepoints" % (out_name, len(present), len(codepoints)))
    print("  %.1f KB (was %.1f KB) - %.0fx smaller"
          % (size / 1024, original / 1024, original / max(size, 1)))

print("total %.1f KB" % (total / 1024))
