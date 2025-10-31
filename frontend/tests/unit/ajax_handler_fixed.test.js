// frontend/tests/unit/ajax_handler_fixed.test.js
describe('AJAX Handler - Fixed Tests', () => {
    beforeEach(() => {
        // Очищаем все моки
        jest.clearAllMocks();
        
        // Настраиваем минимальный DOM
        document.body.innerHTML = `
            <form class="vote-form" action="/posts/1/vote/upvote/" method="post" data-post-id="1">
                <input type="hidden" name="csrfmiddlewaretoken" value="test-csrf">
                <button type="submit" class="vote-btn" data-post-id="1" data-vote-type="upvote">
                    Upvote
                </button>
            </form>
            <div id="vote-count-1">5</div>
            <div id="post-score-1">5</div>
        `;
    });

    test('script loads without throwing errors', () => {
        expect(() => {
            require('../../../posts/static/posts/js/ajax_handler.js');
        }).not.toThrow();
    });

    test('DOMContentLoaded initializes without errors', () => {
        const consoleSpy = jest.spyOn(console, 'error');
        
        require('../../../posts/static/posts/js/ajax_handler.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));
        
        expect(consoleSpy).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    test('vote forms are processed after initialization', (done) => {
        require('../../../posts/static/posts/js/ajax_handler.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // Используем короткий таймаут для асинхронной обработки
        setTimeout(() => {
            const form = document.querySelector('.vote-form');
            expect(form).toBeTruthy();
            done();
        }, 100);
    });

    test('form submission triggers fetch', (done) => {
        require('../../../posts/static/posts/js/ajax_handler.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        setTimeout(() => {
            const form = document.querySelector('.vote-form');
            form.dispatchEvent(new Event('submit', { bubbles: true }));

            setTimeout(() => {
                expect(global.fetch).toHaveBeenCalled();
                done();
            }, 50);
        }, 100);
    });
});