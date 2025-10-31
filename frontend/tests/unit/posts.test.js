describe('Posts Functionality', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="post-card">Post 1</div>
            <div class="post-card">Post 2</div>
        `;
    });

    test('posts.js file exists and loads without errors', () => {
        expect(() => {
            require('../../static/js/posts.js');
        }).not.toThrow();
    });

    test('posts initialization works', () => {
        require('../../static/js/posts.js');
        
        expect(() => {
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }).not.toThrow();
    });
});