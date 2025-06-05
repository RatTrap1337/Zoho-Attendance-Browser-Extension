// Chrome content script
class ZohoAttendanceBotChrome {
    constructor() {
        this.init();
    }

    init() {
        this.setupMessageListener();
        this.observePageChanges();
        ZohoAttendanceShared.log('Chrome Attendance Bot initialized');
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'performAttendance') {
                this.performAttendance(request.type)
                    .then(result => sendResponse(result))
                    .catch(error => sendResponse({ success: false, error: error.message }));
                return true; // Will respond asynchronously
            }
        });
    }

    observePageChanges() {
        const observer = new MutationObserver(() => {
            this.scanForAttendanceButtons();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    async performAttendance(type) {
        ZohoAttendanceShared.log(`Attempting ${type}...`);

        await this.waitForPageLoad();

        const strategies = [
            () => this.findAndClickBySelector(type),
            () => this.findAndClickByText(type),
            () => this.findAndClickByAria(type),
            () => this.findAndClickByForm(type),
            () => this.findAndClickByAPI(type)
        ];

        for (const strategy of strategies) {
            try {
                const result = await strategy();
                if (result.success) {
                    ZohoAttendanceShared.log(`${type} successful via ${result.method}`, 'success');
                    return result;
                }
            } catch (error) {
                ZohoAttendanceShared.log(`Strategy failed: ${error.message}`, 'error');
            }
        }

        throw new Error(`Could not find ${type} button on this page`);
    }

    async findAndClickBySelector(type) {
        ZohoAttendanceShared.log('Strategy 1: Selector-based search');

        const keywords = type === 'checkin' ?
            ['check in', 'checkin', 'punch in', 'punchin', 'start work', 'clock in'] :
            ['check out', 'checkout', 'punch out', 'punchout', 'end work', 'clock out'];

        for (const selector of ZohoAttendanceShared.attendanceSelectors) {
            const elements = document.querySelectorAll(selector);

            for (const element of elements) {
                const text = (element.textContent || element.value || element.title || '').toLowerCase();
                const hasKeyword = keywords.some(keyword => text.includes(keyword));

                if (hasKeyword && ZohoAttendanceShared.isElementClickable(element)) {
                    await ZohoAttendanceShared.clickElement(element);
                    return { success: true, method: 'selector', element: selector };
                }
            }
        }

        throw new Error('No matching selectors found');
    }

    async findAndClickByText(type) {
        ZohoAttendanceShared.log('Strategy 2: Text-based search');

        const searchTexts = type === 'checkin' ?
            ['Check In', 'Punch In', 'Clock In', 'Start Work'] :
            ['Check Out', 'Punch Out', 'Clock Out', 'End Work'];

        for (const searchText of searchTexts) {
            const xpath = `//button[contains(text(), "${searchText}")] | //input[@value="${searchText}"] | //a[contains(text(), "${searchText}")]`;
            const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

            if (result.singleNodeValue && ZohoAttendanceShared.isElementClickable(result.singleNodeValue)) {
                await ZohoAttendanceShared.clickElement(result.singleNodeValue);
                return { success: true, method: 'text', text: searchText };
            }
        }

        throw new Error('No matching text found');
    }

    async findAndClickByAria(type) {
        ZohoAttendanceShared.log('Strategy 3: ARIA-based search');

        const ariaLabels = type === 'checkin' ?
            ['check in', 'punch in', 'clock in'] :
            ['check out', 'punch out', 'clock out'];

        for (const label of ariaLabels) {
            const element = document.querySelector(`[aria-label*="${label}" i], [aria-labelledby*="${label}" i]`);

            if (element && ZohoAttendanceShared.isElementClickable(element)) {
                await ZohoAttendanceShared.clickElement(element);
                return { success: true, method: 'aria', label: label };
            }
        }

        throw new Error('No matching ARIA labels found');
    }

    async findAndClickByForm(type) {
        ZohoAttendanceShared.log('Strategy 4: Form-based search');

        const forms = document.querySelectorAll('form');

        for (const form of forms) {
            const formText = form.textContent.toLowerCase();
            const isAttendanceForm = ['attendance', 'check', 'punch', 'clock'].some(keyword =>
                formText.includes(keyword)
            );

            if (isAttendanceForm) {
                const buttons = form.querySelectorAll('button, input[type="submit"], input[type="button"]');

                for (const button of buttons) {
                    const buttonText = (button.textContent || button.value || '').toLowerCase();
                    const isCorrectType = type === 'checkin' ?
                        buttonText.includes('in') || buttonText.includes('start') :
                        buttonText.includes('out') || buttonText.includes('end');

                    if (isCorrectType && ZohoAttendanceShared.isElementClickable(button)) {
                        await ZohoAttendanceShared.clickElement(button);
                        return { success: true, method: 'form', button: buttonText };
                    }
                }
            }
        }

        throw new Error('No matching forms found');
    }

    async findAndClickByAPI(type) {
        ZohoAttendanceShared.log('Strategy 5: API-based approach');

        const possibleFunctions = [
            'checkIn', 'checkOut', 'punchIn', 'punchOut',
            'markAttendance', 'recordAttendance', 'submitAttendance'
        ];

        for (const funcName of possibleFunctions) {
            if (typeof window[funcName] === 'function') {
                try {
                    await window[funcName]();
                    return { success: true, method: 'api', function: funcName };
                } catch (error) {
                    ZohoAttendanceShared.log(`Failed to call ${funcName}: ${error.message}`);
                }
            }
        }

        const attendanceElements = document.querySelectorAll('[class*="attendance"], [id*="attendance"]');

        for (const element of attendanceElements) {
            if (ZohoAttendanceShared.isElementClickable(element)) {
                await ZohoAttendanceShared.clickElement(element);
                return { success: true, method: 'api', element: 'attendance element' };
            }
        }

        throw new Error('No API methods found');
    }

    async waitForPageLoad() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }

    scanForAttendanceButtons() {
        const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"], a');

        buttons.forEach(button => {
            const text = (button.textContent || button.value || button.title || '').toLowerCase();

            if (text.includes('check') || text.includes('punch') || text.includes('attendance')) {
                if (!button.dataset.attendanceBot) {
                    button.dataset.attendanceBot = 'detected';
                    ZohoAttendanceShared.log(`Detected potential attendance button: ${text}`);
                }
            }
        });
    }
}

// Initialize the bot when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ZohoAttendanceBotChrome());
} else {
    new ZohoAttendanceBotChrome();
}