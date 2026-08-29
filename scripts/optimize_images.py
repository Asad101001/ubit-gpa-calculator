import os
from PIL import Image

images_dir = 'public/images'

def optimize():
    # 1. Optimize ubit_logo.png (currently 1200x1200 at 1.1MB)
    logo_path = os.path.join(images_dir, 'ubit_logo.png')
    if os.path.exists(logo_path):
        img = Image.open(logo_path).convert('RGBA')
        # 300x300 is more than 3x the display size on retina displays
        img = img.resize((300, 300), Image.Resampling.LANCZOS)
        img.save(logo_path, 'PNG', optimize=True)
        print(f"Optimized {logo_path}: {os.path.getsize(logo_path)/1024:.1f} KB")

    # 2. Optimize ubit_logo.jpg
    logo_jpg = os.path.join(images_dir, 'ubit_logo.jpg')
    if os.path.exists(logo_jpg):
        img = Image.open(logo_jpg).convert('RGB')
        img = img.resize((300, 300), Image.Resampling.LANCZOS)
        img.save(logo_jpg, 'JPEG', quality=85, optimize=True)
        print(f"Optimized {logo_jpg}: {os.path.getsize(logo_jpg)/1024:.1f} KB")

    # 3. Optimize background images (ubit_building_night.jpg, campus_bg.jpg, ubit_building_day.jpg)
    bg_files = ['ubit_building_night.jpg', 'campus_bg.jpg', 'ubit_building_day.jpg', 'ubit_tech_bg.jpg']
    for bf in bg_files:
        fp = os.path.join(images_dir, bf)
        if os.path.exists(fp):
            orig_size = os.path.getsize(fp) / 1024
            img = Image.open(fp).convert('RGB')
            # Scale down if width > 1600
            w, h = img.size
            if w > 1600:
                new_h = int(h * (1600 / w))
                img = img.resize((1600, new_h), Image.Resampling.LANCZOS)
            img.save(fp, 'JPEG', quality=75, optimize=True, progressive=True)
            new_size = os.path.getsize(fp) / 1024
            print(f"Optimized {bf}: {orig_size:.1f} KB -> {new_size:.1f} KB")

if __name__ == '__main__':
    optimize()
