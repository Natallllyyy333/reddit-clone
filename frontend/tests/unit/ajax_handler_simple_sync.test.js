// frontend/tests/unit/ajax_handler_simple_sync.test.js
describe('AJAX Handler - Simple Sync Tests', () => {
    beforeEach(() => {
        // Полная очистка и установка DOM
        document.body.innerHTML = '';
        document.body.innerHTML = `
            <form class="vote-form" action="/test" data-post-id="1">
                <input name="csrfmiddlewaretoken" value="test">
                <button type="submit">Vote</button>
            </form>
            <div id="vote-count-1">0</div>
        `;
        jest.clearAllMocks();
    });

    test('DOM setup works correctly', () => {
        const form = document.querySelector('.vote-form');
        const voteCount = document.getElementById('vote-count-1');
        
        expect(form).toBeTruthy();
        expect(voteCount).toBeTruthy();
        expect(form.action).toContain('/test');
    });

    test('script can be required without errors', () => {
        expect(() => {
            require('../../../posts/static/posts/js/ajax_handler.js');
        }).not.toThrow();
    });

    test('DOMContentLoaded event can be dispatched', () => {
        require('../../../posts/static/posts/js/ajax_handler.js');
        
        expect(() => {
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }).not.toThrow();
    });
});