# 🕐 Zoho Attendance Helper Extension

> ⚠️ **EDUCATIONAL PURPOSE ONLY** - This project is created solely for learning and educational purposes. **NOT for production use.** Please read the [DISCLAIMER](DISCLAIMER.md) before proceeding.

A cross-browser extension that demonstrates automated Zoho People attendance interaction for educational and learning purposes.

## 🎓 Educational Purpose

This project serves as a **learning resource** for:
- Browser extension development (Chrome & Firefox)
- Cross-browser compatibility techniques  
- Web automation concepts and DOM manipulation
- JavaScript, HTML, and CSS best practices
- Browser APIs and extension manifest understanding

## ⚠️ Important Notice

**Please read the [DISCLAIMER](DISCLAIMER.md) for important information about:**
- Why this is educational only
- Legal and ethical considerations
- Security and reliability concerns
- Proper usage guidelines

## ✨ Learning Features

- 🎯 **Cross-Browser Architecture**: Learn Manifest V2 vs V3 differences
- ⏰ **Browser APIs**: Storage, alarms, notifications, and tabs APIs
- 🔍 **DOM Manipulation**: Multiple strategies for element detection
- 📱 **Modern UI**: Responsive design with CSS animations
- 🌐 **Build System**: Automated cross-browser compilation
- 🔒 **Security Patterns**: Permission handling and content script isolation

## 🚀 Educational Setup

**For learning and development purposes only:**

### Chrome/Edge/Brave (Development)
1. Download or clone this repository
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" → Select the `chrome` folder

### Firefox/LibreWolf (Development)
1. Download or clone this repository
2. Go to `about:debugging`
3. Click "This Firefox" → "Load Temporary Add-on"
4. Select the `manifest-firefox.json` file

**Note**: Only use in development/testing environments.

## 📖 Documentation

- [⚠️ DISCLAIMER](DISCLAIMER.md) - **READ FIRST** - Educational purpose and warnings
- [📋 Installation Guide](docs/INSTALLATION.md) - Development setup instructions
- [🛠️ Development Guide](docs/DEVELOPMENT.md) - Build and contribute
- [🐛 Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and fixes

## 🎮 Learning Usage

**For educational exploration only:**

1. **Load the extension** in development mode
2. **Navigate to Zoho People** (development environment)
3. **Study the popup interface** and code structure
4. **Examine console logs** to understand the detection strategies
5. **Modify the code** to learn different approaches

### Code Learning Points
- **Cross-browser APIs**: See how Chrome and Firefox differ
- **Content script patterns**: Multiple detection strategies  
- **Build automation**: Automated cross-browser compilation
- **Modern JavaScript**: ES6+ features and async patterns

## 🔧 Development

### Prerequisites
```bash
node >= 16.0.0
npm >= 8.0.0
```

### Setup
```bash
# Clone the repository
git clone https://github.com/RatTrap1337/Zoho-Attendance-Browser-Extension.git
cd zoho-attendance-browser-extension

# Install dependencies
npm install

# Build for both browsers
npm run build

# Development with auto-reload
npm run dev:chrome   # Chrome development
npm run dev:firefox  # Firefox development
```

### Build Commands
```bash
npm run build:chrome    # Build Chrome extension
npm run build:firefox   # Build Firefox extension  
npm run build:all       # Build both versions
npm run package         # Create release packages
npm run test           # Run tests
npm run lint           # Code linting
```

## 🏗️ Architecture

The extension uses a **cross-browser compatible architecture**:

- **Shared Core**: Common logic in `src/common/`
- **Browser-Specific**: Separate manifests and entry points
- **Smart Detection**: Multiple strategies to find attendance buttons
- **Fallback Systems**: Graceful degradation when features aren't available

### How It Works

1. **Content Script** scans Zoho People pages for attendance buttons
2. **Background Script** handles scheduling and notifications  
3. **Popup Interface** provides manual controls and settings
4. **Smart Clicking** uses 5+ strategies to find the right button

## 🔒 Privacy & Security

- **Local-Only**: All data stored in browser's local storage
- **No Tracking**: Extension doesn't collect or transmit data
- **Minimal Permissions**: Only requests necessary permissions
- **Open Source**: Fully auditable code

## 📄 Permissions

| Permission | Usage | Browser |
|------------|-------|---------|
| `activeTab` | Access current Zoho People tab | Both |
| `storage` | Save settings locally | Both |
| `alarms` | Schedule automatic attendance | Both |
| `notifications` | Show success/failure alerts | Both |
| `host_permissions` | Access Zoho domains only | Both |

## 🤝 Contributing

We welcome educational contributions! Please see [DEVELOPMENT.md](docs/DEVELOPMENT.md) for guidelines.

**Remember**: All contributions should maintain the educational focus and not encourage production usage.

### Quick Start for Contributors
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/learning-improvement`
3. Make educational improvements and document them
4. Submit a pull request with learning objectives

## 📝 License

[GPL License](LICENSE) - Free for educational use, modification, and learning!

## ⚠️ Final Reminder

**This project is for educational purposes only.** 

- ❌ Do NOT use in production
- ❌ Do NOT use for actual attendance manipulation  
- ❌ Do NOT deploy in workplace environments
- ✅ DO use for learning browser extension development
- ✅ DO study the code for educational purposes
- ✅ DO respect workplace policies and ethics

## 🆘 Support

- 🐛 [Report bugs](https://github.com/RatTrap1337/Zoho-Attendance-Browser-Extension/issues)
- 💡 [Request features](https://github.com/RatTrap1337/Zoho-Attendance-Browser-Extension/issues)
- 💬 [Discussions](https://github.com/RatTrap1337/Zoho-Attendance-Browser-Extension/discussions)

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=RatTrap1337/Zoho-Attendance-Browser-Extension&type=Date)](https://star-history.com/#RatTrap1337/Zoho-Attendance-Browser-Extension&Date)

---

**Made with ❤️ for productivity, automation and learning**

> 🔗 **Related**: Check out our [Docker API version](https://github.com/RatTrap1337/Zoho-Attendance-Manager) for learning server-side automation concepts!
