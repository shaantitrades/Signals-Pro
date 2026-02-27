from PIL import Image, ImageDraw
import math
import os

base = r'C:\signals new\frontend\public'

def draw_arrow(draw, cx, cy, size, angle_deg, color):
    """Draw a thick arrow rotated by angle_deg around (cx, cy)."""
    angle = math.radians(angle_deg)
    cos_a = math.cos(angle)
    sin_a = math.sin(angle)
    
    # Arrow template (pointing UP, centered at 0,0)
    # Head tip, head-left, shaft-left-top, shaft-left-bottom, shaft-right-bottom, shaft-right-top, head-right
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
    
    # Rotate and translate
    rotated = []
    for (x, y) in points:
        rx = x * cos_a - y * sin_a + cx
        ry = x * sin_a + y * cos_a + cy
        rotated.append((rx, ry))
    
    draw.polygon(rotated, fill=color)

def create_icon(size, filename, bg_color=None, rounded=False):
    if bg_color:
        img = Image.new('RGBA', (size, size), bg_color)
    else:
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    
    draw = ImageDraw.Draw(img)
    
    if rounded and bg_color:
        # Draw rounded background
        img2 = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw2 = ImageDraw.Draw(img2)
        r = size // 5
        draw2.rounded_rectangle([0, 0, size-1, size-1], radius=r, fill=bg_color)
        img = img2
        draw = ImageDraw.Draw(img)
    
    cx = size / 2
    cy = size / 2
    arrow_size = size * 0.9
    
    # Red arrow: rotated 135° (upper-left → lower-right = SELL) - drawn first (behind)
    draw_arrow(draw, cx, cy, arrow_size, 135, (239, 68, 68, 255))  # #EF4444
    
    # Green arrow: rotated 45° (lower-left → upper-right = BUY) - drawn second (in front)
    draw_arrow(draw, cx, cy, arrow_size, 45, (34, 197, 94, 255))   # #22C55E
    
    filepath = os.path.join(base, filename)
    img.save(filepath)
    print(f'Created {filename} ({size}x{size})')
    return img

# Favicon ICO (multi-size)
imgs = []
for s in [16, 32, 48]:
    img = create_icon(s, f'favicon-{s}.png')
    imgs.append(img)

ico_path = os.path.join(base, 'favicon.ico')
imgs[1].save(ico_path, format='ICO', sizes=[(16,16),(32,32),(48,48)], append_images=[imgs[0], imgs[2]])
print('Created favicon.ico')

# Web manifest icons (dark background, rounded)
create_icon(192, 'icon-192.png', bg_color=(15, 23, 42, 255), rounded=True)
create_icon(512, 'icon-512.png', bg_color=(15, 23, 42, 255), rounded=True)

# Apple touch icon
create_icon(180, 'apple-touch-icon.png', bg_color=(15, 23, 42, 255), rounded=True)

# Clean up temp files
for s in [16, 32, 48]:
    p = os.path.join(base, f'favicon-{s}.png')
    if os.path.exists(p):
        os.remove(p)

print('Done! All icons generated.')

