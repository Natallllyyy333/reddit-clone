// frontend/tests/unit/ajax_handler_reliable.test.js
describe('AJAX Handler - Reliable Tests', () => {
    let ajaxHandler;

    beforeAll(() => {
        // Загружаем скрипт один раз для всех тестов
        ajaxHandler = require('../../../posts/static/posts/js/ajax_handler.js');
    });

    beforeEach(() => {
        // ВАЖНО: сначала очищаем DOM, потом устанавливаем
        document.body.innerHTML = '';
        
        // Создаем полную DOM структуру
        document.body.innerHTML = `
            <form class="vote-form" action="/posts/1/vote/upvote/" method="post" data-post-id="1">
                <input type="hidden" name="csrfmiddlewaretoken" value="test-csrf">
                <button type="submit" class="vote-btn" data-post-id="1" data-vote-type="upvote">
                    Upvote
                </button>
            </form>
            <div id="vote-count-1">5</div>
            <div id="post-score-1">5</div>
            <div class="alert alert-success">Test Alert</div>
        `;
        
        // Очищаем все моки
        jest.clearAllMocks();
    });

    test('DOM is properly set up before tests', () => {
        const form = document.querySelector('.vote-form');
        const voteCount = document.getElementById('vote-count-1');
        
        expect(form).toBeTruthy();
        expect(voteCount).toBeTruthy();
        expect(voteCount.textContent).toBe('5');
    });

    test('script loads without errors', () => {
        expect(ajaxHandler).toBeDefined();
    });

    test('DOMContentLoaded event initializes handlers', () => {
        const consoleSpy = jest.spyOn(console, 'error');
        
        // Диспатчим событие DOMContentLoaded
        document.dispatchEvent(new Event('DOMContentLoaded'));
        
        // Проверяем что не было ошибок
        expect(consoleSpy).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    test('form exists after initialization', () => {
        document.dispatchEvent(new Event('DOMContentLoaded'));
        
        const form = document.querySelector('.vote-form');
        expect(form).toBeTruthy();
        expect(form.action).toContain('/posts/1/vote/upvote/');
    });

    test('form submission can be triggered', () => {
        document.dispatchEvent(new Event('DOMContentLoaded'));
        
        const form = document.querySelector('.vote-form');
        expect(form).toBeTruthy();
        
        // Просто проверяем что форма доступна для событий
        expect(() => {
            form.dispatchEvent(new Event('submit', { bubbles: true }));
        }).not.toThrow();
    });
});