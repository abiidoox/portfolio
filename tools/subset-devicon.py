#!/usr/bin/env python3
"""
Subsets the devicon font down to the glyphs the site actually uses.

Reads tools/devicon-subset.json (written by tools/build-devicon-subset.mjs) and
writes src/assets/fonts/devicon-subset.woff2.

Source font is the package's .ttf rather than the .woff: fontTools can only emit
woff2 from a TrueType-flavoured source it fully supports, and the .ttf is the
flavour woff2 compression is defined for. Output is a few KB.

Requires: pip install fonttools brotli
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEC = os.path.join(ROOT, "tools", "devicon-subset.json")
SRC_FONT = os.path.join(ROOT, "node_modules", "devicon", "fonts", "devicon.ttf")
OUT_DIR = os.path.join(ROOT, "src", "assets", "fonts")
OUT_FONT = os.path.join(OUT_DIR, "devicon-subset.woff2")

try:
    import fontTools  # noqa: F401
    import brotli  # noqa: F401
except ImportError:
    sys.exit("missing dependency: pip install fonttools brotli")

with open(SPEC, encoding="utf-8") as fh:
    spec = json.load(fh)

codepoints = spec["codepoints"]
if not codepoints:
    sys.exit("no codepoints in tools/devicon-subset.json - run tools/build-devicon-subset.mjs first")

os.makedirs(OUT_DIR, exist_ok=True)

# U+<hex> form of each codepoint, which is what pyftsubset's --unicodes wants.
unicodes = ",".join("U+%04X" % cp for cp in codepoints)

cmd = [
    sys.executable, "-m", "fontTools.subset", SRC_FONT,
    "--unicodes=" + unicodes,
    "--flavor=woff2",
    "--layout-features=",
    "--no-hinting",
    "--desubroutinize",
    "--name-IDs=",
    "--output-file=" + OUT_FONT,
]
subprocess.run(cmd, check=True)

size = os.path.getsize(OUT_FONT)
original = os.path.getsize(SRC_FONT)
print("devicon subset written: %s" % os.path.relpath(OUT_FONT, ROOT).replace("\\", "/"))
print("  %d glyphs" % len(codepoints))
print("  %.1f KB (was %.1f MB) - %.0fx smaller"
      % (size / 1024, original / 1048576, original / max(size, 1)))
