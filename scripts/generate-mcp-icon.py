"""
Generate the VozClara MCP server icon.

LEON MARÉ editorial brand: navy ground, gold accent, serif monogram.
Output: 512x512 PNG saved to public/mcp-icon.png so it's served at
https://vozclara.app/mcp-icon.png and uploadable to Smithery.

Run from repo root:
    py scripts/generate-mcp-icon.py
"""

from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import platform

# Brand palette (matches tailwind.config.js)
NAVY = (10, 26, 58)        # #0A1A3A — primary editorial ground
GOLD = (201, 162, 75)      # #C9A24B — primary accent
GOLD_DEEP = (166, 126, 39) # #A67E27 — deeper gold for shadow / line work
CREME = (245, 235, 200)    # #F5EBC8 — warm cream for the monogram

SIZE = 512
PADDING = 56               # safe area so the V breathes inside the square
RULE_W = 88                # gold underline width
RULE_H = 4                 # gold underline thickness


def find_serif_font(size: int) -> ImageFont.FreeTypeFont:
    """
    Walk a short list of system serif fonts so the monogram renders the
    same character across Win/Mac/Linux. Falls back to Pillow's bundled
    default which still produces an acceptable monogram.
    """
    candidates_win = [
        r"C:\Windows\Fonts\georgia.ttf",
        r"C:\Windows\Fonts\georgiab.ttf",  # bold variant
        r"C:\Windows\Fonts\times.ttf",
        r"C:\Windows\Fonts\timesbd.ttf",
        r"C:\Windows\Fonts\Cambria.ttc",
    ]
    candidates_mac = [
        "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "/System/Library/Fonts/Times.ttc",
    ]
    candidates_linux = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
    ]
    candidates = candidates_win if platform.system() == "Windows" else (
        candidates_mac if platform.system() == "Darwin" else candidates_linux
    )
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def main() -> None:
    img = Image.new("RGB", (SIZE, SIZE), NAVY)
    draw = ImageDraw.Draw(img)

    # Thin gold inner frame — pulls the editorial poster discipline into
    # the icon without looking busy. 6 px stroke, 36 px inset. Same
    # gesture as every editorial section rule in the app.
    inset = 36
    for i in range(6):
        draw.rectangle(
            [inset + i, inset + i, SIZE - inset - 1 - i, SIZE - inset - 1 - i],
            outline=GOLD_DEEP if i < 2 else GOLD,
        )

    # Monogram "V" — large serif, creme on navy. Bigger than v1 because
    # there is no wordmark stealing vertical space; the glyph fills
    # roughly 70 % of the inner safe area so it still reads at 32×32.
    font = find_serif_font(440)
    text = "V"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = (SIZE - tw) // 2 - bbox[0]
    ty = (SIZE - th) // 2 - bbox[1] - 12  # tiny optical nudge so the V sits centred
    draw.text((tx, ty), text, fill=CREME, font=font)

    # Single gold accent dot above the V — a quiet diacritic that
    # references "voz" (voice) without going literal with a sound-wave
    # cliché. 12 px circle, gold, vertically tucked just above the V's
    # crown. Stays visible at small sizes as a single gold pixel cluster.
    accent_r = 11
    cx = SIZE // 2
    cy = inset + 38
    draw.ellipse(
        [cx - accent_r, cy - accent_r, cx + accent_r, cy + accent_r],
        fill=GOLD,
    )

    out = Path("public/mcp-icon.png")
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, format="PNG", optimize=True)
    print(f"wrote {out.resolve()} — {out.stat().st_size // 1024} KiB")


if __name__ == "__main__":
    main()
