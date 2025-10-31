describe('Voting Functionality', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <form class="vote-form">
                <input name="csrfmiddlewaretoken" value="test-csrf">
                <button class="vote-btn" data-post-id="1" data-vote-type="upvote">Upvote</button>
            </form>
        `;
    });

    test('voting.js file exists and loads without errors', () => {
        expect(() => {
            require('../../static/js/voting.js');
        }).not.toThrow();
    });

    test('voting initialization', () => {
        require('../../static/js/voting.js');
        
        expect(() => {
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }).not.toThrow();
    });
});