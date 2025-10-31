// frontend/tests/unit/ajax_handler_final.test.js
describe('AJAX Handler - Final Clean Tests', () => {
    beforeEach(() => {
        // Настраиваем полную DOM структуру
        document.body.innerHTML = `
            <form class="vote-form" action="/posts/1/vote/upvote/" method="post" data-post-id="1">
                <input type="hidden" name="csrfmiddlewaretoken" value="test-csrf">
                <button type="submit" class="vote-btn" data-post-id="1" data-vote-type="upvote">Upvote</button>
            </form>
            <div id="vote-count-1">5</div>
            <div id="post-score-1">5</div>
            <div class="alert alert-success">Test</div>
        `;
        
        // Мокаем fetch
        global.fetch = jest.fn(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true, score: 6 })
            })
        );
        
        // Мокаем console для чистого вывода
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('loads without errors', () => {
        expect(() => {
            require('../../../posts/static/posts/js/ajax_handler.js');
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }).not.toThrow();
    });

    test('processes forms and handles submissions', (done) => {
        require('../../../posts/static/posts/js/ajax_handler.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        setTimeout(() => {
            const form = document.querySelector('.vote-form');
            form.dispatchEvent(new Event('submit', { bubbles: true }));

            setTimeout(() => {
                expect(global.fetch).toHaveBeenCalled();
                done();
            }, 200);
        }, 200);
    });
});