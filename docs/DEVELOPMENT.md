# 🛠️ Development Guide

> ⚠️ **Educational Purpose Only** - This guide is for learning browser extension development patterns. Focus on understanding concepts, not production deployment.

Learn how to build, contribute to, and extend browser extensions using modern development practices and cross-browser compatibility techniques.

## 🎓 Learning Objectives

After following this guide, you'll understand:
- Cross-browser extension development workflows
- Modern JavaScript and web technologies in extensions
- Build systems and automation for extension development
- Testing strategies for browser extensions
- Code organization and architecture patterns
- Contributing to open-source extension projects

## 📋 Prerequisites

### Required Skills
```bash
# Programming fundamentals
JavaScript (ES6+) - Intermediate level
HTML5 & CSS3 - Basic to intermediate
Browser APIs - Basic understanding
Git/GitHub - Version control basics

# Development tools familiarity
Node.js and npm - Package management
Command line interface - Basic commands
Code editor usage - VS Code recommended
```

### Development Environment
```bash
# Required software
Node.js >= 16.0.0
npm >= 8.0.0
Git >= 2.30.0

# Recommended browsers for testing
Chrome/Chromium >= 88
Firefox Developer Edition >= 78
Edge >= 88

# Recommended tools
VS Code with extensions:
- JavaScript (ES6) code snippets
- ESLint
- Prettier
- Browser Preview (optional)
```

## 🚀 Getting Started

### Repository Setup
```bash
# Fork and clone the educational repository
git clone https://github.com/yourusername/zoho-attendance-extension.git
cd zoho-attendance-extension

# Study the project structure
tree -L 3
cat README.md
cat DISCLAIMER.md  # Understanding educational purpose

# Install development dependencies
npm install

# Verify build system
npm run build --dry-run
```

### Project Structure Deep Dive
```
zoho-attendance-extension/
├── src/                           # 📁 Source code
│   ├── popup/                     # 🎨 User interface components
│   │   ├── popup.html            # Extension popup structure
│   │   ├── popup.js              # Popup logic and interactions
│   │   └── popup.css             # Styling and animations
│   ├── content/                   # 🔧 Page interaction scripts
│   │   ├── content-chrome.js     # Chrome-specific content script
│   │   └── content-firefox.js    # Firefox-specific content script
│   ├── background/                # ⚙️ Background processing
│   │   ├── background-chrome.js  # Chrome service worker
│   │   └── background-firefox.js # Firefox background script
│   └── common/                    # 🔄 Shared utilities
│       └── shared.js             # Cross-browser compatibility layer
├── icons/                         # 🎭 Extension icons
├── manifest-chrome.json          # 📋 Chrome extension configuration
├── manifest-firefox.json         # 📋 Firefox extension configuration
├── scripts/                       # 🔨 Build and automation tools
│   ├── build.js                  # Cross-browser build script
│   └── package.js                # Distribution packaging
├── docs/                          # 📚 Documentation
└── tests/                         # 🧪 Testing infrastructure
```

## 🔧 Development Workflow

### Daily Development Process
```bash
# 1. Start development session
git pull origin main              # Get latest changes
npm install                       # Update dependencies
npm run clean                     # Clear previous builds

# 2. Choose development mode
npm run dev:chrome               # Chrome development with hot reload
# OR
npm run dev:firefox              # Firefox development with hot reload

# 3. Make your changes
# - Edit source files in src/
# - Changes auto-rebuild and reload in browser
# - Monitor console for errors

# 4. Test across browsers
npm run build:all               # Build both versions
# Test manually in both Chrome and Firefox

# 5. Commit your work
git add .
git commit -m "feat: educational improvement description"
git push origin your-branch
```

### Hot Reloading Development
```bash
# Chrome development with auto-reload
npm run dev:chrome

# This process:
# 1. Builds extension for Chrome
# 2. Watches for file changes
# 3. Auto-rebuilds on modifications
# 4. Signals browser to reload extension
# 5. Provides console feedback

# Firefox development with web-ext
npm run dev:firefox

# This process:
# 1. Builds extension for Firefox
# 2. Launches Firefox with extension loaded
# 3. Enables hot reloading
# 4. Provides detailed debugging info
```

## 🏗️ Build System Architecture

### Understanding the Build Process
```javascript
// scripts/build.js - Study build automation
class ExtensionBuilder {
    async build(target = 'all') {
        // 1. Clean previous builds
        await this.cleanDist();
        
        // 2. Copy and process source files
        await this.copySourceFiles(target);
        
        // 3. Process manifests for each browser
        await this.processManifests(target);
        
        // 4. Optimize and minify (production)
        await this.optimizeBuild(target);
        
        // 5. Generate source maps (development)
        await this.generateSourceMaps(target);
    }
}
```

### Build Configuration Learning
```json
// package.json - Study build scripts
{
  "scripts": {
    "build": "node scripts/build.js",
    "build:chrome": "node scripts/build.js --chrome",
    "build:firefox": "node scripts/build.js --firefox",
    "build:all": "npm run build:chrome && npm run build:firefox",
    "dev:chrome": "npm run build:chrome && npm run watch:chrome",
    "dev:firefox": "npm run build:firefox && npm run serve:firefox",
    "watch:chrome": "chokidar 'src/**/*' -c 'npm run build:chrome'",
    "serve:firefox": "web-ext run --source-dir=dist/firefox",
    "package": "node scripts/package.js",
    "clean": "rimraf dist/"
  }
}
```

### Cross-Browser Compatibility Layer
```javascript
// src/common/shared.js - Study compatibility patterns
class ZohoAttendanceShared {
    // Cross-browser storage wrapper
    static storage = {
        async get(keys) {
            if (typeof browser !== 'undefined') {
                return await browser.storage.sync.get(keys);  // Firefox
            } else {
                return new Promise(resolve => {
                    chrome.storage.sync.get(keys, resolve);   // Chrome
                });
            }
        }
    };
    
    // Cross-browser runtime detection
    static getBrowser() {
        if (typeof browser !== 'undefined') return 'firefox';
        if (typeof chrome !== 'undefined') return 'chrome';
        return 'unknown';
    }
}
```

## 🎨 Frontend Development

### Popup Development Patterns
```html
<!-- src/popup/popup.html - Study UI structure -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="popup.css">
</head>
<body>
    <div class="container">
        <!-- Study component-based structure -->
        <div class="header">
            <h1>🕐 Zoho Attendance</h1>
        </div>
        
        <div class="status" id="status">
            <!-- Dynamic status indicator -->
        </div>
        
        <div class="buttons">
            <!-- Action buttons with event handling -->
        </div>
    </div>
    
    <script src="../common/shared.js"></script>
    <script src="popup.js"></script>
</body>
</html>
```

### Modern CSS Techniques
```css
/* src/popup/popup.css - Study modern styling */
.container {
    /* CSS Grid for layout */
    display: grid;
    grid-template-rows: auto 1fr auto;
    min-height: 400px;
    
    /* CSS Custom Properties */
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --border-radius: 8px;
    
    /* CSS Gradient */
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
}

/* CSS Animations */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.btn {
    /* CSS Flexbox for button content */
    display: flex;
    align-items: center;
    justify-content: center;
    
    /* CSS Transitions */
    transition: all 0.2s ease;
    
    /* CSS Transform on hover */
    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
}
```

### JavaScript ES6+ Patterns
```javascript
// src/popup/popup.js - Study modern JavaScript
class AttendancePopup {
    constructor() {
        this.browser = ZohoAttendanceShared.getBrowser();
        this.init();
    }
    
    async init() {
        // Async/await for initialization
        await this.loadSettings();
        this.setupEventListeners();
        this.updateStatus();
    }
    
    // Destructuring and default parameters
    async loadSettings() {
        const settings = await ZohoAttendanceShared.storage.get({
            autoSchedule: false,
            checkinTime: '09:00',
            checkoutTime: '17:30'
        });
        
        // Object spread operator
        this.settings = { ...settings };
    }
    
    // Arrow functions and event handling
    setupEventListeners() {
        document.getElementById('checkInBtn').addEventListener('click', () => {
            this.performAttendanceAction('checkin');
        });
        
        // Modern DOM manipulation
        document.querySelector('#autoToggle').addEventListener('click', () => {
            this.toggleAutoSchedule();
        });
    }
    
    // Template literals and async error handling
    async performAttendanceAction(action) {
        try {
            const tabs = await ZohoAttendanceShared.tabs.query({
                active: true, 
                currentWindow: true
            });
            
            const response = await ZohoAttendanceShared.tabs.sendMessage(tabs[0].id, {
                action: 'performAttendance',
                type: action
            });
            
            this.addLog(`${action} successful!`, 'success');
        } catch (error) {
            this.addLog(`${action} failed: ${error.message}`, 'error');
        }
    }
}

// Module pattern with immediate initialization
document.addEventListener('DOMContentLoaded', () => {
    new AttendancePopup();
});
```

## 🔧 Content Script Development

### Content Script Architecture
```javascript
// src/content/content-chrome.js - Study page interaction patterns
class ZohoAttendanceBotChrome {
    constructor() {
        this.strategies = [
            this.findBySelector.bind(this),
            this.findByText.bind(this),
            this.findByAria.bind(this),
            this.findByForm.bind(this)
        ];
        this.init();
    }
    
    // Message passing between extension parts
    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'performAttendance') {
                this.performAttendance(request.type)
                    .then(result => sendResponse(result))
                    .catch(error => sendResponse({
                        success: false, 
                        error: error.message
                    }));
                return true; // Async response
            }
        });
    }
    
    // DOM manipulation and element detection
    async findBySelector(type) {
        const keywords = type === 'checkin' ? 
            ['check in', 'punch in'] : 
            ['check out', 'punch out'];
        
        for (const selector of ZohoAttendanceShared.attendanceSelectors) {
            const elements = document.querySelectorAll(selector);
            
            for (const element of elements) {
                const text = element.textContent?.toLowerCase() || '';
                const hasKeyword = keywords.some(keyword => text.includes(keyword));
                
                if (hasKeyword && this.isElementClickable(element)) {
                    await this.clickElement(element);
                    return { success: true, method: 'selector' };
                }
            }
        }
        
        throw new Error('No matching selectors found');
    }
}
```

### Advanced DOM Manipulation
```javascript
// Study advanced page interaction techniques
class DOMInteractionPatterns {
    // XPath queries for complex element finding
    findElementByXPath(xpath) {
        const result = document.evaluate(
            xpath, 
            document, 
            null, 
            XPathResult.FIRST_ORDERED_NODE_TYPE, 
            null
        );
        return result.singleNodeValue;
    }
    
    // MutationObserver for dynamic content
    observePageChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    this.scanForNewElements(mutation.addedNodes);
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Intersection Observer for element visibility
    waitForElementVisible(selector) {
        return new Promise((resolve) => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        observer.disconnect();
                        resolve(entry.target);
                    }
                });
            });
            
            const element = document.querySelector(selector);
            if (element) observer.observe(element);
        });
    }
}
```

## ⚙️ Background Script Development

### Service Worker vs Background Page
```javascript
// src/background/background-chrome.js - Chrome Service Worker
class AttendanceSchedulerChrome {
    constructor() {
        // Service workers are event-driven
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Extension lifecycle events
        chrome.runtime.onInstalled.addListener(this.handleInstall.bind(this));
        chrome.runtime.onStartup.addListener(this.handleStartup.bind(this));
        
        // Message passing from popup/content scripts
        chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
        
        // Alarm events for scheduling
        chrome.alarms.onAlarm.addListener(this.handleAlarm.bind(this));
    }
    
    // Alarm-based scheduling (Chrome)
    async createSchedule(checkinTime, checkoutTime) {
        const [hours, minutes] = checkinTime.split(':').map(Number);
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);
        
        // Chrome alarms API
        chrome.alarms.create('checkin', {
            when: scheduledTime.getTime(),
            periodInMinutes: 24 * 60  // Daily repeat
        });
    }
}
```

```javascript
// src/background/background-firefox.js - Firefox Background Page
class AttendanceSchedulerFirefox {
    constructor() {
        // Background pages are persistent
        this.setupMessageListeners();
        this.setupAlarmListeners();
        this.loadSettings();
    }
    
    setupMessageListeners() {
        // Firefox WebExtensions API
        browser.runtime.onMessage.addListener((request, sender) => {
            if (request.action === 'toggleAutoSchedule') {
                return this.toggleAutoSchedule(request.enabled);
            }
        });
    }
    
    // Firefox alarms with promises
    async createDailyAlarm(name, time) {
        const [hours, minutes] = time.split(':').map(Number);
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);
        
        await browser.alarms.create(name, {
            when: scheduledTime.getTime(),
            periodInMinutes: 24 * 60
        });
    }
}
```

## 🧪 Testing Strategies

### Unit Testing Setup
```javascript
// tests/unit/popup.test.js - Study testing patterns
import { AttendancePopup } from '../../src/popup/popup.js';

// Mock browser APIs for testing
global.chrome = {
    storage: {
        sync: {
            get: jest.fn().mockResolvedValue({}),
            set: jest.fn().mockResolvedValue()
        }
    },
    tabs: {
        query: jest.fn().mockResolvedValue([{ id: 1 }]),
        sendMessage: jest.fn().mockResolvedValue({ success: true })
    }
};

describe('Popup Educational Tests', () => {
    let popup;
    
    beforeEach(() => {
        // Set up DOM for testing
        document.body.innerHTML = `
            <div id="checkInBtn"></div>
            <div id="autoToggle"></div>
        `;
        popup = new AttendancePopup();
    });
    
    test('should initialize with default settings', async () => {
        await popup.loadSettings();
        expect(popup.settings.autoSchedule).toBe(false);
    });
    
    test('should handle check-in action', async () => {
        const result = await popup.performAttendanceAction('checkin');
        expect(chrome.tabs.sendMessage).toHaveBeenCalled();
    });
});
```

### Integration Testing
```javascript
// tests/integration/extension.test.js - Study integration patterns
import puppeteer from 'puppeteer';
import path from 'path';

describe('Extension Integration Tests', () => {
    let browser, page;
    
    beforeAll(async () => {
        // Launch browser with extension loaded
        browser = await puppeteer.launch({
            headless: false,
            args: [
                `--disable-extensions-except=${path.resolve('dist/chrome')}`,
                `--load-extension=${path.resolve('dist/chrome')}`
            ]
        });
        
        page = await browser.newPage();
    });
    
    afterAll(async () => {
        await browser.close();
    });
    
    test('should load extension popup', async () => {
        // Navigate to extension popup
        const extensionId = 'your-extension-id';
        await page.goto(`chrome-extension://${extensionId}/popup/popup.html`);
        
        // Test popup functionality
        const title = await page.$eval('h1', el => el.textContent);
        expect(title).toContain('Zoho Attendance');
    });
    
    test('should interact with Zoho People page', async () => {
        // Navigate to test Zoho People page
        await page.goto('https://people.zoho.com/test-page');
        
        // Test content script injection
        const result = await page.evaluate(() => {
            return window.ZohoAttendanceShared ? true : false;
        });
        
        expect(result).toBe(true);
    });
});
```

### End-to-End Testing
```javascript
// tests/e2e/workflow.test.js - Study E2E patterns
describe('Complete Workflow Tests', () => {
    test('should complete full attendance flow', async () => {
        // 1. Load extension
        // 2. Navigate to Zoho People
        // 3. Open popup
        // 4. Click check-in
        // 5. Verify success
        
        // This tests the entire user journey
        // for educational understanding of workflows
    });
});
```

## 📊 Code Quality and Linting

### ESLint Configuration
```javascript
// .eslintrc.js - Study code quality setup
module.exports = {
    env: {
        browser: true,
        es2021: true,
        webextensions: true  // Browser extension globals
    },
    extends: [
        'eslint:recommended',
        'plugin:chrome-extension/recommended'
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    rules: {
        // Educational code quality rules
        'no-console': 'warn',  // Allow console for learning
        'no-unused-vars': 'error',
        'prefer-const': 'error',
        'no-var': 'error'
    },
    globals: {
        // Browser extension APIs
        'chrome': 'readonly',
        'browser': 'readonly'
    }
};
```

### Prettier Configuration
```json
// .prettierrc - Study code formatting
{
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 80,
    "tabWidth": 4,
    "useTabs": false
}
```

### Pre-commit Hooks
```json
// package.json - Study quality automation
{
    "husky": {
        "hooks": {
            "pre-commit": "lint-staged"
        }
    },
    "lint-staged": {
        "*.js": ["eslint --fix", "prettier --write"],
        "*.css": ["prettier --write"],
        "*.html": ["prettier --write"]
    }
}
```

## 🔍 Debugging Techniques

### Browser DevTools Integration
```javascript
// Debugging popup scripts
// 1. Right-click extension icon → "Inspect popup"
// 2. Use Console, Sources, Network tabs
// 3. Set breakpoints in popup.js
// 4. Inspect element states and events

// Debugging content scripts  
// 1. Open page DevTools (F12)
// 2. Sources tab → Content Scripts
// 3. Find your content script files
// 4. Set breakpoints and inspect DOM

// Debugging background scripts
// Chrome: chrome://extensions → "Inspect views: background page"
// Firefox: about:debugging → "Inspect" background script
```

### Logging Best Practices
```javascript
// src/common/shared.js - Study logging patterns
class DebugLogger {
    static log(message, type = 'info', data = null) {
        const timestamp = new Date().toISOString();
        const browser = ZohoAttendanceShared.getBrowser();
        
        const logEntry = {
            timestamp,
            browser,
            type,
            message,
            data
        };
        
        // Different log levels for development
        switch (type) {
            case 'error':
                console.error('🕐 ERROR:', logEntry);
                break;
            case 'warn':
                console.warn('🕐 WARN:', logEntry);
                break;
            case 'debug':
                console.debug('🕐 DEBUG:', logEntry);
                break;
            default:
                console.log('🕐 INFO:', logEntry);
        }
        
        // Store logs for popup display
        this.storeLogs(logEntry);
    }
    
    static async storeLogs(logEntry) {
        try {
            const stored = await ZohoAttendanceShared.storage.get(['logs']);
            const logs = stored.logs || [];
            
            logs.unshift(logEntry);
            if (logs.length > 100) logs.splice(100); // Keep last 100
            
            await ZohoAttendanceShared.storage.set({ logs });
        } catch (error) {
            console.error('Failed to store log:', error);
        }
    }
}
```

### Performance Monitoring
```javascript
// Study performance monitoring in extensions
class PerformanceMonitor {
    static measureExecutionTime(func, name) {
        return async function(...args) {
            const start = performance.now();
            const result = await func.apply(this, args);
            const end = performance.now();
            
            DebugLogger.log(`${name} execution time: ${end - start}ms`, 'debug');
            return result;
        };
    }
    
    static trackMemoryUsage() {
        if (performance.memory) {
            const memory = {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
            };
            
            DebugLogger.log('Memory usage (MB)', 'debug', memory);
        }
    }
}
```

## 🤝 Contributing Guidelines

### Contribution Workflow
```bash
# 1. Fork and clone repository
git clone https://github.com/yourusername/zoho-attendance-extension.git
cd zoho-attendance-extension

# 2. Create feature branch
git checkout -b feature/educational-improvement

# 3. Make your educational changes
# Focus on:
# - Code quality improvements
# - Better documentation
# - Enhanced learning examples
# - Cross-browser compatibility fixes

# 4. Test thoroughly
npm run test
npm run lint
npm run build:all

# 5. Commit with descriptive message
git add .
git commit -m "feat: improve educational value of popup components

- Add better code comments explaining concepts
- Improve error handling patterns
- Enhance cross-browser compatibility examples"

# 6. Push and create pull request
git push origin feature/educational-improvement
```

### Code Review Standards
```javascript
// Study code review criteria
const reviewCriteria = {
    educational: {
        // Does the code teach concepts clearly?
        codeComments: 'Explanatory comments for learning',
        patterns: 'Demonstrates best practices',
        examples: 'Clear examples of concepts'
    },
    
    technical: {
        // Is the code quality high?
        crossBrowser: 'Works in Chrome and Firefox',
        errorHandling: 'Proper error handling patterns',
        performance: 'Efficient and optimized code'
    },
    
    safety: {
        // Does it maintain educational focus?
        disclaimer: 'Educational purpose maintained',
        security: 'No production vulnerabilities',
        ethics: 'Ethical considerations addressed'
    }
};
```

### Documentation Standards
```markdown
# Study documentation requirements
## Code Documentation
- JSDoc comments for all functions
- Inline comments explaining complex logic
- README updates for new features
- Example usage in comments

## Educational Value
- Explain why patterns are used
- Reference learning resources
- Provide alternative approaches
- Include common pitfalls to avoid
```

## 🚀 Advanced Development Patterns

### Modular Architecture
```javascript
// src/modules/attendance-detector.js - Study modular design
export class AttendanceDetector {
    constructor(strategies = []) {
        this.strategies = strategies;
        this.cache = new Map();
    }
    
    addStrategy(strategy) {
        this.strategies.push(strategy);
    }
    
    async detect(type) {
        // Try each strategy until one succeeds
        for (const strategy of this.strategies) {
            try {
                const result = await strategy.find(type);
                if (result.success) {
                    this.cache.set(type, result);
                    return result;
                }
            } catch (error) {
                DebugLogger.log(`Strategy failed: ${error.message}`, 'debug');
            }
        }
        
        throw new Error(`No detection strategy succeeded for ${type}`);
    }
}

// Strategy pattern implementation
export class SelectorStrategy {
    async find(type) {
        // Implementation specific to selector-based detection
    }
}

export class TextStrategy {
    async find(type) {
        // Implementation specific to text-based detection
    }
}
```

### State Management Patterns
```javascript
// src/state/app-state.js - Study state management
class AppState {
    constructor() {
        this.state = {
            isConnected: false,
            lastActivity: null,
            settings: {},
            logs: []
        };
        
        this.listeners = new Map();
    }
    
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
    }
    
    setState(updates) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...updates };
        
        // Notify listeners of changes
        Object.keys(updates).forEach(key => {
            if (this.listeners.has(key)) {
                this.listeners.get(key).forEach(callback => {
                    callback(this.state[key], oldState[key]);
                });
            }
        });
    }
    
    getState() {
        return { ...this.state };
    }
}

// Singleton pattern for global state
export const appState = new AppState();
```

### Async/Await Error Handling
```javascript
// Study advanced error handling patterns
class AsyncErrorHandler {
    static async withRetry(asyncFn, maxRetries = 3, delay = 1000) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await asyncFn();
            } catch (error) {
                lastError = error;
                
                if (attempt === maxRetries) break;
                
                DebugLogger.log(`Attempt ${attempt} failed, retrying...`, 'warn');
                await this.delay(delay * attempt); // Exponential backoff
            }
        }
        
        throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
    }
    
    static async withTimeout(asyncFn, timeoutMs = 5000) {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
        });
        
        return Promise.race([asyncFn(), timeoutPromise]);
    }
    
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

## 📚 Learning Resources

### Browser Extension APIs
- [Chrome Extensions API Reference](https://developer.chrome.com/docs/extensions/reference/)
- [Firefox WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API)
- [Edge Extensions Documentation](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/)

### Development Tools
- [web-ext](https://github.com/mozilla/web-ext) - Firefox extension development tool
- [chrome-extension-cli](https://github.com/dutiyesh/chrome-extension-cli) - Chrome extension scaffolding
- [Extension Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid) - Development helper

### Testing Frameworks
- [Jest](https://jestjs.io/) - JavaScript testing framework
- [Puppeteer](https://pptr.dev/) - Browser automation for testing
- [Sinon](https://sinonjs.org/) - Mocking and stubbing library

## ⚠️ Educational Development Reminders

### Focus on Learning
- ✅ **Understand cross-browser compatibility patterns**
- ✅ **Study modern JavaScript and web APIs**
- ✅ **Learn testing and quality assurance practices**
- ✅ **Practice modular architecture and design patterns**
- ✅ **Explore performance optimization techniques**

### Maintain Educational Purpose
- ✅ **Keep educational disclaimers in all documentation**
- ✅ **Focus on teaching concepts over functionality**
- ✅ **Provide clear explanations for code patterns**
- ✅ **Include references to learning resources**
- ✅ **Encourage ethical development practices**

### Avoid in Development
- ❌ **Don't remove educational warnings or disclaimers**
- ❌ **Don't optimize for production automation use**
- ❌ **Don't encourage workplace deployment**
- ❌ **Don't skip security and ethical considerations**
- ❌ **Don't ignore cross-browser compatibility learning**

---

**Remember: The goal is to learn and teach browser extension development concepts. Focus on understanding the technologies, patterns, and best practices that make extensions work across different browsers and use cases.**