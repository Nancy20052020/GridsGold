#!/usr/bin/env python3
"""Generate IEEE single-column DenseNet121 architecture diagram (.drawio + .png)."""

from __future__ import annotations

import html
import uuid
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT_DIR = Path(__file__).resolve().parent
ARTIFACT_DIR = Path("/opt/cursor/artifacts")

# Single-column IEEE figure: ~3.5 in wide at 300 dpi
DPI = 300
COL_W_IN = 3.45
PX_W = int(COL_W_IN * DPI)

# Layout (logical units → pixels)
MARGIN_X = 40
BOX_W = PX_W - 2 * MARGIN_X
BOX_H = 52
GAP = 14
SECTION_GAP = 22
TITLE_H = 70
FOOTER_H = 90

# Colors — print-friendly IEEE grayscale / muted navy-gold accents
C_BORDER = (20, 20, 20)
C_TEXT = (15, 15, 15)
C_SUB = (55, 55, 55)
C_ARROW = (40, 40, 40)
C_BG = (255, 255, 255)
C_INPUT = (235, 235, 235)
C_CONV = (220, 220, 220)
C_DENSE_BLOCK = (210, 220, 235)
C_TRANSITION = (230, 225, 210)
C_HEAD = (225, 235, 225)
C_OUTPUT = (240, 230, 210)
C_SECTION = (80, 80, 80)


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    )
    return ImageFont.truetype(path, size)


# (kind, title, subtitle) — kind selects fill color
LAYERS: list[tuple[str, str, str]] = [
    ("input", "Input Knee X-ray", "224 × 224 × 3"),
    ("conv", "Conv 7×7, stride 2 + BN + ReLU", "112 × 112 × 64"),
    ("conv", "MaxPool 3×3, stride 2", "56 × 56 × 64"),
    ("dense", "Dense Block 1  (6 layers, k = 32)", "56 × 56 × 256"),
    ("trans", "Transition Layer 1  (1×1 Conv + AvgPool)", "28 × 28 × 128"),
    ("dense", "Dense Block 2  (12 layers, k = 32)", "28 × 28 × 512"),
    ("trans", "Transition Layer 2  (1×1 Conv + AvgPool)", "14 × 14 × 256"),
    ("dense", "Dense Block 3  (24 layers, k = 32)", "14 × 14 × 1024"),
    ("trans", "Transition Layer 3  (1×1 Conv + AvgPool)", "7 × 7 × 512"),
    ("dense", "Dense Block 4  (16 layers, k = 32)", "7 × 7 × 1024"),
    ("head", "Global Average Pooling 2D", "1024"),
    ("head", "Batch Normalization", "1024"),
    ("head", "Dense (512) + ReLU", "512"),
    ("head", "Dropout (0.5)", "512"),
    ("head", "Dense (128) + ReLU", "128"),
    ("head", "Dropout (0.3)", "128"),
    ("output", "Dense (3) + Softmax", "Healthy / Moderate / Severe"),
]


FILL = {
    "input": C_INPUT,
    "conv": C_CONV,
    "dense": C_DENSE_BLOCK,
    "trans": C_TRANSITION,
    "head": C_HEAD,
    "output": C_OUTPUT,
}


def compute_height() -> int:
    # title + backbone label + layers + head label gap + footer
    n = len(LAYERS)
    # section labels: "DenseNet121 Backbone (ImageNet)" before layer 0,
    # "Custom Classification Head" before GlobalAvgPool (index 10)
    h = TITLE_H + SECTION_GAP + 28  # backbone section
    h += n * BOX_H + (n - 1) * GAP
    h += SECTION_GAP + 28  # head section inserted before index 10 → extra
    h += FOOTER_H + 40
    return h


def rounded_rect(draw: ImageDraw.ImageDraw, xy, fill, outline, radius=8, width=2):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def draw_arrow(draw: ImageDraw.ImageDraw, x: int, y0: int, y1: int):
    mid_x = x
    draw.line([(mid_x, y0), (mid_x, y1 - 6)], fill=C_ARROW, width=2)
    # arrow head
    draw.polygon(
        [(mid_x, y1), (mid_x - 6, y1 - 8), (mid_x + 6, y1 - 8)],
        fill=C_ARROW,
    )


def render_png(path: Path) -> tuple[int, int]:
    font_title = load_font(28, bold=True)
    font_sec = load_font(18, bold=True)
    font_main = load_font(17, bold=True)
    font_sub = load_font(15, bold=False)
    font_cap = load_font(14, bold=False)
    font_note = load_font(12, bold=False)

    # Build vertical positions with section headers
    positions: list[tuple[str, object]] = []
    # ("section", text) or ("layer", index)

    positions.append(("section", "DenseNet121 Backbone (pre-trained, ImageNet)"))
    for i in range(10):
        positions.append(("layer", i))
    positions.append(("section", "Custom Classification Head"))
    for i in range(10, len(LAYERS)):
        positions.append(("layer", i))

    y = TITLE_H + 10
    layout: list[tuple[str, object, int]] = []  # type, payload, y_top
    for kind, payload in positions:
        if kind == "section":
            layout.append(("section", payload, y))
            y += 28 + SECTION_GAP // 2
        else:
            layout.append(("layer", payload, y))
            y += BOX_H + GAP
    # remove last gap
    y -= GAP
    y += FOOTER_H

    H = y + 20
    img = Image.new("RGB", (PX_W, H), C_BG)
    draw = ImageDraw.ImageDraw(img)

    # Title
    title = "DenseNet121 Architecture"
    tw = draw.textlength(title, font=font_title)
    draw.text(((PX_W - tw) / 2, 18), title, fill=C_TEXT, font=font_title)
    subtitle = "Osteoporosis Severity Classification  |  k = 32, 121 layers"
    sw = draw.textlength(subtitle, font=font_note)
    draw.text(((PX_W - sw) / 2, 48), subtitle, fill=C_SUB, font=font_note)

    layer_centers_x = MARGIN_X + BOX_W // 2
    prev_bottom: int | None = None

    for kind, payload, y0 in layout:
        if kind == "section":
            text = str(payload)
            # thin rule + label
            draw.line(
                [(MARGIN_X, y0 + 20), (MARGIN_X + BOX_W, y0 + 20)],
                fill=(180, 180, 180),
                width=1,
            )
            tw = draw.textlength(text, font=font_sec)
            # white pad behind text
            pad = 8
            draw.rectangle(
                [
                    (PX_W - tw) / 2 - pad,
                    y0,
                    (PX_W - tw) / 2 + tw + pad,
                    y0 + 22,
                ],
                fill=C_BG,
            )
            draw.text(((PX_W - tw) / 2, y0), text, fill=C_SECTION, font=font_sec)
            prev_bottom = None
            continue

        idx = int(payload)
        lkind, title_t, sub_t = LAYERS[idx]
        fill = FILL[lkind]

        if prev_bottom is not None:
            draw_arrow(draw, layer_centers_x, prev_bottom, y0)

        x0 = MARGIN_X
        rounded_rect(
            draw,
            [x0, y0, x0 + BOX_W, y0 + BOX_H],
            fill=fill,
            outline=C_BORDER,
            radius=6,
            width=2,
        )

        # dual-line text centered
        t1w = draw.textlength(title_t, font=font_main)
        t2w = draw.textlength(sub_t, font=font_sub)
        draw.text(
            ((PX_W - t1w) / 2, y0 + 8),
            title_t,
            fill=C_TEXT,
            font=font_main,
        )
        draw.text(
            ((PX_W - t2w) / 2, y0 + 28),
            sub_t,
            fill=C_SUB,
            font=font_sub,
        )
        prev_bottom = y0 + BOX_H

    # Caption / notes
    cap_y = prev_bottom + 28 if prev_bottom else H - 70
    caption = (
        "Fig. DenseNet121 + custom head for 3-class knee osteoporosis grading."
    )
    # wrap caption
    words = caption.split()
    lines: list[str] = []
    cur = ""
    max_w = BOX_W
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=font_cap) <= max_w:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    for i, line in enumerate(lines):
        lw = draw.textlength(line, font=font_cap)
        draw.text(((PX_W - lw) / 2, cap_y + i * 18), line, fill=C_TEXT, font=font_cap)

    note = "Total parameters: 8,571,755  |  Softmax → Healthy, Moderate, Severe"
    nw = draw.textlength(note, font=font_note)
    draw.text(
        ((PX_W - nw) / 2, cap_y + len(lines) * 18 + 8),
        note,
        fill=C_SUB,
        font=font_note,
    )

    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG", dpi=(DPI, DPI))
    return img.size


def _mx_id() -> str:
    return uuid.uuid4().hex[:8]


def generate_drawio(path: Path) -> None:
    """Write a native diagrams.net / draw.io XML file (single-column IEEE)."""

    # Use a page sized for single-column editing (mm-ish units in draw.io: 1 unit ≈ 1 px)
    page_w = 420
    box_w = 340
    box_h = 44
    gap = 18
    margin_x = (page_w - box_w) // 2
    y = 60

    cells: list[str] = []
    cells.append('<mxCell id="0"/>')
    cells.append('<mxCell id="1" parent="0"/>')

    # Title
    cells.append(
        f'''<mxCell id="title" value="DenseNet121 Architecture"
        style="text;html=1;align=center;verticalAlign=middle;fontStyle=1;fontSize=16;fontColor=#111111;"
        vertex="1" parent="1">
        <mxGeometry x="40" y="12" width="{page_w - 80}" height="28" as="geometry"/>
      </mxCell>'''
    )
    cells.append(
        f'''<mxCell id="subtitle" value="Osteoporosis Severity Classification | k = 32, 121 layers"
        style="text;html=1;align=center;verticalAlign=middle;fontSize=10;fontColor=#555555;"
        vertex="1" parent="1">
        <mxGeometry x="20" y="36" width="{page_w - 40}" height="20" as="geometry"/>
      </mxCell>'''
    )

    style_map = {
        "input": "rounded=1;whiteSpace=wrap;html=1;fillColor=#EBEBEB;strokeColor=#141414;strokeWidth=1.5;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;",
        "conv": "rounded=1;whiteSpace=wrap;html=1;fillColor=#DCDCDC;strokeColor=#141414;strokeWidth=1.5;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;",
        "dense": "rounded=1;whiteSpace=wrap;html=1;fillColor=#D2DCEB;strokeColor=#141414;strokeWidth=1.5;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;",
        "trans": "rounded=1;whiteSpace=wrap;html=1;fillColor=#E6E1D2;strokeColor=#141414;strokeWidth=1.5;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;",
        "head": "rounded=1;whiteSpace=wrap;html=1;fillColor=#E1EBE1;strokeColor=#141414;strokeWidth=1.5;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;",
        "output": "rounded=1;whiteSpace=wrap;html=1;fillColor=#F0E6D2;strokeColor=#141414;strokeWidth=1.5;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;",
    }

    def add_section(label: str) -> None:
        nonlocal y
        sid = _mx_id()
        cells.append(
            f'''<mxCell id="{sid}" value="{html.escape(label)}"
        style="text;html=1;align=center;verticalAlign=middle;fontStyle=1;fontSize=11;fontColor=#505050;"
        vertex="1" parent="1">
        <mxGeometry x="{margin_x}" y="{y}" width="{box_w}" height="22" as="geometry"/>
      </mxCell>'''
        )
        y += 30

    def add_box(kind: str, title: str, shape: str) -> str:
        nonlocal y
        cid = _mx_id()
        value = html.escape(f"{title}\n{shape}")
        cells.append(
            f'''<mxCell id="{cid}" value="{value}"
        style="{style_map[kind]}"
        vertex="1" parent="1">
        <mxGeometry x="{margin_x}" y="{y}" width="{box_w}" height="{box_h}" as="geometry"/>
      </mxCell>'''
        )
        y += box_h + gap
        return cid

    def add_edge(src: str, tgt: str) -> None:
        eid = _mx_id()
        cells.append(
            f'''<mxCell id="{eid}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;strokeColor=#282828;strokeWidth=1.5;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;"
        edge="1" parent="1" source="{src}" target="{tgt}">
        <mxGeometry relative="1" as="geometry"/>
      </mxCell>'''
        )

    add_section("DenseNet121 Backbone (pre-trained, ImageNet)")
    ids: list[str] = []
    for i, (kind, title, sub) in enumerate(LAYERS):
        if i == 10:
            add_section("Custom Classification Head")
        ids.append(add_box(kind, title, sub))

    for a, b in zip(ids, ids[1:]):
        add_edge(a, b)

    # Caption
    cells.append(
        f'''<mxCell id="caption" value="Fig. DenseNet121 + custom head for 3-class knee osteoporosis grading.&#xa;Total parameters: 8,571,755 | Softmax → Healthy, Moderate, Severe"
        style="text;html=1;align=center;verticalAlign=top;fontSize=10;fontColor=#222222;"
        vertex="1" parent="1">
        <mxGeometry x="20" y="{y + 4}" width="{page_w - 40}" height="48" as="geometry"/>
      </mxCell>'''
    )

    page_h = y + 70
    xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" agent="GridsGold-DenseNet121" version="24.7.17">
  <diagram id="densenet121" name="DenseNet121 Architecture">
    <mxGraphModel dx="1000" dy="1400" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="{page_w}" pageHeight="{page_h}" math="0" shadow="0">
      <root>
        {chr(10).join(cells)}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
'''
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(xml, encoding="utf-8")


def main() -> None:
    drawio_path = OUT_DIR / "DenseNet121_Architecture_IEEE.drawio"
    png_path = OUT_DIR / "DenseNet121_Architecture_IEEE.png"
    generate_drawio(drawio_path)
    w, h = render_png(png_path)

    # Copy to artifacts for easy download
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    art_drawio = ARTIFACT_DIR / drawio_path.name
    art_png = ARTIFACT_DIR / png_path.name
    art_drawio.write_bytes(drawio_path.read_bytes())
    art_png.write_bytes(png_path.read_bytes())

    print(f"Wrote {drawio_path}")
    print(f"Wrote {png_path} ({w}×{h} px @ {DPI} dpi, {COL_W_IN:.2f} in wide)")
    print(f"Artifacts: {art_drawio}, {art_png}")


if __name__ == "__main__":
    main()
