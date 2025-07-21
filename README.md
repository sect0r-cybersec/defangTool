# IOC Defang Extension for Microsoft Edge

A browser extension that automatically detects Indicators of Compromise (IOCs) such as IP addresses and URLs in text inputs, and provides an option to replace them with defanged versions for safe sharing and documentation.

## Features

- **Automatic IOC Detection**: Detects IPv4, IPv6, URLs, and domains in real-time
- **Smart Defanging**: Converts IOCs to safe, non-clickable formats
- **Hover Tooltip**: Clean, modern interface that appears above text inputs
- **One-Click Replacement**: Instantly replace IOCs with defanged versions
- **Cross-Site Compatibility**: Works on all websites and web applications
- **Dark Mode Support**: Automatically adapts to system dark mode preferences

## Supported IOC Types

| IOC Type | Example | Defanged Version |
|----------|---------|------------------|
| IPv4 Address | `192.168.1.1` | `192[.]168[.]1[.]1` |
| IPv6 Address | `2001:db8::1` | `2001[:]db8[:]:1` |
| URL | `https://example.com/path` | `hxxps[:]//example[.]com[/]path` |
| Domain | `example.com` | `example[.]com` |

## Installation

### Method 1: Load Unpacked Extension (Development)

1. Download or clone this repository to your local machine
2. Open Microsoft Edge and navigate to `edge://extensions/`
3. Enable "Developer mode" by toggling the switch in the bottom left
4. Click "Load unpacked" and select the extension folder
5. The extension should now appear in your extensions list

### Method 2: Install from Edge Add-ons Store (Future)

*Note: This extension is not yet published to the Microsoft Edge Add-ons store.*

## Usage

1. **Automatic Detection**: The extension automatically monitors all text inputs on web pages
2. **IOC Input**: Type or paste an IOC (IP address, URL, domain) into any text field
3. **Tooltip Appearance**: A tooltip will appear above the input showing the original and defanged versions
4. **Replacement**: Click "Replace with Defanged" to instantly replace the IOC with its defanged version
5. **Manual Close**: Click the × button or click outside the tooltip to dismiss it

## How It Works

The extension uses content scripts to:
- Monitor all text inputs, textareas, and contenteditable elements
- Apply regex patterns to detect various IOC types
- Create a floating tooltip with defang options
- Handle dynamic content through DOM observation
- Provide seamless integration with existing web applications

## Defanging Rules

- **Dots (.)**: Replaced with `[.]` to prevent automatic URL detection
- **Colons (:)**: Replaced with `[:]` for protocol and IPv6 addresses
- **Slashes (/)**: Replaced with `[/]` in URLs
- **HTTP/HTTPS**: Replaced with `hxxp`/`hxxps` to prevent clickable links

## Security Benefits

- **Prevents Accidental Clicks**: Defanged IOCs cannot be accidentally clicked
- **Safe Documentation**: Allows sharing of IOCs in reports and documentation
- **Reduced Risk**: Minimizes the risk of accidentally accessing malicious resources
- **Compliance**: Helps meet security documentation requirements

## Technical Details

- **Manifest Version**: 3 (Latest Edge extension standard)
- **Permissions**: `activeTab`, `scripting` (minimal permissions)
- **Content Scripts**: Automatically injected on all websites
- **CSS**: Responsive design with dark mode support
- **JavaScript**: Modern ES6+ with class-based architecture

## Browser Compatibility

- ✅ Microsoft Edge (Chromium-based)
- ✅ Google Chrome
- ✅ Other Chromium-based browsers

## Development

### File Structure
```
ioc-defang-extension/
├── manifest.json      # Extension configuration
├── content.js         # Main content script
├── styles.css         # Tooltip styling
├── popup.html         # Extension popup
├── README.md          # This file
└── icons/             # Extension icons (optional)
```

### Customization

You can customize the extension by:
- Modifying regex patterns in `content.js` for different IOC detection
- Adjusting defanging rules in the `defang*` methods
- Updating the tooltip styling in `styles.css`
- Adding new IOC types by extending the `detectIOC` method

## Troubleshooting

### Extension Not Working
1. Ensure the extension is enabled in `edge://extensions/`
2. Check that Developer mode is enabled
3. Refresh the web page you're testing on
4. Check the browser console for any error messages

### Tooltip Not Appearing
1. Verify you're typing a valid IOC format
2. Ensure the text input is not in an iframe (limited support)
3. Check if the website has strict Content Security Policy

### Performance Issues
- The extension is optimized for minimal performance impact
- DOM observation is used efficiently to handle dynamic content
- Regex patterns are compiled once for better performance

## Contributing

Contributions are welcome! Please feel free to:
- Report bugs or issues
- Suggest new features
- Submit pull requests
- Improve documentation

## License

This project is open source and available under the MIT License.

## Version History

- **v1.0**: Initial release with basic IOC detection and defanging

## Support

For issues, questions, or feature requests, please create an issue in the project repository.

---

**Note**: This extension is designed for security professionals, researchers, and anyone who needs to safely handle IOCs in their daily work. Always verify defanged IOCs before sharing them in security reports. 