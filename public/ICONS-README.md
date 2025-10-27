# PWA Icons Setup

Your PWA needs icons for installation. The manifest.json references:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

## Quick Setup Options:

### Option 1: Use a PWA Icon Generator (Recommended)
1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload your logo/icon (at least 512x512 px)
3. Download the generated icons
4. Place `icon-192.png` and `icon-512.png` in the `/public` folder

### Option 2: Create Manually
1. Design your app icon (simple dumbbell, weights, or "W" logo)
2. Export as PNG at 512x512 pixels
3. Resize to 192x192 pixels for the smaller version
4. Save both as `icon-192.png` and `icon-512.png` in `/public`

### Temporary Solution:
For now, the app will work without icons, but users won't see a nice icon when installing.
You can add icons later and they'll appear on next deployment.

## Icon Design Tips:
- Keep it simple and recognizable
- Use high contrast colors
- Avoid text (it won't be readable at small sizes)
- Make sure it looks good on both light and dark backgrounds
- Consider a simple dumbbell, barbell, or fitness-related icon
