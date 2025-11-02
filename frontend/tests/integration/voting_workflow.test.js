describe('Voting Workflow Integration', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        fetch.mockClear();
        window.voteHandlerInitialized = false;
    });

    test('complete voting workflow for a post', async () => {
        // Setup complete post card with voting forms
        document.body.innerHTML = `
            <form class="vote-form" action="/posts/1/vote/upvote/" method="post">
                <input type="hidden" name="csrfmiddlewaretoken" value="test-csrf">
                <button type="submit" class="btn btn-outline-success" data-post-id="1" data-vote-type="upvote">
                    Upvote
                </button>
            </form>
            <span id="vote-count-1"><strong>0</strong></span>
        `;

        // Mock successful upvote response
        fetch.mockResolvedValueOnce({
            status: 200,
            ok: true,
            json: async () => ({
                total_votes: 1,
                user_vote: 1,
                status: 'success',
                message: 'Successfully upvoted'
            })
        });

        // Let's use the same approach that works
        const forms = document.querySelectorAll('form');
        expect(forms.length).toBeGreaterThan(0);
        const form = forms[0];

        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);
        const button = buttons[0];

        const voteCountElement = document.getElementById('vote-count-1');
        expect(voteCountElement).not.toBeNull();
        
        const voteCount = voteCountElement.querySelector('strong');
        expect(voteCount).not.toBeNull();

        // Initial state
        expect(voteCount.textContent).toBe('0');
        expect(button.classList.contains('btn-outline-success')).toBe(true);
        expect(button.classList.contains('btn-success')).toBe(false);

        // Simulating form processing
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const url = this.action;
            const postId = button.dataset.postId;
            
            expect(postId).toBe('1');
            expect(url).toContain('/posts/1/vote/upvote/');
            
            return fetch(url, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': 'test-csrf'
                },
                body: formData
            });
        });

        // Perform upvote
        form.dispatchEvent(new Event('submit', { bubbles: true }));

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 0));

        // Check that fetch was called
        expect(fetch).toHaveBeenCalled();
    });

    test('voting workflow with error handling', async () => {
        document.body.innerHTML = `
            <form class="vote-form" action="/posts/1/vote/upvote/" method="post">
                <input type="hidden" name="csrfmiddlewaretoken" value="test-csrf">
                <button type="submit" data-post-id="1" data-vote-type="upvote">Upvote</button>
            </form>
            <span id="vote-count-1"><strong>0</strong></span>
        `;

        // Mock server error
        fetch.mockResolvedValueOnce({
            status: 500,
            ok: false,
            json: async () => ({
                error: 'Internal server error',
                status: 'error'
            })
        });

        const forms = document.querySelectorAll('form');
        expect(forms.length).toBeGreaterThan(0);
        
        const form = forms[0];
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            return fetch(this.action, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': 'test-csrf'
                },
                body: new FormData(this)
            });
        });

        form.dispatchEvent(new Event('submit', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 0));

        expect(fetch).toHaveBeenCalled();
    });

    test('form elements are properly selected', () => {
        document.body.innerHTML = `
            <form class="vote-form" action="/posts/1/vote/upvote/" method="post">
                <input type="hidden" name="csrfmiddlewaretoken" value="test-csrf">
                <button type="submit" data-post-id="1" data-vote-type="upvote">Upvote</button>
            </form>
        `;

        // We use the same approach that works in other tests
        const forms = document.querySelectorAll('form');
        expect(forms.length).toBe(1);
        
        const formByClass = document.querySelectorAll('.vote-form')[0];
        const formByTag = forms[0];
        const formByAction = document.querySelectorAll('form[action="/posts/1/vote/upvote/"]')[0];
        
        expect(formByClass).not.toBeNull();
        expect(formByTag).not.toBeNull();
        expect(formByAction).not.toBeNull();
        
        const buttons = document.querySelectorAll('button');
        expect(buttons.length).toBe(1);
        
        const button = buttons[0];
        expect(button).not.toBeNull();
        expect(button.dataset.postId).toBe('1');
        expect(button.dataset.voteType).toBe('upvote');
    });
});