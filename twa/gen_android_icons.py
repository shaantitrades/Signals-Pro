"""Generate all Android icons required for TWA/PWA submission to Google Play Store.
Based on the same arrow design as existing icons (red SELL arrow + green BUY arrow)."""

from PIL import Image, ImageDraw
import math
import os

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'icons')
os.makedirs(OUT_DIR, exist_ok=True)

# ======== DRAWING UTILS ========
def draw_arrow(draw, cx, cy, size, angle_deg, color):
    """Draw a thick arrow rotated by angle_deg around (cx, cy)."""
    angle = math.radians(angle_deg)
    cos_a = math.cos(angle)
    sin_a = math.sin(angle)
    s = size
    points = [
        (0, -0.42*s),        # tip
        (-0.24*s, -0.10*s),  # head left
        (-0.09*s, -0.10*s),  # shaft left top
        (-0.09*s, 0.42*s),   # shaft left bottom
        (0.09*s, 0.42*s),    # shaft right bottom
        (0.09*s, -0.10*s),   # shaft right top
        (0.24*s, -0.10*s),   # head right
    ]
    rotated = []
    for (x, y) in points:
        rx = x * cos_a - y * sin_a + cx
        ry = x * sin_a + y * cos_a + cy
        rotated.append((rx, ry))
    draw.polygon(rotated, fill=color)


def create_icon(size, bg_color=(15, 23, 42, 255), rounded=True, adaptive=False, padding_ratio=0):
    """Create an icon with the double-arrow design.
    adaptive: if True, adds extra transparent padding for adaptive icons (108dp on 108dp safe zone)."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    if rounded and bg_color:
        # Draw rounded background
        r = size // 5
        draw.rounded_rectangle([0, 0, size-1, size-1], radius=r, fill=bg_color)

    if adaptive:
        # For adaptive icons, draw the arrows in the safe zone (center 66.67% = 72dp of 108dp)
        safe_margin = int(size * 0.1667)
        drawable_size = size - 2 * safe_margin
        cx = size / 2
        cy = size / 2
        arrow_size = drawable_size * 0.75
    elif padding_ratio > 0:
        # Legacy icon with padding
        drawable_size = int(size * (1 - 2 * padding_ratio))
        pad = int(size * padding_ratio)
        cx = size / 2
        cy = size / 2
        arrow_size = drawable_size * 0.78
        draw = ImageDraw.Draw(img)  # re-get draw after potential rounded rectangle
    else:
        cx = size / 2
        cy = size / 2
        arrow_size = size * 0.78

    # Red arrow: rotated 135° (upper-left → lower-right = SELL)
    draw_arrow(draw, cx, cy, arrow_size, 135, (239, 68, 68, 255))
    # Green arrow: rotated 45° (lower-left → upper-right = BUY)
    draw_arrow(draw, cx, cy, arrow_size, 45, (34, 197, 94, 255))

    return img


def create_adaptive_foreground(size):
    """Create adaptive icon foreground (transparent background, arrows only)."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # Safe zone: center 66.67%
    safe_margin = int(size * 0.1667)
    drawable_size = size - 2 * safe_margin
    cx = size / 2
    cy = size / 2
    arrow_size = drawable_size * 0.75
    draw_arrow(draw, cx, cy, arrow_size, 135, (239, 68, 68, 255))
    draw_arrow(draw, cx, cy, arrow_size, 45, (34, 197, 94, 255))
    return img


def create_adaptive_background(size, color=(15, 23, 42, 255)):
    """Create adaptive icon background (solid color)."""
    img = Image.new('RGBA', (size, size), color)
    return img


# ======== ICON SIZES (mipmap) ========
SIZES = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192,
    'xxxhdpi_foreground': 432,  # adaptive icon foreground (108dp * 4)
    'xxxhdpi_background': 432,  # adaptive icon background
}

# ======== TEMPLATE FILES (for Bubblewrap) ========
TEMPLATE_ICONS = {
    # Square icons (legacy, no mask)
    'maskable': [192, 512],
    # Large icon for Play Store listing
    'playstore': 512,
}

print("Generating Android launcher icons (mipmap)...")
for density, size in SIZES.items():
    if density == 'xxxhdpi_foreground':
        img = create_adaptive_foreground(size)
        filename = 'ic_foreground.png'
        img.save(os.path.join(OUT_DIR, filename))
        print(f'  {filename} ({size}x{size}) - adaptive foreground')
    elif density == 'xxxhdpi_background':
        img = create_adaptive_background(size, color=(15, 23, 42, 255))
        filename = 'ic_background.png'
        img.save(os.path.join(OUT_DIR, filename))
        print(f'  {filename} ({size}x{size}) - adaptive background')
    else:
        # Legacy icons
        folder = f'mipmap-{density}'
        os.makedirs(os.path.join(OUT_DIR, folder), exist_ok=True)
        img = create_icon(size, rounded=True, padding_ratio=0.08)
        filename = os.path.join(folder, 'ic_launcher.png')
        img.save(os.path.join(OUT_DIR, filename))
        print(f'  {filename} ({size}x{size}) - legacy')

# Generate maskable icons (with safe zone padding for Android)
print("\nGenerating maskable/shortcut icons...")
for size in TEMPLATE_ICONS['maskable']:
    img = create_icon(size, rounded=True, padding_ratio=0.1667)  # 16.67% padding = Android adaptive safe zone
    filename = f'maskable_{size}.png'
    img.save(os.path.join(OUT_DIR, filename))
    print(f'  {filename} ({size}x{size})')

# Play Store listing icon (512x512, rounded, full art)
print("\nGenerating Play Store listing icon...")
img = create_icon(512, rounded=True)
img.save(os.path.join(OUT_DIR, 'playstore_icon.png'))
print(f'  playstore_icon.png (512x512)')

# Also generate notification icon (small, just the arrows on transparent bg)
print("\nGenerating notification icon...")
notif_img = Image.new('RGBA', (96, 96), (0, 0, 0, 0))
draw = ImageDraw.Draw(notif_img)
draw_arrow(draw, 48, 48, 80, 135, (239, 68, 68, 255))
draw_arrow(draw, 48, 48, 80, 45, (34, 197, 94, 255))
notif_img.save(os.path.join(OUT_DIR, 'ic_notification.png'))
print(f'  ic_notification.png (96x96)')

print(f"\n✅ All Android icons generated in: {OUT_DIR}")
print(f"Total files: {len(os.listdir(OUT_DIR))} items (including subdirectories)")