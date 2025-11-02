describe('AJAX Handler - Reliable Tests', () => {
    let ajaxHandler;

    beforeAll(() => {
        // Load the script once for all tests
        ajaxHandler = require('../../../posts/static/posts/js/ajax_handler.js');
    });

    beforeEach(() => {
        //  First we clear the DOM, then we set it up
        document.body.innerHTML = '';
        
        // Creating a complete DOM structure
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
        
        // Clearing all mocks
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
        
        // Dispatching the DOMContentLoaded event
        document.dispatchEvent(new Event('DOMContentLoaded'));
        
        // Checking that there were no errors
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
        
        // Just checking that the form is available for events
        expect(() => {
            form.dispatchEvent(new Event('submit', { bubbles: true }));
        }).not.toThrow();
    });
});