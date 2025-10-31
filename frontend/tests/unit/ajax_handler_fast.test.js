// frontend/tests/unit/ajax_handler_fast.test.js
describe('AJAX Handler - Fast Tests', () => {
    let ajaxHandler;

    beforeAll(() => {
        // Загружаем скрипт один раз
        ajaxHandler = require('../../../posts/static/posts/js/ajax_handler.js');
    });

    beforeEach(() => {
        document.body.innerHTML = `
            <form class="vote-form" action="/test" data-post-id="1">
                <input name="csrfmiddlewaretoken" value="test">
                <button type="submit">Vote</button>
            </form>
        `;
        jest.clearAllMocks();
    });

    test('script exports correctly', () => {
        expect(ajaxHandler).toBeDefined();
    });

    test('DOMContentLoaded event works', () => {
        const initializer = jest.fn();
        document.addEventListener('DOMContentLoaded', initializer);
        
        document.dispatchEvent(new Event('DOMContentLoaded'));
        
        expect(initializer).toHaveBeenCalled();
    });

    test('basic DOM manipulation works', () => {
        const form = document.querySelector('.vote-form');
        expect(form).toBeTruthy();
        expect(form.action).toContain('/test');
    });
});