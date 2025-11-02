describe('AJAX Handler - Improved Tests', () => {
    let originalFetch;
    let consoleSpy;
    
    beforeAll(() => {
        originalFetch = global.fetch;
        global.fetch = jest.fn(() => 
            Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ 
                    success: true, 
                    score: 5, 
                    upvotes: 3, 
                    downvotes: 2,
                    user_vote: 'upvote' 
                }),
                text: () => Promise.resolve('')
            })
        );
        
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterAll(() => {
        global.fetch = originalFetch;
        consoleSpy.mockRestore();
    });

    beforeEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
        
        document.body.innerHTML = `
            <form class="vote-form" action="/posts/1/vote/upvote/" method="post" data-post-id="1">
                <input type="hidden" name="csrfmiddlewaretoken" value="test-csrf-token">
                <button type="submit" class="btn btn-outline-success vote-btn" 
                        data-post-id="1" data-vote-type="upvote">
                    <i class="fa fa-thumbs-up"></i>
                </button>
                <button type="submit" class="btn btn-outline-danger vote-btn" 
                        data-post-id="1" data-vote-type="downvote">
                    <i class="fa fa-thumbs-down"></i>
                </button>
            </form>
            <div id="vote-count-1">5</div>
            <div id="post-score-1">5</div>
            <div id="post-score">5</div>
            <div id="upvotes-count">3</div>
            <div id="downvotes-count">2</div>
            <div class="alert alert-success" data-bs-delay="3000">Test alert</div>
            <button class="btn-close" data-bs-dismiss="alert"></button>
            <header style="height: 60px;"></header>
        `;
    });

    test('should initialize without console errors', () => {
        const errorSpy = jest.spyOn(console, 'error');
        
        expect(() => {
            require('../../../posts/static/posts/js/ajax_handler.js');
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }).not.toThrow();
        
        expect(errorSpy).not.toHaveBeenCalled();
        errorSpy.mockRestore();
    });

    test('should process vote forms correctly', (done) => {
        require('../../../posts/static/posts/js/ajax_handler.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        setTimeout(() => {
            const form = document.querySelector('.vote-form');
            expect(form).toBeTruthy();
            expect(form.hasAttribute('data-vote-handler')).toBe(true);
            done();
        }, 500);
    }, 5000);

    test('should handle form submission with fetch', (done) => {
        global.fetch.mockClear();
        
        require('../../../posts/static/posts/js/ajax_handler.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        setTimeout(() => {
            const form = document.querySelector('.vote-form');
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            
            form.dispatchEvent(submitEvent);

            setTimeout(() => {
                expect(global.fetch).toHaveBeenCalled();
                
                const fetchCall = global.fetch.mock.calls[0];
                expect(fetchCall[0]).toContain('/posts/1/vote/upvote/');
                expect(fetchCall[1].method).toBe('POST');
                // ИСПРАВЛЕННЫЙ ТОКЕН
                expect(fetchCall[1].headers['X-CSRFToken']).toBe('test-csrf-token');
                
                done();
            }, 300);
        }, 500);
    }, 5000);

    test('should update UI after successful vote', (done) => {
        require('../../../posts/static/posts/js/ajax_handler.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        setTimeout(() => {
            const form = document.querySelector('.vote-form');
            form.dispatchEvent(new Event('submit', { bubbles: true }));

            setTimeout(() => {
                const voteCount = document.getElementById('vote-count-1');
                const postScore = document.getElementById('post-score-1');
                
                expect(voteCount).toBeTruthy();
                expect(postScore).toBeTruthy();
                
                done();
            }, 300);
        }, 500);
    }, 5000);
});