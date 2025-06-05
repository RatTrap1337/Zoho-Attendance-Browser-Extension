// Chrome background service worker
class AttendanceSchedulerChrome {
    constructor() {
        this.init();
    }

    init() {
        this.setupMessageListeners();
        this.setupAlarmListeners();
        this.loadSettings();
    }

    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'toggleAutoSchedule') {
                this.toggleAutoSchedule(request.enabled);
            }
        });
    }

    setupAlarmListeners() {
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === 'checkin') {
                this.performScheduledAttendance('checkin');
            } else if (alarm.name === 'checkout') {
                this.performScheduledAttendance('checkout');
            }
        });
    }

    async loadSettings() {
        const settings = await new Promise((resolve) => {
            chrome.storage.sync.get({
                autoSchedule: false,
                checkinTime: '09:00',
                checkoutTime: '17:30'
            }, resolve);
        });

        if (settings.autoSchedule) {
            this.setupSchedule(settings.checkinTime, settings.checkoutTime);
        }
    }

    async toggleAutoSchedule(enabled) {
        await new Promise((resolve) => {
            chrome.storage.sync.set({ autoSchedule: enabled }, resolve);
        });

        if (enabled) {
            const settings = await new Promise((resolve) => {
                chrome.storage.sync.get(['checkinTime', 'checkoutTime'], resolve);
            });
            this.setupSchedule(settings.checkinTime, settings.checkoutTime);
        } else {
            this.clearSchedule();
        }

        this.log(`Auto-schedule ${enabled ? 'enabled' : 'disabled'}`);
    }

    setupSchedule(checkinTime, checkoutTime) {
        this.clearSchedule();

        this.createDailyAlarm('checkin', checkinTime);
        this.createDailyAlarm('checkout', checkoutTime);

        this.log(`Schedule set: Check-in at ${checkinTime}, Check-out at ${checkoutTime}`);
    }

    createDailyAlarm(name, time) {
        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        const scheduledTime = new Date();

        scheduledTime.setHours(hours, minutes, 0, 0);

        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        chrome.alarms.create(name, {
            when: scheduledTime.getTime(),
            periodInMinutes: 24 * 60
        });

        this.log(`${name} alarm set for ${scheduledTime.toLocaleString()}`);
    }

    clearSchedule() {
        chrome.alarms.clear('checkin');
        chrome.alarms.clear('checkout');
        this.log('Schedule cleared');
    }

    async performScheduledAttendance(type) {
        this.log(`🔔 Scheduled ${type} triggered`);

        try {
            const tabs = await new Promise((resolve) => {
                chrome.tabs.query({ url: '*://people.zoho.com/*' }, resolve);
            });

            if (tabs.length === 0) {
                const tab = await new Promise((resolve) => {
                    chrome.tabs.create({
                        url: 'https://people.zoho.com',
                        active: false
                    }, resolve);
                });

                await this.waitForTabLoad(tab.id);
                await this.sendAttendanceMessage(tab.id, type);
            } else {
                const tab = tabs[0];
                await this.sendAttendanceMessage(tab.id, type);
            }

            this.showNotification(type, 'success');

        } catch (error) {
            this.log(`❌ Scheduled ${type} failed: ${error.message}`);
            this.showNotification(type, 'error', error.message);
        }
    }

    async sendAttendanceMessage(tabId, type) {
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, {
                action: 'performAttendance',
                type: type
            }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else if (response && response.success) {
                    resolve(response);
                } else {
                    reject(new Error(response?.error || 'Unknown error'));
                }
            });
        });
    }

    waitForTabLoad(tabId) {
        return new Promise((resolve) => {
            const listener = (updatedTabId, changeInfo) => {
                if (updatedTabId === tabId && changeInfo.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(listener);
                    setTimeout(resolve, 2000);
                }
            };
            chrome.tabs.onUpdated.addListener(listener);
        });
    }

    showNotification(type, status, error = null) {
        const title = status === 'success' ?
            `✅ ${type === 'checkin' ? 'Checked In' : 'Checked Out'}` :
            `❌ ${type === 'checkin' ? 'Check-in' : 'Check-out'} Failed`;

        const message = status === 'success' ?
            'Attendance recorded successfully' :
            error || 'Failed to record attendance';

        chrome.notifications.create({
            type: 'basic',
            iconUrl: '/icons/icon48.png',
            title: title,
            message: message
        });
    }

    log(message) {
        const timestamp = new Date().toLocaleString();
        console.log(`[${timestamp}] ${message}`);

        chrome.storage.local.get(['logs'], (result) => {
            const logs = result.logs || [];
            logs.unshift({
                timestamp: timestamp,
                message: message,
                type: message.includes('❌') ? 'error' :
                    message.includes('✅') ? 'success' : 'info'
            });

            if (logs.length > 50) {
                logs.splice(50);
            }

            chrome.storage.local.set({ logs: logs });
        });
    }

    async handleInstallation() {
        await new Promise((resolve) => {
            chrome.storage.sync.set({
                autoSchedule: false,
                checkinTime: '09:00',
                checkoutTime: '17:30',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }, resolve);
        });

        this.log('🚀 Zoho Attendance Helper installed');

        chrome.notifications.create({
            type: 'basic',
            iconUrl: '/icons/icon48.png',
            title: '🕐 Zoho Attendance Helper',
            message: 'Extension installed! Click the icon to get started.'
        });
    }
}

// Initialize background script
chrome.runtime.onInstalled.addListener((details) => {
    const scheduler = new AttendanceSchedulerChrome();

    if (details.reason === 'install') {
        scheduler.handleInstallation();
    }
});

chrome.runtime.onStartup.addListener(() => {
    new AttendanceSchedulerChrome();
});

// Initialize immediately
new AttendanceSchedulerChrome();