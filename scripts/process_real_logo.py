from PIL import Image, ImageDraw, ImageFilter
import numpy as np

# Load original user uploaded real logo
src_path = r'C:\Users\Asad\.gemini\antigravity-ide\brain\696d305d-d466-4da7-bfdc-7ed1f80652ac\.user_uploaded\media_1787855863785.png'
img = Image.open(src_path).convert('RGBA')

# Crop to the exact logo boundary (x=46..344, y=41..339)
# Center is at roughly x=195, y=190, radius ~148
crop_box = (45, 41, 345, 341)
cropped = img.crop(crop_box)
w, h = cropped.size

# High-res upscale with Lanczos for smooth display
scale = 4
target_size = (w * scale, h * scale)
upscaled = cropped.resize(target_size, Image.Resampling.LANCZOS)
uw, uh = target_size

# Create a circular mask for clean edge without gray fringe
mask = Image.new('L', (uw, uh), 0)
draw = ImageDraw.Draw(mask)
# Circle diameter
draw.ellipse((4, 4, uw - 4, uh - 4), fill=255)

# Smooth mask edges
mask = mask.filter(ImageFilter.GaussianBlur(1.0))

# Create RGBA logo with transparency
clean_logo = Image.new('RGBA', (uw, uh), (0, 0, 0, 0))
clean_logo.paste(upscaled, (0, 0), mask=mask)

# Save transparent PNG version
clean_logo.save('public/images/ubit_logo.png', 'PNG')

# Save square white-bg JPG version for backwards compatibility and open-graph
bg_white = Image.new('RGB', (uw, uh), (255, 255, 255))
bg_white.paste(clean_logo, (0, 0), mask=clean_logo.split()[3])
bg_white.save('public/images/ubit_logo.jpg', 'JPEG', quality=98)

print(f"Successfully processed authentic UBIT logo to 1200x1200: public/images/ubit_logo.png & public/images/ubit_logo.jpg")
