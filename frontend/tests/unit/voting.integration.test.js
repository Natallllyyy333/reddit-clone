describe('Voting Functionality - Improved', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div data-post-id="1">
                <button class="vote-btn" data-vote-type="upvote">Upvote</button>
                <button class="vote-btn" data-vote-type="downvote">Downvote</button>
            </div>
            <input name="csrfmiddlewaretoken" value="test-csrf-token">
            <div id="post-score-1">0</div>
            <div id="post-score">0</div>
            <div id="upvotes-count">0</div>
            <div id="downvotes-count">0</div>
        `;

        global.fetch = jest.fn(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    score: 5,
                    upvotes: 3,
                    downvotes: 2
                })
            })
        );

        global.alert = jest.fn();
    });

    test('should load voting.js without errors', () => {
        expect(() => {
            require('../../static/js/voting.js');
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }).not.toThrow();
    });

    test('should handle vote button clicks', () => {
        require('../../static/js/voting.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const upvoteButton = document.querySelector('[data-vote-type="upvote"]');
        upvoteButton.click();

        expect(fetch).toHaveBeenCalled();
    });
});