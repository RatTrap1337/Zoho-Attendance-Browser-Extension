# 🐛 Troubleshooting Guide

> ⚠️ **Educational Purpose Only** - This troubleshooting guide helps you learn to debug browser extensions. Focus on understanding the underlying issues and solutions.

Common issues, debugging techniques, and solutions for browser extension development and cross-browser compatibility challenges.

## 🎓 Learning Objectives

Through troubleshooting, you'll learn:
- Browser extension debugging techniques and tools
- Cross-browser compatibility issue resolution
- Permission and security model understanding
- Performance optimization and memory management
- Development workflow problem-solving
- Extension architecture debugging strategies

## 🔧 Quick Diagnosis

### Extension Not Loading
```bash
# Quick diagnostic steps
1. Check browser developer mode is enabled
2. Verify manifest.json syntax and validity
3. Check console for error messages
4. Confirm file permissions and structure
5. Try rebuilding the extension

# Quick fixes
npm run build:all         # Rebuild both versions
npm run clean && npm run build  # Clean rebuild
```

### Extension Icon Missing
```bash
# Common causes and solutions
1. Missing icon files in icons/ directory
2. Incorrect icon paths in manifest
3. Invalid icon dimensions or formats
4. Build script not copying icons

# Fix commands
ls icons/                 # Verify icons exist
npm run build:chrome      # Rebuild to copy icons
```

## 🌐 Cross-Browser Issues

### Chrome-Specific Problems

#### Service Worker Issues
```javascript
// Problem: Service worker not starting
// Chrome background scripts use service workers (Manifest V3)

// Debug service worker state
chrome.runtime.getBackgroundPage((bg) => {
    if (bg) {
        console.log('Service worker running');
    } else {
        console.log('Service worker not active');
    }
});

// Solution: Check service worker registration
// 1. Go to chrome://extensions/
// 2. Click "Inspect views: service worker"
// 3. Check for registration errors
// 4. Verify manifest.json "background" configuration
```

#### Manifest V3 Migration Issues
```json
// Problem: Manifest V2 features not working in Chrome

// Incorrect (Manifest V2 style):
{
    "background": {
        "scripts": ["background.js"],
        "persistent": false
    }
}

// Correct (Manifest V3 style):
{
    "background": {
        "service_worker": "background/background-chrome.js"
    }
}

// Fix: Use correct manifest for each browser
```

#### Permissions Issues in Chrome
```javascript
// Problem: Host permissions not working

// Debug permission status
chrome.permissions.contains({
    origins: ['https://people.zoho.com/*']
}, (result) => {
    console.log('Permission granted:', result);
});

// Solution: Check manifest host_permissions
// Manifest V3 requires separate host_permissions array
{
    "permissions": ["activeTab", "storage"],
    "host_permissions": ["https://people.zoho.com/*"]
}
```

### Firefox-Specific Problems

#### Background Script Issues
```javascript
// Problem: Background script not persistent in Firefox
// Firefox uses traditional background pages (Manifest V2)

// Check background script status
browser.runtime.getBackgroundPage().then((bg) => {
    console.log('Background page active');
}).catch((error) => {
    console.error('Background page error:', error);
});

// Solution: Use correct manifest structure
{
    "background": {
        "scripts": ["common/shared.js", "background/background-firefox.js"],
        "persistent": false
    }
}
```

#### WebExtensions API Differences
```javascript
// Problem: Chrome API not available in Firefox

// Incorrect (Chrome-only):
chrome.tabs.query({active: true}, (tabs) => {
    // This won't work in Firefox
});

// Correct (Cross-browser):
const tabs = await (
    typeof browser !== 'undefined' ? 
    browser.tabs.query({active: true}) :
    new Promise(resolve => chrome.tabs.query({active: true}, resolve))
);
```

#### Add-on ID Issues
```json
// Problem: Extension ID not consistent in Firefox

// Solution: Set explicit ID in manifest
{
    "applications": {
        "gecko": {
            "id": "zoho-attendance-helper@yourname.com",
            "strict_min_version": "78.0"
        }
    }
}
```

## 🎯 Content Script Issues

### Script Injection Problems
```javascript
// Problem: Content script not injecting

// Debug injection status
console.log('Content script loaded:', !!window.ZohoAttendanceShared);

// Check if script runs on correct pages
if (window.location.hostname.includes('people.zoho.com')) {
    console.log('✅ On Zoho People page');
} else {
    console.log('❌ Not on Zoho People page');
}

// Solution: Verify manifest content_scripts configuration
{
    "content_scripts": [{
        "matches": [
            "https://people.zoho.com/*",
            "https://people.zoho.eu/*",
            "https://people.zoho.in/*"
        ],
        "js": ["common/shared.js", "content/content-chrome.js"],
        "run_at": "document_idle"
    }]
}
```

### DOM Element Detection Issues
```javascript
// Problem: Cannot find attendance buttons

// Debug element detection
class AttendanceDebugger {
    static scanPage() {
        console.log('🔍 Scanning page for attendance elements...');
        
        // Check all buttons on page
        const buttons = document.querySelectorAll('button, input[type="button"], a');
        console.log(`Found ${buttons.length} clickable elements`);
        
        // Check for attendance-related text
        buttons.forEach((btn, index) => {
            const text = btn.textContent?.toLowerCase() || '';
            if (text.includes('check') || text.includes('punch') || text.includes('attendance')) {
                console.log(`🎯 Potential attendance button ${index}:`, {
                    text: btn.textContent,
                    classes: btn.className,
                    id: btn.id,
                    visible: this.isVisible(btn)
                });
            }
        });
    }
    
    static isVisible(element) {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0';
    }
    
    static highlightElements() {
        // Highlight all potential attendance elements
        const elements = document.querySelectorAll('*[class*="attendance"], *[id*="attendance"]');
        elements.forEach(el => {
            el.style.outline = '2px solid red';
            el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
        });
    }
}

// Run diagnostics
AttendanceDebugger.scanPage();
```

### Message Passing Issues
```javascript
// Problem: Communication between popup and content script fails

// Debug message passing
class MessageDebugger {
    static async testCommunication() {
        try {
            // From popup to content script
            const tabs = await chrome.tabs.query({active: true, currentWindow: true});
            const response = await chrome.tabs.sendMessage(tabs[0].id, {
                action: 'ping'
            });
            console.log('✅ Communication successful:', response);
        } catch (error) {
            console.error('❌ Communication failed:', error);
            this.diagnoseCommunicationIssue(error);
        }
    }
    
    static diagnoseCommunicationIssue(error) {
        if (error.message.includes('receiving end does not exist')) {
            console.log('💡 Solution: Content script not loaded on current page');
            console.log('- Check if current page matches content script patterns');
            console.log('- Verify content script injection in DevTools');
        } else if (error.message.includes('Extension context invalidated')) {
            console.log('💡 Solution: Extension was reloaded');
            console.log('- Refresh the page to re-inject content script');
            console.log('- Restart the extension');
        }
    }
}
```

## 🎨 Popup and UI Issues

### Popup Not Opening
```javascript
// Problem: Extension popup doesn't open when icon clicked

// Debug popup loading
// 1. Check for JavaScript errors in popup
// 2. Verify popup.html exists and is valid
// 3. Check popup dimensions and content

// Solution: Debug popup step by step
console.log('Popup loading...');
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM loaded');
    try {
        new AttendancePopup();
        console.log('✅ Popup initialized');
    } catch (error) {
        console.error('❌ Popup initialization failed:', error);
    }
});
```

### CSS and Styling Issues
```css
/* Problem: Popup styling not working */

/* Debug CSS loading */
body::before {
    content: "CSS loaded";
    position: fixed;
    top: 0;
    left: 0;
    background: green;
    color: white;
    padding: 5px;
    z-index: 9999;
}

/* Common popup size issues */
body {
    min-width: 320px;  /* Minimum popup width */
    max-width: 500px;  /* Maximum popup width */
    min-height: 200px; /* Minimum popup height */
    margin: 0;
    padding: 0;
}

/* Fix popup overflow issues */
.container {
    overflow-x: hidden;
    overflow-y: auto;
    max-height: 600px;
}
```

### Storage and Settings Issues
```javascript
// Problem: Settings not persisting between sessions

// Debug storage operations
class StorageDebugger {
    static async testStorage() {
        try {
            // Test write
            await chrome.storage.sync.set({test: 'value'});
            console.log('✅ Storage write successful');
            
            // Test read
            const result = await chrome.storage.sync.get('test');
            console.log('✅ Storage read successful:', result);
            
            // Clean up
            await chrome.storage.sync.remove('test');
        } catch (error) {
            console.error('❌ Storage operation failed:', error);
            this.diagnoseStorageIssue(error);
        }
    }
    
    static diagnoseStorageIssue(error) {
        if (error.message.includes('QUOTA_BYTES_PER_ITEM quota exceeded')) {
            console.log('💡 Solution: Data too large for storage');
            console.log('- Reduce data size or use local storage');
        } else if (error.message.includes('storage API')) {
            console.log('💡 Solution: Storage permission missing');
            console.log('- Add "storage" to manifest permissions');
        }
    }
}
```

## ⚙️ Build and Development Issues

### Build Script Failures
```bash
# Problem: npm run build fails

# Debug build process
npm run build:chrome -- --verbose
npm run build:firefox -- --verbose

# Common build issues and solutions:

# Issue: Missing dependencies
npm install
npm audit fix

# Issue: Permission errors
sudo chown -R $(whoami) node_modules/
rm -rf node_modules package-lock.json
npm install

# Issue: Build script errors
node --version  # Check Node.js version
npm --version   # Check npm version
# Ensure Node.js >= 16.0.0

# Issue: File not found errors
ls -la src/     # Verify source files exist
ls -la icons/   # Verify icon files exist
```

### Hot Reloading Issues
```bash
# Problem: Changes not reflected during development

# Debug hot reloading
# 1. Check if watch mode is active
ps aux | grep chokidar

# 2. Verify file watching patterns
echo "File change test" >> src/popup/popup.js
# Should trigger rebuild

# 3. Check extension reload
# Chrome: Extension should auto-reload
# Firefox: May need manual refresh

# Solutions:
# 1. Restart dev server
npm run dev:chrome

# 2. Manual extension reload
# Chrome: Go to chrome://extensions/ and click reload
# Firefox: Go to about:debugging and reload

# 3. Clear browser cache
# Chrome: Ctrl+Shift+R
# Firefox: Ctrl+F5
```

### Permission and Security Issues
```javascript
// Problem: Content Security Policy violations

// Debug CSP issues
// Check console for CSP errors:
// "Refused to execute inline script because it violates CSP"

// Solution: Remove inline scripts and styles
// Incorrect:
// <script>console.log('inline script');</script>

// Correct:
// Move all JavaScript to separate files
// Use external CSS files only

// Problem: Extension context invalidated
// This happens when extension is reloaded during development

// Solution: Handle context invalidation gracefully
chrome.runtime.onConnect.addListener((port) => {
    port.onDisconnect.addListener(() => {
        if (chrome.runtime.lastError) {
            console.log('Extension context invalidated');
            // Handle gracefully - perhaps show user message
        }
    });
});
```

## 🔍 Advanced Debugging Techniques

### Browser DevTools Debugging
```javascript
// Popup debugging
// 1. Right-click extension icon → "Inspect popup"
// 2. Console, Sources, Network tabs available
// 3. Set breakpoints and inspect variables

// Content script debugging
// 1. Open page DevTools (F12)
// 2. Sources tab → Content Scripts folder
// 3. Find your content script files
// 4. Set breakpoints and debug

// Background script debugging
// Chrome: chrome://extensions/ → "Inspect views: service worker"
// Firefox: about:debugging → Extension → "Inspect"

// Network debugging
// 1. Network tab in DevTools
// 2. Look for failed API requests
// 3. Check request headers and responses
// 4. Verify OAuth token usage
```

### Logging and Monitoring
```javascript
// Advanced logging setup for debugging
class AdvancedLogger {
    constructor() {
        this.logs = [];
        this.enableConsoleCapture();
    }
    
    enableConsoleCapture() {
        const originalLog = console.log;
        const originalError = console.error;
        
        console.log = (...args) => {
            this.capture('log', args);
            originalLog.apply(console, args);
        };
        
        console.error = (...args) => {
            this.capture('error', args);
            originalError.apply(console, args);
        };
    }
    
    capture(level, args) {
        this.logs.push({
            timestamp: Date.now(),
            level,
            message: args.join(' '),
            stack: new Error().stack
        });
        
        // Keep only last 1000 logs
        if (this.logs.length > 1000) {
            this.logs.shift();
        }
    }
    
    exportLogs() {
        const logsText = this.logs
            .map(log => `[${new Date(log.timestamp).toISOString()}] ${log.level.toUpperCase()}: ${log.message}`)
            .join('\n');
        
        const blob = new Blob([logsText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'extension-logs.txt';
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

// Initialize logging
const logger = new AdvancedLogger();
```

### Performance Debugging
```javascript
// Monitor extension performance
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            startTime: performance.now(),
            interactions: 0,
            errors: 0,
            memory: []
        };
        
        this.startMonitoring();
    }
    
    startMonitoring() {
        // Monitor memory usage
        setInterval(() => {
            if (performance.memory) {
                this.metrics.memory.push({
                    timestamp: Date.now(),
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize
                });
                
                // Keep only last 100 measurements
                if (this.metrics.memory.length > 100) {
                    this.metrics.memory.shift();
                }
            }
        }, 5000);
        
        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.duration > 50) {
                        console.warn('Long task detected:', entry.duration + 'ms');
                    }
                });
            });
            observer.observe({entryTypes: ['longtask']});
        }
    }
    
    getReport() {
        const runtime = performance.now() - this.metrics.startTime;
        const avgMemory = this.metrics.memory.reduce((sum, m) => sum + m.used, 0) / this.metrics.memory.length;
        
        return {
            runtime: Math.round(runtime),
            interactions: this.metrics.interactions,
            errors: this.metrics.errors,
            averageMemoryMB: Math.round(avgMemory / 1048576),
            memoryTrend: this.metrics.memory.slice(-10)
        };
    }
}
```

## 🚨 Common Error Messages

### "Extension Context Invalidated"
```javascript
// Problem: Extension was reloaded while page was open
// Solution: Handle gracefully and inform user

try {
    await chrome.runtime.sendMessage({action: 'ping'});
} catch (error) {
    if (error.message.includes('Extension context invalidated')) {
        console.log('Extension was reloaded - page refresh recommended');
        
        // Show user-friendly message
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 10px; right: 10px; z-index: 10000;
            background: orange; color: white; padding: 10px;
            border-radius: 5px; font-family: Arial;
        `;
        notification.textContent = 'Extension updated - please refresh page';
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 5000);
    }
}
```

### "Receiving End Does Not Exist"
```javascript
// Problem: Content script not loaded on current page
// Solution: Check page URL and content script injection

const diagnoseCommunicationError = () => {
    const currentURL = window.location.href;
    const isZohoPage = currentURL.includes('people.zoho.com');
    
    console.log('Communication diagnosis:', {
        currentURL,
        isZohoPage,
        contentScriptLoaded: !!window.ZohoAttendanceShared
    });
    
    if (!isZohoPage) {
        console.log('💡 Not on Zoho People page - content script not injected');
    } else if (!window.ZohoAttendanceShared) {
        console.log('💡 Content script failed to load - check manifest patterns');
    }
};
```

### "Manifest File Missing or Unreadable"
```bash
# Problem: Invalid JSON or missing manifest
# Solution: Validate and fix manifest.json

# Validate JSON syntax
node -e "console.log(JSON.parse(require('fs').readFileSync('manifest-chrome.json', 'utf8')))"

# Check file permissions
ls -la manifest-*.json

# Common manifest issues:
# 1. Trailing commas in JSON
# 2. Missing required fields
# 3. Invalid permission names
# 4. Incorrect file paths
```

### "Script Load Error"
```javascript
// Problem: JavaScript file failed to load
// Solution: Check file paths and syntax

// Debug script loading
window.addEventListener('error', (event) => {
    if (event.filename && event.filename.includes('chrome-extension://')) {
        console.error('Extension script error:', {
            file: event.filename,
            line: event.lineno,
            column: event.colno,
            error: event.error
        });
    }
});

// Check if scripts are loading
const scripts = document.querySelectorAll('script[src*="chrome-extension"]');
scripts.forEach((script, index) => {
    console.log(`Script ${index}:`, script.src);
    
    script.addEventListener('load', () => {
        console.log(`✅ Loaded: ${script.src}`);
    });
    
    script.addEventListener('error', () => {
        console.error(`❌ Failed: ${script.src}`);
    });
});
```

## 📊 Testing and Validation

### Automated Testing for Common Issues
```javascript
// Automated health check for extension
class ExtensionHealthCheck {
    static async runDiagnostics() {
        const results = {
            manifest: await this.checkManifest(),
            permissions: await this.checkPermissions(),
            scripts: await this.checkScripts(),
            storage: await this.checkStorage(),
            communication: await this.checkCommunication()
        };
        
        this.reportResults(results);
        return results;
    }
    
    static async checkManifest() {
        try {
            const manifest = chrome.runtime.getManifest();
            return {
                valid: true,
                version: manifest.version,
                permissions: manifest.permissions?.length || 0
            };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }
    
    static async checkPermissions() {
        const requiredPermissions = ['activeTab', 'storage'];
        const results = {};
        
        for (const permission of requiredPermissions) {
            try {
                const hasPermission = await chrome.permissions.contains({
                    permissions: [permission]
                });
                results[permission] = hasPermission;
            } catch (error) {
                results[permission] = false;
            }
        }
        
        return results;
    }
    
    static async checkStorage() {
        try {
            await chrome.storage.sync.set({healthCheck: Date.now()});
            const result = await chrome.storage.sync.get('healthCheck');
            await chrome.storage.sync.remove('healthCheck');
            
            return { working: true, timestamp: result.healthCheck };
        } catch (error) {
            return { working: false, error: error.message };
        }
    }
    
    static reportResults(results) {
        console.group('🔍 Extension Health Check Results');
        
        Object.entries(results).forEach(([test, result]) => {
            const status = result.valid !== false && result.working !== false ? '✅' : '❌';
            console.log(`${status} ${test}:`, result);
        });
        
        console.groupEnd();
    }
}

// Run health check
ExtensionHealthCheck.runDiagnostics();
```

### Browser Compatibility Testing
```javascript
// Test cross-browser compatibility
class CompatibilityTester {
    static testBrowserAPIs() {
        const tests = [
            {
                name: 'Chrome APIs',
                test: () => typeof chrome !== 'undefined'
            },
            {
                name: 'Firefox APIs',
                test: () => typeof browser !== 'undefined'
            },
            {
                name: 'Storage API',
                test: () => !!(chrome?.storage || browser?.storage)
            },
            {
                name: 'Tabs API',
                test: () => !!(chrome?.tabs || browser?.tabs)
            },
            {
                name: 'Runtime API',
                test: () => !!(chrome?.runtime || browser?.runtime)
            }
        ];
        
        console.group('🌐 Browser Compatibility Test');
        tests.forEach(({name, test}) => {
            const result = test();
            console.log(`${result ? '✅' : '❌'} ${name}: ${result}`);
        });
        console.groupEnd();
    }
    
    static detectBrowser() {
        const browser = ZohoAttendanceShared?.getBrowser() || 'unknown';
        console.log(`🌐 Detected browser: ${browser}`);
        return browser;
    }
}

CompatibilityTester.testBrowserAPIs();
CompatibilityTester.detectBrowser();
```

## 🛠️ Development Environment Issues

### Node.js and npm Problems
```bash
# Problem: Build tools not working
# Check Node.js and npm versions
node --version  # Should be >= 16.0.0
npm --version   # Should be >= 8.0.0

# Update Node.js if needed
# Use nvm for version management
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Clear npm cache if builds failing
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Fix permission issues (Unix/Mac)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) node_modules/
```

### VS Code and Editor Issues
```json
// .vscode/settings.json - Debug editor configuration
{
    "eslint.workingDirectories": ["src"],
    "prettier.configPath": ".prettierrc",
    "files.associations": {
        "*.json": "jsonc"  // Allow comments in JSON for manifest files
    },
    "search.exclude": {
        "**/node_modules": true,
        "**/dist": true,
        "**/.git": true
    }
}

// .vscode/launch.json - Debug configuration
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug Extension",
            "type": "node",
            "request": "attach",
            "port": 9222,
            "webRoot": "${workspaceFolder}/src"
        }
    ]
}
```

### Git and Version Control Issues
```bash
# Problem: Git commits failing due to hooks
# Check pre-commit hooks
cat .git/hooks/pre-commit

# Bypass hooks temporarily (for learning)
git commit --no-verify -m "Educational changes"

# Fix ESLint issues before committing
npm run lint
npm run lint -- --fix

# Fix Prettier formatting
npm run format

# Problem: Large files in repository
# Check repository size
du -sh .git/

# Remove large files from history (if needed)
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch dist/*.zip' \
--prune-empty --tag-name-filter cat -- --all
```

## 📚 Debugging Resources and Tools

### Browser Extension Development Tools
```bash
# Chrome Extension Development Tools
# 1. Extension Reloader - Auto-reload extensions during development
# 2. React Developer Tools - For React-based popups
# 3. Vue.js devtools - For Vue-based popups

# Firefox Extension Development Tools
# 1. web-ext - Official Mozilla development tool
npm install -g web-ext

# 2. Firefox Developer Edition - Enhanced debugging
# Download from: https://www.mozilla.org/firefox/developer/

# 3. Extension Auto-Installer - For temporary add-on automation
```

### Online Validation Tools
```bash
# Manifest validation
# 1. Chrome Extension Manifest Validator
# https://developer.chrome.com/docs/extensions/mv3/manifest/

# 2. Firefox Add-on Validator
# https://addons.mozilla.org/en-US/developers/addon/validate

# 3. JSON Validation
# https://jsonlint.com/

# CSS Validation
# https://jigsaw.w3.org/css-validator/

# JavaScript Validation
# https://jshint.com/
```

### Performance and Security Analysis
```bash
# Performance analysis
# 1. Chrome DevTools Performance tab
# 2. Firefox Performance Tools
# 3. Lighthouse extension analysis

# Security analysis
# 1. Chrome Extension Security Review
# 2. Mozilla Add-on Security Guidelines
# 3. OWASP Browser Extension Security

# Code quality analysis
npm install -g eslint
eslint src/ --ext .js
```

## 🎯 Preventive Measures

### Code Quality Best Practices
```javascript
// Error boundaries for popup components
class ErrorBoundary {
    constructor() {
        this.setupGlobalErrorHandler();
    }
    
    setupGlobalErrorHandler() {
        window.addEventListener('error', (event) => {
            console.error('Global error caught:', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
            
            this.showUserFriendlyError();
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showUserFriendlyError();
        });
    }
    
    showUserFriendlyError() {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            background: #ff6b6b; color: white; padding: 10px;
            margin: 10px; border-radius: 5px; font-size: 12px;
        `;
        errorDiv.textContent = 'Something went wrong. Check the console for details.';
        document.body.prepend(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

new ErrorBoundary();
```

### Development Workflow Safeguards
```bash
# Pre-commit validation script
#!/bin/bash
# scripts/pre-commit-check.sh

echo "🔍 Running pre-commit checks..."

# Lint JavaScript
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ ESLint failed"
    exit 1
fi

# Format code
npm run format
if [ $? -ne 0 ]; then
    echo "❌ Prettier failed"
    exit 1
fi

# Build both versions
npm run build:all
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Run tests
npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed"
    exit 1
fi

echo "✅ All checks passed"
```

## ⚠️ Educational Troubleshooting Reminders

### Focus on Learning
- ✅ **Understand the root cause** of issues, not just quick fixes
- ✅ **Learn debugging techniques** that apply to other projects
- ✅ **Study browser differences** and compatibility patterns
- ✅ **Practice systematic problem-solving** approaches
- ✅ **Document solutions** for future reference

### Safe Troubleshooting Practices
- ✅ **Use development environments** for testing fixes
- ✅ **Backup working code** before making changes
- ✅ **Test across multiple browsers** after fixes
- ✅ **Verify educational purpose** is maintained
- ✅ **Check security implications** of any changes

### Avoid Quick Fixes That Skip Learning
- ❌ **Don't just copy-paste solutions** without understanding
- ❌ **Don't ignore browser console warnings**
- ❌ **Don't skip testing after fixing issues**
- ❌ **Don't disable security features** to "fix" problems
- ❌ **Don't remove educational safeguards** during debugging

## 📞 Getting Help

### Community Resources
- [Stack Overflow - Browser Extensions](https://stackoverflow.com/questions/tagged/browser-extension)
- [Chrome Extension Developer Forum](https://groups.google.com/a/chromium.org/g/chromium-extensions)
- [Firefox Add-on Development Forum](https://discourse.mozilla.org/c/add-ons/35)
- [Reddit - r/webdev](https://www.reddit.com/r/webdev/)

### Documentation Links
- [Chrome Extension Troubleshooting](https://developer.chrome.com/docs/extensions/mv3/tut_debugging/)
- [Firefox Extension Debugging](https://extensionworkshop.com/documentation/develop/debugging/)
- [MDN WebExtensions Troubleshooting](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Debugging)

---

**Remember: Troubleshooting is a valuable learning opportunity. Each issue you resolve teaches you more about browser extension development, cross-browser compatibility, and web technologies in general.**