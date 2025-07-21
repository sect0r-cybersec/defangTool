# IOC Defang Extension for Microsoft Edge

A browser extension that automatically detects Indicators of Compromise (IOCs) such as IP addresses, URLs, domains, and email addresses in text inputs, and provides an option to replace them with defanged versions for safe sharing and documentation.

## Features

- **Automatic IOC Detection**: Detects IPv4, IPv6, URLs, domains, and email addresses in real-time
- **Smart Defanging**: Converts IOCs to safe, non-clickable formats following IETF draft standards
- **Hover Tooltip**: Clean, modern interface that appears above text inputs
- **One-Click Replacement**: Instantly replace IOCs with defanged versions
- **Cross-Site Compatibility**: Works on all websites and web applications
- **Dark Mode Support**: Automatically adapts to system dark mode preferences
- **Dynamic Content Support**: Handles dynamically added content and iframes
- **Performance Optimized**: Minimal impact on page performance with efficient DOM observation

## Supported IOC Types

| IOC Type | Example | Defanged Version |
|----------|---------|------------------|
| IPv4 Address | `192.168.1.1` | `192[.]168[.]1[.]1` |
| IPv6 Address | `2001:db8::1` | `[2001:db8::1]` |
| URL | `https://example.com/path` | `hxxps[:]//example[.]com[/]path` |
| Domain | `example.com` | `example[.]com` |
| Email Address | `user@example.com` | `user[@]example[.]com` |

## Installation for Microsoft Edge

### Method 1: Developer Mode Installation (Recommended)

1. **Download the Extension**
   - Download or clone this repository to your local machine
   - Extract the files if downloaded as a ZIP archive

2. **Enable Developer Mode in Edge**
   - Open Microsoft Edge
   - Navigate to `edge://extensions/` in the address bar
   - Toggle the "Developer mode" switch in the bottom left corner
   - You should see "Developer mode" appear in the top left

3. **Load the Extension**
   - Click the "Load unpacked" button that appears
   - Browse to and select the extension folder (the folder containing `manifest.json`)
   - Click "Select Folder"

4. **Verify Installation**
   - The extension should now appear in your extensions list
   - You should see "IOC Defang Extension" with version 0.5.4
   - The extension will be active immediately

### Method 2: Install from Edge Add-ons Store (Future)

*Note: This extension is not yet published to the Microsoft Edge Add-ons store.*

## Usage

1. **Automatic Detection**: The extension automatically monitors all text inputs, textareas, and contenteditable elements on web pages
2. **IOC Input**: Type or paste an IOC (IP address, URL, domain, or email) into any text field
3. **Tooltip Appearance**: A tooltip will appear above the input showing the original and defanged versions
4. **Replacement**: Click "Replace with Defanged" to instantly replace the IOC with its defanged version
5. **Manual Close**: Click the × button or click outside the tooltip to dismiss it

## How It Works

The extension uses content scripts to:
- Monitor all text inputs, textareas, and contenteditable elements
- Apply regex patterns to detect various IOC types with high accuracy
- Create a floating tooltip with defang options
- Handle dynamic content through DOM observation
- Provide seamless integration with existing web applications
- Support iframe content (with limitations)

## Defanging Rules

- **Dots (.)**: Replaced with `[.]` to prevent automatic URL detection
- **Colons (:)**: Replaced with `[:]` for protocol and IPv6 addresses
- **Slashes (/)**: Replaced with `[/]` in URLs
- **HTTP/HTTPS**: Replaced with `hxxp`/`hxxps` to prevent clickable links
- **At Symbol (@)**: Replaced with `[@]` in email addresses and URLs
- **IPv6 Addresses**: Wrapped in square brackets `[IPv6]` according to IETF standards

## Security Benefits

- **Prevents Accidental Clicks**: Defanged IOCs cannot be accidentally clicked
- **Safe Documentation**: Allows sharing of IOCs in reports and documentation
- **Reduced Risk**: Minimizes the risk of accidentally accessing malicious resources
- **Compliance**: Helps meet security documentation requirements
- **IETF Standards**: Follows established defanging standards for consistency

## Technical Details

- **Manifest Version**: 3 (Latest Edge extension standard)
- **Current Version**: 0.5.4
- **Permissions**: `activeTab` (minimal permissions for security)
- **Content Scripts**: Automatically injected on all websites
- **CSS**: Responsive design with dark mode support
- **JavaScript**: Modern ES6+ with class-based architecture
- **Performance**: Optimized for minimal impact with efficient DOM observation

## Browser Compatibility

- ✅ Microsoft Edge (Chromium-based) - Primary target
- ✅ Google Chrome
- ✅ Other Chromium-based browsers

## Development

### File Structure
```
defangTool/
├── manifest.json      # Extension configuration
├── content.js         # Main content script (782 lines)
├── styles.css         # Tooltip styling
├── popup.html         # Extension popup interface
├── icon.svg           # Extension icon
├── README.md          # This file
└── test.html          # Testing page
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
5. Verify the extension version is 0.5.4

### Tooltip Not Appearing
1. Verify you're typing a valid IOC format
2. Ensure the text input is not in an iframe (limited support)
3. Check if the website has strict Content Security Policy
4. Try refreshing the page and testing again

### Performance Issues
- The extension is optimized for minimal performance impact
- DOM observation is used efficiently to handle dynamic content
- Regex patterns are compiled once for better performance
- Buttons are only created when IOCs are detected

## Contributing

Contributions are welcome! Please feel free to:
- Report bugs or issues
- Suggest new features
- Submit pull requests
- Improve documentation

## License

This project is open source and available under the MIT License.

## Version History

- **v0.5.4**: Current version with comprehensive IOC detection and defanging
- **v1.0**: Initial release with basic IOC detection and defanging

## Support

For issues, questions, or feature requests, please create an issue in the project repository.

---

**Note**: This extension is designed for security professionals, researchers, and anyone who needs to safely handle IOCs in their daily work. Always verify defanged IOCs before sharing them in security reports. The extension follows IETF draft standards for defanging to ensure consistency across the security community. 