#!/usr/bin/env python3
"""
Generate app icons from mascot image
Creates icon.png, adaptive-icon.png, and splash.png
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Paths
mascot_path = "src/assets/mascot/maskot.png"
output_dir = "assets"

# Brand colors
bg_color = (205, 233, 249)  # #CDE9F9 - Baby blue
pink_color = (249, 221, 235)  # #F9DDEB - Soft pink

# Ensure output directory exists
os.makedirs(output_dir, exist_ok=True)

print("🎨 Generating Umai app icons from mascot...")

try:
    # Load mascot
    mascot = Image.open(mascot_path).convert("RGBA")
    print(f"✅ Loaded mascot: {mascot.size}")
    
    # 1. Generate icon.png (1024x1024) - Square icon
    print("\n📱 Generating icon.png (1024x1024)...")
    icon_size = 1024
    icon = Image.new("RGBA", (icon_size, icon_size), bg_color + (255,))
    
    # Resize mascot to fit (90% of icon size)
    mascot_size = int(icon_size * 0.9)
    mascot_resized = mascot.resize((mascot_size, mascot_size), Image.Resampling.LANCZOS)
    
    # Center mascot
    x = (icon_size - mascot_size) // 2
    y = (icon_size - mascot_size) // 2
    icon.paste(mascot_resized, (x, y), mascot_resized)
    
    # Convert to RGB for saving
    icon_rgb = Image.new("RGB", icon.size, bg_color)
    icon_rgb.paste(icon, mask=icon.split()[3])
    icon_rgb.save(f"{output_dir}/icon.png", "PNG", quality=95)
    print(f"✅ Saved: {output_dir}/icon.png")
    
    # 2. Generate adaptive-icon.png (1024x1024) - Foreground only
    print("\n🎭 Generating adaptive-icon.png (1024x1024)...")
    adaptive = Image.new("RGBA", (icon_size, icon_size), (0, 0, 0, 0))
    
    # Mascot slightly larger for adaptive (80% to account for safe zone)
    mascot_adaptive_size = int(icon_size * 0.8)
    mascot_adaptive = mascot.resize((mascot_adaptive_size, mascot_adaptive_size), Image.Resampling.LANCZOS)
    
    # Center
    x = (icon_size - mascot_adaptive_size) // 2
    y = (icon_size - mascot_adaptive_size) // 2
    adaptive.paste(mascot_adaptive, (x, y), mascot_adaptive)
    
    adaptive.save(f"{output_dir}/adaptive-icon.png", "PNG")
    print(f"✅ Saved: {output_dir}/adaptive-icon.png")
    
    # 3. Generate splash.png (1284x2778 - iPhone 14 Pro Max)
    print("\n🌊 Generating splash.png (1284x2778)...")
    splash_width = 1284
    splash_height = 2778
    splash = Image.new("RGB", (splash_width, splash_height), bg_color)
    
    # Add mascot in center
    mascot_splash_size = int(splash_width * 0.5)  # 50% of width
    mascot_splash = mascot.resize((mascot_splash_size, mascot_splash_size), Image.Resampling.LANCZOS)
    
    # Center mascot
    x = (splash_width - mascot_splash_size) // 2
    y = (splash_height - mascot_splash_size) // 2 - 200  # Slightly above center
    
    # Create temp image for transparency
    splash_temp = Image.new("RGBA", (splash_width, splash_height), bg_color + (255,))
    splash_temp.paste(mascot_splash, (x, y), mascot_splash)
    
    # Convert to RGB
    splash = Image.new("RGB", splash_temp.size, bg_color)
    splash.paste(splash_temp, mask=splash_temp.split()[3] if len(splash_temp.split()) > 3 else None)
    
    # Add "Umai" text below mascot
    draw = ImageDraw.Draw(splash)
    
    # Try to load a nice font, fallback to default
    try:
        font_size = 120
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        font = ImageFont.load_default()
    
    text = "Umai"
    # Get text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_x = (splash_width - text_width) // 2
    text_y = y + mascot_splash_size + 50
    
    # Draw text with shadow for depth
    shadow_offset = 4
    draw.text((text_x + shadow_offset, text_y + shadow_offset), text, fill=(0, 0, 0, 50), font=font)
    draw.text((text_x, text_y), text, fill=(51, 51, 51), font=font)
    
    # Add tagline
    try:
        tagline_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 40)
    except:
        tagline_font = font
    
    tagline = "Your AI Parenting Assistant"
    bbox = draw.textbbox((0, 0), tagline, font=tagline_font)
    tagline_width = bbox[2] - bbox[0]
    tagline_x = (splash_width - tagline_width) // 2
    tagline_y = text_y + 150
    
    draw.text((tagline_x, tagline_y), tagline, fill=(102, 102, 102), font=tagline_font)
    
    splash.save(f"{output_dir}/splash.png", "PNG", quality=95)
    print(f"✅ Saved: {output_dir}/splash.png")
    
    print("\n🎉 All icons generated successfully!")
    print(f"\n📦 Generated files:")
    print(f"   - {output_dir}/icon.png (1024x1024)")
    print(f"   - {output_dir}/adaptive-icon.png (1024x1024)")
    print(f"   - {output_dir}/splash.png (1284x2778)")
    
except FileNotFoundError:
    print(f"❌ Error: Mascot file not found at {mascot_path}")
    print("Available mascot files:")
    for file in os.listdir("MASCOT"):
        if file.endswith(".png"):
            print(f"   - {file}")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
