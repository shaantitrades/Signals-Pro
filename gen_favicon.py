from PIL import Image, ImageDraw
import math

def create_favicon(size):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = size / 2, size / 2
    
    head_h = size * 0.35
    head_w = size * 0.55
    shaft_w = size * 0.25
    
    arrow = [
        (0, -size*0.45),
        (head_w/2, -size*0.45 + head_h),
        (shaft_w/2, -size*0.45 + head_h),
        (shaft_w/2, size*0.45),
        (-shaft_w/2, size*0.45),
        (-shaft_w/2, -size*0.45 + head_h),
        (-head_w/2, -size*0.45 + head_h),
    ]
    
    def rotate_translate(pts, angle_deg, tx, ty):
        a = math.radians(angle_deg)
        return [(cx + tx + x*math.cos(a) - y*math.sin(a),
                 cy + ty + x*math.sin(a) + y*math.cos(a)) for x, y in pts]
    
    offset = size * 0.08
    
    red_pts = rotate_translate(arrow, 135, -offset, offset)
    draw.polygon(red_pts, fill=(239, 68, 68, 255))
    
    green_pts = rotate_translate(arrow, 45, offset, -offset)
    draw.polygon(green_pts, fill=(34, 197, 94, 255))
    
    return img

img64 = create_favicon(64)
img32 = create_favicon(32)
img16 = create_favicon(16)

img64.save('c:/signals new/frontend/public/favicon.ico', format='ICO', sizes=[(16,16),(32,32),(64,64)])
print('favicon.ico created')
