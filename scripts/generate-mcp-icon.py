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

    # Thin gold inner frame — editorial poster discipline at icon scale.
    # Same gesture as every section rule in the app.
    inset = 36
    for i in range(6):
        draw.rectangle(
            [inset + i, inset + i, SIZE - inset - 1 - i, SIZE - inset - 1 - i],
            outline=GOLD_DEEP if i < 2 else GOLD,
        )

    # Classic two-letter monogram VC — V (creme) in front, C (gold)
    # behind, both centred on the same baseline with deliberate overlap.
    # Layered drawing order matters: C first, then V on top.
    #
    # Font size 300 (was 380): leaves breathing room between glyphs and
    # the editorial frame; tighter than that and at 32 px the mark
    # bleeds into the border line.
    font_size = 300
    font = find_serif_font(font_size)

    # Measure both glyphs so we can interlock them precisely.
    bbox_v = draw.textbbox((0, 0), "V", font=font)
    bbox_c = draw.textbbox((0, 0), "C", font=font)
    vw, vh = bbox_v[2] - bbox_v[0], bbox_v[3] - bbox_v[1]
    cw, ch = bbox_c[2] - bbox_c[0], bbox_c[3] - bbox_c[1]

    # Overlap ratio: how much horizontal space the two letters share.
    # 0.30 means the right side of V overlaps the left side of C by 30 %.
    # Tuned by eye — bigger overlap muddies at small sizes, smaller
    # overlap looks like two separate letters rather than one mark.
    overlap = 0.30
    combined_w = vw + cw - int(min(vw, cw) * overlap)
    baseline_y = (SIZE - vh) // 2 - bbox_v[1] - 18

    # C goes down first (gold, behind), offset to the right.
    cx_start = (SIZE - combined_w) // 2 + (vw - int(min(vw, cw) * overlap)) - bbox_c[0]
    draw.text((cx_start, baseline_y - bbox_c[1] + bbox_v[1]), "C", fill=GOLD, font=font)

    # V goes down second (creme, in front), offset to the left.
    vx_start = (SIZE - combined_w) // 2 - bbox_v[0]
    draw.text((vx_start, baseline_y), "V", fill=CREME, font=font)

    out = Path("public/mcp-icon.png")
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, format="PNG", optimize=True)
    print(f"wrote {out.resolve()} — {out.stat().st_size // 1024} KiB")


if __name__ == "__main__":
    main()
