// frontend/tests/unit/posts.extended.test.js
describe('Posts Extended Tests', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="post-card">Post 1</div>
            <div class="post-card">Post 2</div>
            <form id="shareForm" action="/posts/1/share/" data-post-id="1">
                <button type="submit">Share</button>
            </form>
        `;

        global.bootstrap = {
            Modal: {
                getInstance: jest.fn(() => ({
                    hide: jest.fn()
                }))
            }
        };

        global.fetch = jest.fn(() => 
            Promise.resolve({
                json: () => Promise.resolve({ success: true, shares_count: 1 })
            })
        );
    });

    test('should handle post animations and AJAX', async () => {
        require('../../static/js/posts.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // Test post animations
        const postCards = document.querySelectorAll('.post-card');
        expect(postCards.length).toBe(2);

        // Test share form submission
        const form = document.getElementById('shareForm');
        form.dispatchEvent(new Event('submit'));

        await new Promise(resolve => setTimeout(resolve, 0));
        
        expect(fetch).toHaveBeenCalled();
    });
});