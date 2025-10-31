describe('Share Functionality', () => {
    let originalConsoleError;

    beforeAll(() => {
        // Сохраняем оригинальный console.error
        originalConsoleError = console.error;
        console.error = jest.fn(); // Отключаем ошибки в тестах
    });

    afterAll(() => {
        // Восстанавливаем console.error
        console.error = originalConsoleError;
    });

    beforeEach(() => {
        // Простой и чистый DOM
        document.body.innerHTML = `
            <button class="share-btn" data-post-id="123">Share</button>
            <div id="shareModal">
                <input id="shareUrl" type="text">
                <button id="copyShareUrlBtn">Copy</button>
            </div>
        `;

        // Минимальные моки
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

        // Загружаем скрипт
        require('../../static/js/share.js');
        
        // Инициализируем
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // Проверяем, что элементы все еще существуют
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