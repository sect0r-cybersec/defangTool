# Quick Installation Guide

## Install IOC Defang Extension in Microsoft Edge

### Step 1: Enable Developer Mode
1. Open Microsoft Edge
2. Navigate to `edge://extensions/`
3. Toggle "Developer mode" ON (bottom left corner)

### Step 2: Load the Extension
1. Click "Load unpacked" button
2. Select the `ioc-defang-extension` folder
3. The extension should appear in your extensions list

### Step 3: Test the Extension
1. Open the `test.html` file in your browser
2. Type IOCs like `192.168.1.1` or `https://example.com` into the input fields
3. Watch for the tooltip to appear above the input
4. Click "Replace with Defanged" to see the transformation

### Step 4: Use on Any Website
- The extension works automatically on all websites
- Type or paste IOCs into any text input, textarea, or contenteditable area
- The tooltip will appear when IOCs are detected

## Supported IOC Types
- **IPv4**: `192.168.1.1` → `192[.]168[.]1[.]1`
- **IPv6**: `2001:db8::1` → `2001[:]db8[:]:1`
- **URLs**: `https://example.com` → `hxxps[:]//example[.]com`
- **Domains**: `example.com` → `example[.]com`

## Troubleshooting
- If the extension doesn't work, refresh the page
- Check that Developer mode is enabled
- Verify the extension is enabled in the extensions list
- Try the test page to confirm functionality

## Files Included
- `manifest.json` - Extension configuration
- `content.js` - Main functionality
- `styles.css` - Tooltip styling
- `popup.html` - Extension popup
- `test.html` - Test page
- `README.md` - Full documentation
- `icon.svg` - Extension icon 