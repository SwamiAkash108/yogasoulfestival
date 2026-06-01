#!/usr/bin/env python3
"""Build hero background assets from Figma export (451:775 @ 2x)."""

from __future__ import annotations

import math
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIGMA = os.path.join(ROOT, "assets", "figma")
SRC = os.path.join(FIGMA, "hero-box-export.png")
TEX_OUT = os.path.join(FIGMA, "hero-waves-texture.png")
BG_OUT = os.path.join(FIGMA, "hero-bg-composite.png")


def grad_at(x: int, y: int, w: int, h: int) -> tuple[int, int, int]:
    nx, ny = x / w, y / h
    dx = (nx - 0.0) / 1.0167
    dy = (ny - 0.0477) / 1.0155
    t = min(1.0, max(0.0, math.sqrt(dx * dx + dy * dy)))
    return (
        int(214 * (1 - t) + 213 * t),
        int(158 * (1 - t) + 63 * t),
        int(46 * (1 - t) + 140 * t),
    )


def is_white(r: int, g: int, b: int) -> bool:
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    mx = max(r, g, b)
    mn = min(r, g, b)
    sat = (mx - mn) / mx if mx else 0
    return lum > 200 and sat < 0.2


def build_texture(hero: Image.Image, w: int, h: int) -> Image.Image:
    tex = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    hr = hero.load()
    opx = tex.load()
    for y in range(h):
        for x in range(w):
            r, g, b, _ = hr[x, y]
            gr, gg, gb = grad_at(x, y, w, h)
            if is_white(r, g, b):
                continue
            tr = max(0, min(255, int((r - 0.8 * gr) / 0.2)))
            tg = max(0, min(255, int((g - 0.8 * gg) / 0.2)))
            tb = max(0, min(255, int((b - 0.8 * gb) / 0.2)))
            opx[x, y] = (tr, tg, tb, 255)
    return tex


def build_composite(hero: Image.Image, tex: Image.Image, w: int, h: int) -> Image.Image:
    out = Image.new("RGB", (w, h))
    hr = hero.load()
    tr = tex.load()
    opx = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, _ = hr[x, y]
            if is_white(r, g, b):
                gr, gg, gb = grad_at(x, y, w, h)
                wr, wg, wb, _ = tr[x, y]
                opx[x, y] = (
                    int(gr * 0.8 + wr * 0.2),
                    int(gg * 0.8 + wg * 0.2),
                    int(gb * 0.8 + wb * 0.2),
                )
            else:
                opx[x, y] = (r, g, b)
    return out


def main() -> None:
    if not os.path.exists(SRC):
        raise SystemExit(f"Missing {SRC}. Export Figma node 451:775 at scale 2 first.")

    hero = Image.open(SRC).convert("RGBA")
    w, h = hero.size
    tex = build_texture(hero, w, h)
    tex.save(TEX_OUT, optimize=True)
    build_composite(hero, tex, w, h).save(BG_OUT, optimize=True)
    print(f"Wrote {TEX_OUT}")
    print(f"Wrote {BG_OUT}")


if __name__ == "__main__":
    main()
