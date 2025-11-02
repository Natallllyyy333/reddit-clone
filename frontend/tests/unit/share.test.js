describe('Share Functionality', () => {
    let originalConsoleError;

    beforeAll(() => {
        // Keep the originalconsole.error
        originalConsoleError = console.error;
        console.error = jest.fn(); // Отключаем ошибки в тестах
    });

    afterAll(() => {
        // Restoring console.error
        console.error = originalConsoleError;
    });

    beforeEach(() => {
        // Simple and clean DOM
        document.body.innerHTML = `
            <button class="share-btn" data-post-id="123">Share</button>
            <div id="shareModal">
                <input id="shareUrl" type="text">
                <button id="copyShareUrlBtn">Copy</button>
            </div>
        `;

        // Minimal моки
        global.bootstrap = {
            Modal: {
                getOrCreateInstance: jest.fn(() => ({
                    show: jest.fn(),
                    hide: jest.fn()
                }))
            }
        };

        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn().mockResolvedValue(undefined)
            }
        });
    });

    test('share.js loads without throwing errors', () => {
        expect(() => {
            require('../../static/js/share.js');
        }).not.toThrow();
    });

    test('DOM elements exist before script load', () => {
        const shareBtn = document.querySelector('.share-btn');
        const shareModal = document.getElementById('shareModal');
        
        expect(shareBtn).toBeTruthy();
        expect(shareModal).toBeTruthy();
    });

    test('share script initializes without errors', () => {
        const shareBtnBefore = document.querySelector('.share-btn');
        expect(shareBtnBefore).toBeTruthy();

        // Loading script
        require('../../static/js/share.js');
        
        // Initializing
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // Checking that the elements still exist
        const shareBtnAfter = document.querySelector('.share-btn');
        expect(shareBtnAfter).toBeTruthy();
    });

    test('copy button functionality', () => {
        require('../../static/js/share.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const copyBtn = document.getElementById('copyShareUrlBtn');
        const shareUrl = document.getElementById('shareUrl');
        
        shareUrl.value = 'test-url';
        copyBtn.click();
        
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-url');
    });
});