from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

# Create 1200x630 OG image
W, H = 1200, 630
img = Image.new('RGB', (W, H), '#0A0D14')
draw = ImageDraw.Draw(img)

# Optional: Draw subtle dark tech grid in background
grid_color = (25, 33, 50)
for x in range(0, W, 40):
    draw.line([(x, 0), (x, H)], fill=grid_color, width=1)
for y in range(0, H, 40):
    draw.line([(0, y), (W, y)], fill=grid_color, width=1)

# Subtle yellow ambient glow at top left and bottom right
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)
glow_draw.ellipse((-100, -100, 400, 400), fill=(255, 215, 0, 35))
glow_draw.ellipse((W - 350, H - 350, W + 100, H + 100), fill=(160, 20, 20, 45))
glow = glow.filter(ImageFilter.GaussianBlur(60))
img.paste(Image.alpha_composite(Image.new('RGBA', (W, H), (10, 13, 20, 255)), glow).convert('RGB'), (0, 0))
draw = ImageDraw.Draw(img)

# Main neo-brutalist card container
card_x0, card_y0 = 60, 50
card_x1, card_y1 = W - 60, H - 50

# Neo-brutalist shadow (solid black offset)
draw.rectangle([card_x0 + 10, card_y0 + 10, card_x1 + 10, card_y1 + 10], fill='#000000')
# Neo-brutalist card body
draw.rectangle([card_x0, card_y0, card_x1, card_y1], fill='#FFFFFF', outline='#000000', width=4)

# Top banner bar inside card
draw.rectangle([card_x0, card_y0, card_x1, card_y0 + 14], fill='#FFD700')
draw.line([(card_x0, card_y0 + 14), (card_x1, card_y0 + 14)], fill='#000000', width=3)

# Load fonts - fallback to common system fonts on Windows
def get_font(name, size, bold=False):
    candidates = [
        f"C:/Windows/Fonts/{name}{'bd' if bold else ''}.ttf",
        f"C:/Windows/Fonts/{name}.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except:
                pass
    return ImageFont.load_default()

font_badge = get_font('segoeui', 16, bold=True)
font_title = get_font('arial', 44, bold=True)
font_subtitle = get_font('segoeui', 20, bold=False)
font_features = get_font('segoeui', 17, bold=True)
font_url = get_font('segoeui', 18, bold=True)

# Place the authentic UBIT Logo
logo_path = 'public/images/ubit_logo.png'
if os.path.exists(logo_path):
    logo = Image.open(logo_path).convert('RGBA')
    logo_size = 230
    logo_resized = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    
    # Shadow behind logo
    lx = card_x0 + 50
    ly = card_y0 + 75
    draw.ellipse((lx + 6, ly + 6, lx + logo_size + 6, ly + logo_size + 6), fill='#D1D5DB')
    img.paste(logo_resized, (lx, ly), mask=logo_resized.split()[3])

# Text content positioning (right of logo)
tx = card_x0 + 320
ty = card_y0 + 60

# Batch pill badge
badge_text = "BSCS BATCH 2024–28 • OFFICIAL ACADEMIC PORTAL"
badge_w = len(badge_text) * 10.5
draw.rectangle([tx, ty, tx + badge_w, ty + 30], fill='#FEF08A', outline='#000000', width=2)
draw.text((tx + 12, ty + 5), badge_text, fill='#854D0E', font=font_badge)

# Main Title
draw.text((tx, ty + 42), "UBIT GPA CALCULATOR", fill='#000000', font=font_title)
draw.text((tx, ty + 92), "& RESULTS PORTAL", fill='#B91C1C', font=font_title)

# Department / University text
dept_text = "Umaer Basha Institute of Information Technology (UBIT)"
uni_text = "Department of Computer Science • University of Karachi"
draw.text((tx, ty + 152), dept_text, fill='#374151', font=font_subtitle)
draw.text((tx, ty + 180), uni_text, fill='#4B5563', font=font_subtitle)

# Divider line
draw.line([(card_x0 + 40, card_y0 + 335), (card_x1 - 40, card_y0 + 335)], fill='#E5E7EB', width=2)

# Features Pills Grid (4 cards at bottom)
features = [
    ("CLASS RESULTS", "Complete roster & marksheets"),
    ("GPA & CGPA", "Instant official calculation"),
    ("TARGET ADVISOR", "Simulate required marks"),
    ("STUDENT PRIVACY", "Protected & masked scores")
]

feat_w = 232
feat_h = 75
feat_start_x = card_x0 + 40
feat_start_y = card_y0 + 355

for i, (title, desc) in enumerate(features):
    fx = feat_start_x + i * (feat_w + 22)
    fy = feat_start_y
    # Pill shadow
    draw.rectangle([fx + 3, fy + 3, fx + feat_w + 3, fy + feat_h + 3], fill='#E5E7EB')
    # Pill body
    draw.rectangle([fx, fy, fx + feat_w, fy + feat_h], fill='#F9FAFB', outline='#000000', width=2)
    # Yellow accent bar on left of each pill
    draw.rectangle([fx, fy, fx + 6, fy + feat_h], fill='#FACC15')
    
    draw.text((fx + 16, fy + 14), title, fill='#111827', font=font_features)
    # Small desc
    draw.text((fx + 16, fy + 42), desc, fill='#6B7280', font=get_font('segoeui', 12, bold=False))

# Bottom URL bar
url_text = "ubit-results-28.vercel.app"
url_w = 270
ux = card_x1 - url_w - 40
uy = card_y0 + 445
draw.rectangle([ux + 4, uy + 4, ux + url_w + 4, uy + 36 + 4], fill='#000000')
draw.rectangle([ux, uy, ux + url_w, uy + 36], fill='#FFD700', outline='#000000', width=2)
draw.text((ux + 22, uy + 7), url_text, fill='#000000', font=font_url)


# Save the final image
output_path = 'public/images/og-preview.png'
img.save(output_path, 'PNG', quality=95)
print(f"Generated 1200x630 OpenGraph social preview image: {output_path}")
