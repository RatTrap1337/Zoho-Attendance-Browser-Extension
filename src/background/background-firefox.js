// Firefox background script
class AttendanceSchedulerFirefox {
    constructor() {
        this.init();
    }

    init() {
        this.setupMessageListeners();
        this.setupAlarmListeners();
        this.loadSettings();
    }

    setupMessageListeners() {
        browser.runtime.onMessage.addListener((request, sender) => {
            if (request.action === 'toggleAutoSchedule') {
                this.toggleAutoSchedule(request.enabled);
            }
        });
    }

    setupAlarmListeners() {
        browser.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === 'checkin') {
                this.performScheduledAttendance('checkin');
            } else if (alarm.name === 'checkout') {
                this.performScheduledAttendance('checkout');
            }
        });
    }

    async loadSettings() {
        const settings = await browser.storage.sync.get({
            autoSchedule: false,
            checkinTime: '09:00',
            checkoutTime: '17:30'
        });

        if (settings.autoSchedule) {
            this.setupSchedule(settings.checkinTime, settings.checkoutTime);
        }
    }

    async toggleAutoSchedule(enabled) {
        await browser.storage.sync.set({ autoSchedule: enabled });

        if (enabled) {
            const settings = await browser.storage.sync.get(['checkinTime', 'checkoutTime']);
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

        browser.alarms.create(name, {
            when: scheduledTime.getTime(),
            periodInMinutes: 24 * 60
        });

        this.log(`${name} alarm set for ${scheduledTime.toLocaleString()}`);
    }

    clearSchedule() {
        browser.alarms.clear('checkin');
        browser.alarms.clear('checkout');
        this.log('Schedule cleared');
    }

    async performScheduledAttendance(type) {
        this.log(`🔔 Scheduled ${type} triggered`);

        try {
            const tabs = await browser.tabs.query({ url: '*://people.zoho.com/*' });

            if (tabs.length === 0) {
                const tab = await browser.tabs.create({
                    url: 'https://people.zoho.com',
                    active: false
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
        try {
            const response = await browser.tabs.sendMessage(tabId, {
                action: 'performAttendance',
                type: type
            });

            if (response && response.success) {
                return response;
            } else {
                throw new Error(response?.error || 'Unknown error');
            }
        } catch (error) {
            throw new Error(`Failed to send message: ${error.message}`);
        }
    }

    waitForTabLoad(tabId) {
        return new Promise((resolve) => {
            const listener = (updatedTabId, changeInfo) => {
                if (updatedTabId === tabId && changeInfo.status === 'complete') {
                    browser.tabs.onUpdated.removeListener(listener);
                    setTimeout(resolve, 2000);
                }
            };
            browser.tabs.onUpdated.addListener(listener);
        });
    }

    showNotification(type, status, error = null) {
        const title = status === 'success' ?
            `✅ ${type === 'checkin' ? 'Checked In' : 'Checked Out'}` :
            `❌ ${type === 'checkin' ? 'Check-in' : 'Check-out'} Failed`;

        const message = status === 'success' ?
            'Attendance recorded successfully' :
            error || 'Failed to record attendance';

        browser.notifications.create({
            type: 'basic',
            iconUrl: '/icons/icon48.png',
            title: title,
            message: message
        });
    }

    log(message) {
        const timestamp = new Date().toLocaleString();
        console.log(`[${timestamp}] ${message}`);

        browser.storage.local.get(['logs']).then((result) => {
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

            browser.storage.local.set({ logs: logs });
        });
    }

    async handleInstallation() {
        await browser.storage.sync.set({
            autoSchedule: false,
            checkinTime: '09:00',
            checkoutTime: '17:30',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });

        this.log('🚀 Zoho Attendance Helper installed');

        browser.notifications.create({
            type: 'basic',
            iconUrl: '/icons/icon48.png',
            title: '🕐 Zoho Attendance Helper',
            message: 'Extension installed! Click the icon to get started.'
        });
    }
}

// Initialize background script
browser.runtime.onInstalled.addListener((details) => {
    const scheduler = new AttendanceSchedulerFirefox();

    if (details.reason === 'install') {
        scheduler.handleInstallation();
    }
});

browser.runtime.onStartup.addListener(() => {
    new AttendanceSchedulerFirefox();
});

// Initialize immediately
new AttendanceSchedulerFirefox();