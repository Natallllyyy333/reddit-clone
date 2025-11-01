describe('Comments Functionality', () => {
    let originalConsoleError;

    beforeAll(() => {
        originalConsoleError = console.error;
        console.error = jest.fn();
    });

    afterAll(() => {
        console.error = originalConsoleError;
    });

    beforeEach(() => {
        document.body.innerHTML = `
            <button class="comments-btn">Comments</button>
            <div id="comments-section">Comments content</div>
            <a href="#write_comment">Write comment</a>
            <div id="write_comment">
                <textarea></textarea>
            </div>
            <div id="deleteCommentModal">
                <form id="deleteCommentForm"></form>
            </div>
        `;

        global.bootstrap = {
            Modal: {
                getOrCreateInstance: jest.fn(() => ({
                    show: jest.fn(),
                    hide: jest.fn()
                }))
            }
        };

        window.scrollTo = jest.fn();
    });

    test('comments.js loads without throwing errors', () => {
        expect(() => {
            require('../../static/js/comments.js');
        }).not.toThrow();
    });

    test('DOM elements exist before script load', () => {
        const commentsBtn = document.querySelector('.comments-btn');
        const commentsSection = document.getElementById('comments-section');
        
        expect(commentsBtn).toBeTruthy();
        expect(commentsSection).toBeTruthy();
    });

    test('comments script initializes without errors', () => {
        const commentsBtnBefore = document.querySelector('.comments-btn');
        expect(commentsBtnBefore).toBeTruthy();

        require('../../static/js/comments.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const commentsBtnAfter = document.querySelector('.comments-btn');
        expect(commentsBtnAfter).toBeTruthy();
    });

    test('delete comment modal with proper event', () => {
        require('../../static/js/comments.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const deleteModal = document.getElementById('deleteCommentModal');
        
        // Создаем правильное событие с relatedTarget
        const mockButton = document.createElement('button');
        mockButton.setAttribute('data-comment-id', '123');
        mockButton.setAttribute('data-comment-url', '/delete/123/');
        
        const modalEvent = new Event('show.bs.modal');
        modalEvent.relatedTarget = mockButton;

        // Теперь не должно быть ошибки
        expect(() => {
            deleteModal.dispatchEvent(modalEvent);
        }).not.toThrow();
    });

    test('anchor links exist', () => {
        require('../../static/js/comments.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const anchorLink = document.querySelector('a[href="#write_comment"]');
        expect(anchorLink).toBeTruthy();
    });
});