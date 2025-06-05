// Cross-browser popup script
class AttendancePopup {
    constructor() {
        this.logs = [];
        this.browser = ZohoAttendanceShared.getBrowser();
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.updateStatus();
        this.updateLogs();
        this.showBrowserInfo();
    }

    async loadSettings() {
        const settings = await ZohoAttendanceShared.storage.get({
            autoSchedule: false,
            checkinTime: '09:00',
            checkoutTime: '17:30'
        });

        const autoToggle = document.getElementById('autoToggle');
        autoToggle.classList.toggle('active', settings.autoSchedule);

        document.getElementById('checkinTime').textContent =
            ZohoAttendanceShared.formatTime(settings.checkinTime);
        document.getElementById('checkoutTime').textContent =
            ZohoAttendanceShared.formatTime(settings.checkoutTime);

        this.settings = settings;
    }

    setupEventListeners() {
        document.getElementById('checkInBtn').addEventListener('click', () => {
            this.performAttendanceAction('checkin');
        });

        document.getElementById('checkOutBtn').addEventListener('click', () => {
            this.performAttendanceAction('checkout');
        });

        document.getElementById('autoToggle').addEventListener('click', () => {
            this.toggleAutoSchedule();
        });
    }

    async performAttendanceAction(action) {
        const button = document.getElementById(action === 'checkin' ? 'checkInBtn' : 'checkOutBtn');

        // Add loading state
        button.classList.add('loading');
        button.disabled = true;

        this.addLog(`Attempting ${action}...`, 'info');

        try {
            // Get the active tab
            const tabs = await ZohoAttendanceShared.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];

            if (!tab.url.includes('people.zoho.com')) {
                throw new Error('Please navigate to Zoho People first');
            }

            // Send message to content script
            const response = await ZohoAttendanceShared.tabs.sendMessage(tab.id, {
                action: 'performAttendance',
                type: action
            });

            if (response && response.success) {
                this.addLog(`${action} successful!`, 'success');
                this.updateStatus('success');
                button.classList.add('success-flash');

                // Show success notification
                this.showNotification(`${action} completed successfully`, 'success');
            } else {
                throw new Error(response?.error || 'Unknown error occurred');
            }

        } catch (error) {
            this.addLog(`${action} failed: ${error.message}`, 'error');
            button.classList.add('error-flash');
            this.showNotification(`${action} failed: ${error.message}`, 'error');
        } finally {
            // Remove loading state
            button.classList.remove('loading');
            button.disabled = false;

            // Remove flash classes after animation
            setTimeout(() => {
                button.classList.remove('success-flash', 'error-flash');
            }, 500);
        }
    }

    async toggleAutoSchedule() {
        const toggle = document.getElementById('autoToggle');
        const newState = !toggle.classList.contains('active');

        toggle.classList.toggle('active', newState);

        await ZohoAttendanceShared.storage.set({ autoSchedule: newState });

        // Send message to background script
        this.sendBackgroundMessage({
            action: 'toggleAutoSchedule',
            enabled: newState
        });

        this.addLog(`Auto-schedule ${newState ? 'enabled' : 'disabled'}`, 'info');
    }

    async sendBackgroundMessage(message) {
        try {
            if (this.browser === 'firefox') {
                browser.runtime.sendMessage(message);
            } else {
                chrome.runtime.sendMessage(message);
            }
        } catch (error) {
            console.log('Background message failed:', error);
        }
    }

    async updateStatus() {
        try {
            const tabs = await ZohoAttendanceShared.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];

            const indicator = document.getElementById('statusIndicator');
            const text = document.getElementById('statusText');

            if (tab && tab.url && tab.url.includes('people.zoho.com')) {
                indicator.className = 'status-indicator online';
                text.textContent = 'Connected to Zoho People';
            } else {
                indicator.className = 'status-indicator offline';
                text.textContent = 'Navigate to Zoho People';
            }
        } catch (error) {
            const indicator = document.getElementById('statusIndicator');
            const text = document.getElementById('statusText');
            indicator.className = 'status-indicator offline';
            text.textContent = 'Extension ready';
        }
    }

    addLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;

        this.logs.unshift({ message: logEntry, type });

        // Keep only last 10 logs
        if (this.logs.length > 10) {
            this.logs.pop();
        }

        this.updateLogs();
    }

    updateLogs() {
        const logsContainer = document.getElementById('logs');
        logsContainer.innerHTML = this.logs
            .map(log => `<div class="log-entry ${log.type}">${log.message}</div>`)
            .join('');

        logsContainer.scrollTop = 0;
    }

    showBrowserInfo() {
        const browserInfo = document.getElementById('browserInfo');
        const browserName = this.browser === 'firefox' ? 'Firefox' : 'Chrome';
        browserInfo.textContent = `${browserName} v1.0.0`;
    }

    async showNotification(message, type = 'info') {
        try {
            const iconUrl = type === 'success' ?
                '/icons/icon48.png' :
                '/icons/icon48.png';

            await ZohoAttendanceShared.notifications.create('attendance-notification', {
                type: 'basic',
                iconUrl: iconUrl,
                title: '🕐 Zoho Attendance Helper',
                message: message
            });
        } catch (error) {
            console.log('Notification failed:', error);
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AttendancePopup();
});