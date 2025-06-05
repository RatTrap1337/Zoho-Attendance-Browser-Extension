// Shared utilities for both Chrome and Firefox
class ZohoAttendanceShared {
    static attendanceSelectors = [
        // Common Zoho People attendance button selectors
        '[data-action="checkin"]',
        '[data-action="checkout"]',
        'button[title*="Check In"]',
        'button[title*="Check Out"]',
        'button[title*="Punch In"]',
        'button[title*="Punch Out"]',
        '.attendance-btn',
        '.checkin-btn',
        '.checkout-btn',
        '.punch-btn',
        'input[value*="Check In"]',
        'input[value*="Check Out"]',
        'input[value*="Punch In"]',
        'input[value*="Punch Out"]',
        // Generic button selectors
        'button:contains("Check In")',
        'button:contains("Check Out")',
        'button:contains("Punch In")',
        'button:contains("Punch Out")',
        'a:contains("Check In")',
        'a:contains("Check Out")',
        // More specific Zoho patterns
        '.zpd-attendance button',
        '.attendance-widget button',
        '.attendance-panel button',
        '#attendance button',
        '.quick-actions button'
    ];

    static isElementClickable(element) {
        if (!element) return false;

        const style = window.getComputedStyle(element);
        return style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
            !element.disabled;
    }

    static async clickElement(element) {
        console.log('🎯 Clicking element:', element);

        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Wait a bit for scroll
        await ZohoAttendanceShared.sleep(500);

        // Highlight the element briefly
        const originalStyle = element.style.cssText;
        element.style.outline = '3px solid #4ade80';
        element.style.backgroundColor = 'rgba(74, 222, 128, 0.2)';

        // Multiple click attempts
        element.focus();
        element.click();

        // Trigger various events
        ['mousedown', 'mouseup', 'click'].forEach(eventType => {
            element.dispatchEvent(new MouseEvent(eventType, { bubbles: true }));
        });

        // Submit form if it's in a form
        const form = element.closest('form');
        if (form) {
            form.submit();
        }

        // Wait a bit then restore style
        await ZohoAttendanceShared.sleep(1000);
        element.style.cssText = originalStyle;
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static formatTime(time24) {
        const [hours, minutes] = time24.split(':');
        const hour12 = hours % 12 || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
    }

    static log(message, type = 'info') {
        const timestamp = new Date().toLocaleString();
        const logMessage = `[${timestamp}] ${message}`;

        if (type === 'error') {
            console.error('🕐', logMessage);
        } else if (type === 'success') {
            console.log('✅', logMessage);
        } else {
            console.log('🕐', logMessage);
        }

        return {
            timestamp,
            message,
            type,
            fullMessage: logMessage
        };
    }

    // Cross-browser storage wrapper
    static storage = {
        async get(keys) {
            if (typeof browser !== 'undefined' && browser.storage) {
                // Firefox
                return await browser.storage.sync.get(keys);
            } else if (typeof chrome !== 'undefined' && chrome.storage) {
                // Chrome
                return new Promise((resolve) => {
                    chrome.storage.sync.get(keys, resolve);
                });
            }
            return {};
        },

        async set(items) {
            if (typeof browser !== 'undefined' && browser.storage) {
                // Firefox
                return await browser.storage.sync.set(items);
            } else if (typeof chrome !== 'undefined' && chrome.storage) {
                // Chrome
                return new Promise((resolve) => {
                    chrome.storage.sync.set(items, resolve);
                });
            }
        }
    };

    // Cross-browser tabs wrapper
    static tabs = {
        async query(queryInfo) {
            if (typeof browser !== 'undefined' && browser.tabs) {
                // Firefox
                return await browser.tabs.query(queryInfo);
            } else if (typeof chrome !== 'undefined' && chrome.tabs) {
                // Chrome
                return new Promise((resolve) => {
                    chrome.tabs.query(queryInfo, resolve);
                });
            }
            return [];
        },

        async sendMessage(tabId, message) {
            if (typeof browser !== 'undefined' && browser.tabs) {
                // Firefox
                return await browser.tabs.sendMessage(tabId, message);
            } else if (typeof chrome !== 'undefined' && chrome.tabs) {
                // Chrome
                return new Promise((resolve, reject) => {
                    chrome.tabs.sendMessage(tabId, message, (response) => {
                        if (chrome.runtime.lastError) {
                            reject(new Error(chrome.runtime.lastError.message));
                        } else {
                            resolve(response);
                        }
                    });
                });
            }
        }
    };

    // Cross-browser alarms wrapper
    static alarms = {
        async create(name, alarmInfo) {
            if (typeof browser !== 'undefined' && browser.alarms) {
                // Firefox
                return await browser.alarms.create(name, alarmInfo);
            } else if (typeof chrome !== 'undefined' && chrome.alarms) {
                // Chrome
                chrome.alarms.create(name, alarmInfo);
            }
        },

        async clear(name) {
            if (typeof browser !== 'undefined' && browser.alarms) {
                // Firefox
                return await browser.alarms.clear(name);
            } else if (typeof chrome !== 'undefined' && chrome.alarms) {
                // Chrome
                return new Promise((resolve) => {
                    chrome.alarms.clear(name, resolve);
                });
            }
        },

        onAlarm: {
            addListener(callback) {
                if (typeof browser !== 'undefined' && browser.alarms) {
                    // Firefox
                    browser.alarms.onAlarm.addListener(callback);
                } else if (typeof chrome !== 'undefined' && chrome.alarms) {
                    // Chrome
                    chrome.alarms.onAlarm.addListener(callback);
                }
            }
        }
    };

    // Cross-browser notifications wrapper
    static notifications = {
        async create(notificationId, options) {
            if (typeof browser !== 'undefined' && browser.notifications) {
                // Firefox
                return await browser.notifications.create(notificationId, options);
            } else if (typeof chrome !== 'undefined' && chrome.notifications) {
                // Chrome
                return new Promise((resolve) => {
                    chrome.notifications.create(notificationId, options, resolve);
                });
            }
        }
    };

    // Detect browser
    static getBrowser() {
        if (typeof browser !== 'undefined') {
            return 'firefox';
        } else if (typeof chrome !== 'undefined') {
            return 'chrome';
        }
        return 'unknown';
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.ZohoAttendanceShared = ZohoAttendanceShared;
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZohoAttendanceShared;
}