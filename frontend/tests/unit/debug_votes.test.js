describe('Debug Votes', () => {
    test('debug_votes.js file exists and loads without errors', () => {
        expect(() => {
            require('../../static/js/debug_votes.js');
        }).not.toThrow();
    });

    test('debug votes initialization', () => {
        document.body.innerHTML = `<form class="vote-form"></form>`;
        
        require('../../static/js/debug_votes.js');
        
        expect(() => {
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }).not.toThrow();
    });
});