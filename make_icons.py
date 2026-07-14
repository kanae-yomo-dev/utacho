#!/usr/bin/env python3
"""歌帳PWA用アイコン生成。ダーク紫の背景に「歌」をマゼンタで描く。"""
from PIL import Image, ImageDraw, ImageFont

BG = "#131028"
MAGENTA = "#FF4D8D"
FONT = "/Library/Fonts/SourceHanCodeJP.ttc"


def make(size, path, glyph_ratio):
    img = Image.new("RGB", (size, size), BG)
    d = ImageDraw.Draw(img)
    font = ImageFont.truetype(FONT, int(size * glyph_ratio), index=12)  # index=12: Heavy
    bbox = d.textbbox((0, 0), "歌", font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text(((size - w) / 2 - bbox[0], (size - h) / 2 - bbox[1]), "歌", font=font, fill=MAGENTA)
    img.save(path)
    print(f"{path} ({size}x{size})")


make(192, "docs/icon-192.png", 0.62)
make(512, "docs/icon-512.png", 0.55)  # maskable兼用: 中央80%のセーフゾーンに収める
make(180, "docs/apple-touch-icon.png", 0.62)
