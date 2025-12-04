#!/bin/bash
# Generate simple placeholder icons for build

mkdir -p assets

# Create simple PNG icons using base64 (1x1 blue pixel, will be resized by system)
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > assets/temp.png

# Use ImageMagick if available, otherwise use convert
if command -v magick &> /dev/null; then
    magick assets/temp.png -resize 1024x1024 -background "#CDE9F9" -gravity center -extent 1024x1024 assets/icon.png
    magick assets/temp.png -resize 1024x1024 -background "#CDE9F9" -gravity center -extent 1024x1024 assets/adaptive-icon.png
    magick assets/temp.png -resize 1284x2778 -background "#CDE9F9" -gravity center -extent 1284x2778 assets/splash.png
elif command -v convert &> /dev/null; then
    convert assets/temp.png -resize 1024x1024 -background "#CDE9F9" -gravity center -extent 1024x1024 assets/icon.png
    convert assets/temp.png -resize 1024x1024 -background "#CDE9F9" -gravity center -extent 1024x1024 assets/adaptive-icon.png
    convert assets/temp.png -resize 1284x2778 -background "#CDE9F9" -gravity center -extent 1284x2778 assets/splash.png
else
    # Fallback: just copy the temp file
    cp assets/temp.png assets/icon.png
    cp assets/temp.png assets/adaptive-icon.png
    cp assets/temp.png assets/splash.png
fi

rm assets/temp.png
echo "✅ Placeholder icons created"
