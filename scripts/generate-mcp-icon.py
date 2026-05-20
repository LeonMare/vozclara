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

    Cambria is preferred on Windows because its C bowl is more refined
    than Georgia's chunkier curve — closer to the editorial type we
    actually use across the app (Reforma / Tiempos in production).
    """
    candidates_win = [
        r"C:\Windows\Fonts\Cambria.ttc",
        r"C:\Windows\Fonts\cambriab.ttf",
        r"C:\Windows\Fonts\georgia.ttf",
        r"C:\Windows\Fonts\georgiab.ttf",
        r"C:\Windows\Fonts\times.ttf",
        r"C:\Windows\Fonts\timesbd.ttf",
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

    # Double-rule editorial frame — outer thicker line + 4 px gap +
    # inner hairline. Same vocabulary as a book-cover or hand-set
    # poster: two-stroke discipline reads as intentional craft, not as
    # software default.
    inset = 36
    # Outer rule: 4 px gold (slightly darker on the inside edge for
    # subtle depth without going skeuomorphic).
    for i in range(4):
        draw.rectangle(
            [inset + i, inset + i, SIZE - inset - 1 - i, SIZE - inset - 1 - i],
            outline=GOLD_DEEP if i == 0 else GOLD,
        )
    # 4 px gap, then a 1 px inner hairline.
    inner_inset = inset + 4 + 4
    draw.rectangle(
        [inner_inset, inner_inset, SIZE - inner_inset - 1, SIZE - inner_inset - 1],
        outline=GOLD,
    )

    # Two-letter monogram VC — V (creme) in front, C (gold) behind.
    # Hierarchy: V is the brand initial, drawn slightly larger; C is
    # the typographic companion, smaller and tucked behind so the eye
    # reads "V with a C cradling it" rather than two equal letters.
    v_size = 290
    c_size = 270  # ~7 % smaller — typographic hierarchy, not parity
    font_v = find_serif_font(v_size)
    font_c = find_serif_font(c_size)

    # Measure both glyphs so we can interlock them precisely.
    bbox_v = draw.textbbox((0, 0), "V", font=font_v)
    bbox_c = draw.textbbox((0, 0), "C", font=font_c)
    vw, vh = bbox_v[2] - bbox_v[0], bbox_v[3] - bbox_v[1]
    cw, ch = bbox_c[2] - bbox_c[0], bbox_c[3] - bbox_c[1]

    # Overlap ratio: 0.28 — slightly looser than v1 so each letter
    # keeps its own identity while still reading as a single mark.
    overlap = 0.28
    overlap_px = int(min(vw, cw) * overlap)
    combined_w = vw + cw - overlap_px

    # Vertical: V sits on the optical centre, C is lifted ~12 px so it
    # nests above the V's bottom-right rather than sharing the baseline.
    # That small lift turns "two letters next to each other" into "two
    # letters that belong together".
    baseline_y_v = (SIZE - vh) // 2 - bbox_v[1] - 8
    baseline_y_c = baseline_y_v - 14

    # C first (gold, behind), tucked to the right of V.
    cx_start = (SIZE - combined_w) // 2 + (vw - overlap_px) - bbox_c[0]
    draw.text((cx_start, baseline_y_c - bbox_c[1] + bbox_v[1]), "C", fill=GOLD, font=font_c)

    # V second (creme, in front).
    vx_start = (SIZE - combined_w) // 2 - bbox_v[0]
    draw.text((vx_start, baseline_y_v), "V", fill=CREME, font=font_v)

    # (No anchor dot — the double-rule frame already provides enough
    # editorial structure. Adding a dot below the monogram had two
    # problems: at hero size it competed with the mark, at 32 px it
    # turned into a stray pixel cluster that looked like a smudge.)

    out = Path("public/mcp-icon.png")
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, format="PNG", optimize=True)
    print(f"wrote {out.resolve()} — {out.stat().st_size // 1024} KiB")


if __name__ == "__main__":
    main()
