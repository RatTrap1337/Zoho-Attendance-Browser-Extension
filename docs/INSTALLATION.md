# 📋 Installation Guide

> ⚠️ **Educational Purpose Only** - This guide is for learning browser extension development. Never install in production environments.

Learn how to install and configure browser extensions for educational exploration of cross-browser development techniques.

## 🎓 Learning Objectives

After following this guide, you'll understand:
- Browser extension installation processes across different browsers
- Development vs production extension deployment
- Extension permission models and security implications
- Cross-browser compatibility differences
- Extension debugging and development tools

## 📋 Prerequisites

### Required Software
```bash
# Modern browsers for learning
Chrome/Chromium >= 88
Firefox >= 78
Edge >= 88

# Development tools
Node.js >= 16.0.0 (for build process)
npm >= 8.0.0
Git >= 2.30.0

# Code editor (recommended)
VS Code with extensions:
- Extension Pack for Visual Studio Code
- JavaScript (ES6) code snippets
- Docker (if using containerized development)
```

### Educational Setup Requirements
- **Test browser profiles** (separate from personal browsing)
- **Development-only Zoho account** (never use production accounts)
- **Local development environment** for safe experimentation

## 🚀 Quick Installation (Learning)

### For Chrome/Chromium/Edge

#### Method 1: Load Unpacked (Development)
```bash
# 1. Clone the educational repository
git clone [your-repository-url]
cd zoho-attendance-extension

# 2. Build the Chrome extension
npm install
npm run build:chrome

# 3. Load in Chrome
# - Open Chrome and navigate to chrome://extensions/
# - Enable "Developer mode" (top-right toggle)
# - Click "Load unpacked"
# - Select the dist/chrome folder
# - Extension should appear in your toolbar
```

#### Method 2: Using Build Script
```bash
# Automated development installation
npm run dev:chrome

# This will:
# - Build the extension
# - Watch for file changes
# - Auto-rebuild on modifications
```

### For Firefox/LibreWolf

#### Method 1: Temporary Installation
```bash
# 1. Build the Firefox extension
npm run build:firefox

# 2. Load in Firefox
# - Open Firefox and navigate to about:debugging
# - Click "This Firefox"
# - Click "Load Temporary Add-on"
# - Select dist/firefox/manifest.json
# - Extension loads for current session only
```

#### Method 2: Web-ext Development
```bash
# Install web-ext tool
npm install -g web-ext

# Run Firefox with extension
npm run serve:firefox

# This will:
# - Build the extension
# - Launch Firefox with extension loaded
# - Enable hot reloading for development
```

## 🔧 Detailed Installation Steps

### Step 1: Repository Setup
```bash
# Clone for educational study
git clone [repository-url]
cd zoho-attendance-extension

# Study project structure
ls -la
cat README.md
cat DISCLAIMER.md  # READ FIRST!

# Examine the build configuration
cat package.json
cat manifest-chrome.json
cat manifest-firefox.json
```

### Step 2: Build Environment Setup
```bash
# Install build dependencies
npm install

# Verify build tools
npm run build --dry-run

# Study build outputs
npm run build:all
ls -la dist/
```

### Step 3: Chrome Installation (Educational)

#### Enable Developer Mode
1. **Open Chrome Extensions Page**
   ```
   Navigate to: chrome://extensions/
   ```

2. **Enable Developer Mode**
   ```
   Toggle "Developer mode" switch (top-right)
   New buttons will appear: "Load unpacked", "Pack extension", "Update"
   ```

3. **Load Extension**
   ```
   Click "Load unpacked"
   Navigate to: [project]/dist/chrome/
   Click "Select Folder"
   ```

4. **Verify Installation**
   ```
   Extension appears in extension list
   Icon should appear in browser toolbar
   Check for any error messages
   ```

#### Chrome Installation Verification
```bash
# Check extension in Chrome
# 1. Extension appears in chrome://extensions/
# 2. Icon visible in toolbar
# 3. Popup opens when clicked
# 4. No error messages in console
```

### Step 4: Firefox Installation (Educational)

#### Temporary Installation Process
1. **Open Firefox Debugging Page**
   ```
   Navigate to: about:debugging
   ```

2. **Access This Firefox**
   ```
   Click "This Firefox" in left sidebar
   Page shows temporary extensions and add-ons
   ```

3. **Load Extension**
   ```
   Click "Load Temporary Add-on..."
   Navigate to: [project]/dist/firefox/
   Select: manifest.json
   Click "Open"
   ```

4. **Verify Installation**
   ```
   Extension appears in temporary extensions list
   Icon should appear in Firefox toolbar
   Extension ID is generated automatically
   ```

#### Firefox Development Installation
```bash
# Using web-ext for development
cd dist/firefox
web-ext run

# This will:
# - Launch fresh Firefox profile
# - Load extension automatically
# - Enable hot reloading
# - Show detailed console output
```

### Step 5: Permission Configuration

#### Understanding Extension Permissions
```json
// Chrome manifest permissions
{
  "permissions": [
    "activeTab",      // Access to current tab
    "storage",        // Local data storage
    "alarms",         // Scheduled tasks
    "notifications"   // Desktop notifications
  ],
  "host_permissions": [
    "https://people.zoho.com/*"  // Zoho domain access
  ]
}
```

#### Firefox Permission Differences
```json
// Firefox manifest permissions (all in permissions array)
{
  "permissions": [
    "activeTab",
    "storage", 
    "alarms",
    "notifications",
    "https://people.zoho.com/*"
  ]
}
```

## 🌍 Cross-Browser Installation

### Installing on Multiple Browsers (Learning)
```bash
# Build all browser versions
npm run build:all

# Chrome/Edge installation
# 1. Load dist/chrome in chrome://extensions/
# 2. Enable developer mode
# 3. Load unpacked extension

# Firefox installation  
# 1. Load dist/firefox in about:debugging
# 2. Load temporary add-on
# 3. Select manifest.json

# Compare behavior across browsers
# - Note UI differences
# - Test feature compatibility
# - Study manifest differences
```

### Browser-Specific Considerations

#### Chrome/Chromium/Edge
```
✅ Full Manifest V3 support
✅ Service worker background scripts
✅ Chrome extension API compatibility
✅ Automatic updates (in production)
⚠️  Stricter security policies
```

#### Firefox/LibreWolf
```
✅ Manifest V2 support (stable)
✅ Traditional background pages
✅ WebExtensions API compatibility
✅ Enhanced privacy features
⚠️  Different API implementations
```

## 🔍 Verification and Testing

### Installation Verification Checklist
```bash
# Visual verification
□ Extension icon appears in browser toolbar
□ Extension listed in browser's extension management
□ No error badges or warnings on extension
□ Popup opens when extension icon is clicked

# Functional verification  
□ Popup UI loads correctly
□ Console shows no JavaScript errors
□ Extension can access Zoho People pages
□ Settings persist between browser sessions

# Permission verification
□ Extension requests appropriate permissions
□ No excessive permission warnings
□ Host permissions work on Zoho domains
□ Storage permissions allow settings to save
```

### Testing Extension Functionality
```bash
# Basic functionality test
1. Click extension icon → Popup should open
2. Navigate to people.zoho.com → Status should show "Connected"
3. Try manual check-in button → Should attempt to find buttons
4. Check browser console → Look for extension logs
5. Test settings toggle → Auto-schedule should enable/disable

# Cross-browser compatibility test
1. Install on Chrome and Firefox
2. Compare popup appearance and behavior
3. Test same functionality on both browsers
4. Note any browser-specific differences
5. Verify manifest compatibility
```

## 🛠️ Development Installation

### Hot Reloading Setup (Chrome)
```bash
# Install development dependencies
npm install --save-dev chokidar-cli

# Start development mode
npm run dev:chrome

# This enables:
# - Automatic rebuilding on file changes
# - Extension auto-refresh in browser
# - Source map generation for debugging
# - Development-specific logging
```

### Hot Reloading Setup (Firefox)
```bash
# Install web-ext globally
npm install -g web-ext

# Configure web-ext
echo 'module.exports = {
  sourceDir: "./dist/firefox/",
  artifactsDir: "./web-ext-artifacts/",
  build: {
    overwriteDest: true
  },
  run: {
    firefox: "firefox-developer-edition",
    startUrl: ["https://people.zoho.com"]
  }
};' > web-ext-config.js

# Start development server
npm run dev:firefox
```

### Development Debugging Setup
```bash
# Enable extension debugging
# Chrome: chrome://extensions/ → Extension details → "Inspect views"
# Firefox: about:debugging → Extension → "Inspect"

# View extension console logs
# Both browsers: F12 → Console tab → Filter by extension
```

## 📦 Building for Distribution (Educational)

### Creating Distribution Packages
```bash
# Build production versions
npm run build:all

# Create distribution archives
npm run package

# Output files:
# - dist/zoho-attendance-chrome.zip
# - dist/zoho-attendance-firefox.zip
```

### Chrome Web Store Preparation (Educational)
```bash
# Create Chrome package
npm run build:chrome
cd dist/chrome
zip -r ../zoho-attendance-chrome.zip .

# Prepare store assets:
# - Extension screenshots
# - Store description
# - Privacy policy
# - Icon assets (128x128, 48x48, 16x16)
```

### Firefox Add-on Preparation (Educational)
```bash
# Create Firefox package
npm run build:firefox
npm run sign:firefox  # Requires Mozilla developer account

# Prepare AMO submission:
# - Extension screenshots  
# - Add-on description
# - Source code (if required)
# - Icons and promotional images
```

## 🔒 Security Considerations

### Safe Installation Practices
```bash
# For educational use:
✅ Use separate browser profiles for testing
✅ Install only in development environments
✅ Use test Zoho accounts only
✅ Review all permissions before installation
✅ Monitor extension behavior and network requests

# Avoid:
❌ Installing with personal/work browser profiles
❌ Using production Zoho accounts
❌ Granting excessive permissions
❌ Installing from untrusted sources
❌ Leaving development extensions enabled permanently
```

### Permission Review
```javascript
// Study permission implications
const permissions = {
    "activeTab": "Access current tab content",
    "storage": "Store settings locally", 
    "alarms": "Schedule background tasks",
    "notifications": "Show desktop notifications",
    "host_permissions": "Access specific websites"
};

// Minimal permission principle:
// Only request permissions actually needed
// Explain why each permission is required
// Provide graceful degradation if permissions denied
```

## 🐛 Common Installation Issues

### Chrome Installation Problems
```bash
# Issue: "Extensions must be installed from Chrome Web Store"
Solution: Enable Developer mode in chrome://extensions/

# Issue: "Manifest version not supported"
Solution: Ensure using manifest-chrome.json (v3) for Chrome

# Issue: "Extension failed to load"
Solution: Check console for errors, verify file structure

# Issue: "Permissions denied"
Solution: Review manifest permissions, reload extension
```

### Firefox Installation Problems
```bash
# Issue: "Extension does not start"  
Solution: Use manifest-firefox.json (v2) for Firefox

# Issue: "Temporary add-on removed after restart"
Solution: This is expected - reload after Firefox restart

# Issue: "Invalid manifest"
Solution: Validate JSON syntax, check Firefox compatibility

# Issue: "Web-ext errors"
Solution: Update web-ext tool, check configuration
```

## 📚 Additional Resources

### Browser Extension Documentation
- [Chrome Extension Developer Guide](https://developer.chrome.com/docs/extensions/)
- [Firefox Extension Workshop](https://extensionworkshop.com/)
- [MDN WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

### Development Tools
- [web-ext](https://github.com/mozilla/web-ext) - Firefox extension development
- [Extension Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid) - Chrome development helper
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) - For React-based extensions

### Cross-Browser Testing
- [BrowserStack](https://www.browserstack.com/) - Cloud browser testing
- [LambdaTest](https://www.lambdatest.com/) - Cross-browser testing platform
- [Can I Use](https://caniuse.com/) - Browser compatibility data

## ⚠️ Educational Installation Reminders

### Safe Learning Practices
- ✅ **Use development browser profiles only**
- ✅ **Install in educational environments only**  
- ✅ **Study extension security models**
- ✅ **Learn cross-browser compatibility patterns**
- ✅ **Practice safe development workflows**

### Avoid in Learning
- ❌ **Don't install in primary browser profiles**
- ❌ **Don't use with production accounts**
- ❌ **Don't ignore permission warnings**  
- ❌ **Don't skip security considerations**
- ❌ **Don't deploy without understanding implications**

---

**Remember: Extension installation is just the beginning. Focus on understanding the underlying technologies, security models, and development patterns rather than just getting it working.**