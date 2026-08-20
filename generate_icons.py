import os
import sys

def generate_pngs():
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print("PIL is not installed. Trying to install pillow...")
        import subprocess
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
            from PIL import Image, ImageDraw
        except Exception as e:
            print(f"Failed to install pillow: {e}")
            # Create a simple fallback binary PNG file using bytes to avoid 404s
            create_fallback_pngs()
            return

    # Draw a matching clean logo representation in PIL
    sizes = [192, 512]
    for size in sizes:
        # Create image with soft background matching logo
        img = Image.new("RGBA", (size, size), (248, 250, 252, 255))
        draw = ImageDraw.Draw(img)
        
        # Scale factor
        s = size / 500.0
        
        # Draw background circle
        draw.ellipse([10*s, 10*s, 490*s, 490*s], fill=(255, 255, 255, 255))
        
        # Draw abstract shapes representing graduating student
        # Amber grad student head (offset x: 280, y: 120, r: 22)
        draw.ellipse([(280-22)*s, (120-22)*s, (280+22)*s, (120+22)*s], fill=(245, 158, 11, 255))
        # Blue grad student head (offset x: 160, y: 200, r: 16)
        draw.ellipse([(160-16)*s, (200-16)*s, (160+16)*s, (200+16)*s], fill=(14, 165, 233, 255))
        
        # Save image
        filename = f"icon-{size}.png"
        img.save(filename, "PNG")
        print(f"Generated {filename}")

def create_fallback_pngs():
    # 1x1 pixel PNGs represented in bytes as fallbacks
    transparent_png_bytes = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc`\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    for size in [192, 512]:
        filename = f"icon-{size}.png"
        if not os.path.exists(filename):
            with open(filename, 'wb') as f:
                f.write(transparent_png_bytes)
            print(f"Generated fallback empty {filename}")

if __name__ == "__main__":
    generate_pngs()
