"""Generate the Invoice Studio app icon and installer art."""
import os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
SS = 2  # supersample factor for crisp anti-aliasing
S = 1024

INK = (28, 25, 23, 255)      # stone-900 background
WHITE = (255, 255, 255, 255)
ROW = (120, 113, 108, 255)   # stone-500 (invoice rows)


def rr(d, box, radius, fill):
    d.rounded_rectangle(box, radius=radius, fill=fill)


def draw_icon(size_px, margin_ratio=0.0625):
    px = size_px * SS
    img = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    s = px / 1024.0

    def sc(v):
        return v * s

    # Rounded-square background
    m = sc(64)
    rr(d, [m, m, px - m, px - m], radius=sc(224), fill=INK)

    # Receipt body (rounded top, torn/zigzag bottom)
    x0, x1 = sc(292), sc(732)
    y0, yb = sc(250), sc(690)
    rr(d, [x0, y0, x1, yb], radius=sc(40), fill=WHITE)
    d.rectangle([x0, sc(650), x1, yb], fill=WHITE)  # square off bottom corners

    teeth = 7
    tw = (x1 - x0) / teeth
    th = sc(46)
    for i in range(teeth):
        xs = x0 + i * tw
        d.polygon([(xs, yb), (xs + tw, yb), (xs + tw / 2, yb + th)], fill=WHITE)

    # Invoice content
    def bar(x_a, y_a, x_b, y_b, fill):
        h = y_b - y_a
        rr(d, [sc(x_a), sc(y_a), sc(x_b), sc(y_b)], radius=h / 2, fill=fill)

    bar(330, 300, 568, 340, INK)      # title
    bar(330, 392, 540, 420, ROW)      # row 1 label
    bar(612, 392, 694, 420, ROW)      # row 1 amount
    bar(330, 446, 500, 474, ROW)      # row 2 label
    bar(636, 446, 694, 474, ROW)      # row 2 amount
    bar(330, 500, 524, 528, ROW)      # row 3 label
    bar(624, 500, 694, 528, ROW)      # row 3 amount
    d.rounded_rectangle([sc(330), sc(566), sc(694), sc(572)], radius=sc(3), fill=ROW)
    bar(330, 590, 476, 628, INK)      # total label (bold)
    bar(584, 590, 694, 628, INK)      # total amount (bold)

    return img.resize((size_px, size_px), Image.LANCZOS)


def main():
    master = draw_icon(1024)
    master.save(os.path.join(HERE, "icon.png"))

    sizes = [16, 24, 32, 48, 64, 128, 256]
    # Pillow downscales the 256px master to every listed size inside the .ico.
    draw_icon(256).save(
        os.path.join(HERE, "icon.ico"),
        format="ICO",
        sizes=[(s, s) for s in sizes],
    )

    # NSIS installer welcome/finish sidebar (164x314 BMP, 24-bit)
    side = Image.new("RGB", (164 * SS, 314 * SS), (28, 25, 23))
    logo = draw_icon(104).resize((104 * SS, 104 * SS), Image.LANCZOS)
    side.paste(logo, ((164 * SS - 104 * SS) // 2, 40 * SS), logo)
    side = side.resize((164, 314), Image.LANCZOS)
    side.save(os.path.join(HERE, "installerSidebar.bmp"))

    print("Wrote icon.png, icon.ico (%s sizes), installerSidebar.bmp" % len(sizes))


if __name__ == "__main__":
    main()
