describe('Comments Functionality - Improved', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <button class="comments-btn">
                <i>💬</i> <span class="comments-count">5</span> комментариев
            </button>
            <div id="comments-section" class="hidden">
                <div class="comment">Test comment</div>
                <a href="#write_comment">Write comment</a>
                <div id="write_comment">
                    <textarea></textarea>
                </div>
            </div>
            <div id="deleteCommentModal">
                <form id="deleteCommentForm"></form>
            </div>
            <header style="height: 60px;"></header>
        `;

        global.bootstrap = {
            Modal: {
                getOrCreateInstance: jest.fn(() => ({
                    show: jest.fn(),
                    hide: jest.fn()
                }))
            }
        };

        Object.assign(navigator, {
            share: jest.fn(),
            clipboard: {
                writeText: jest.fn().mockResolvedValue(undefined)
            }
        });
    });

    test('should load comments.js without errors', () => {
        expect(() => {
            require('../../static/js/comments.js');
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }).not.toThrow();
    });

    test('should toggle comments section', () => {
        require('../../static/js/comments.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const commentsBtn = document.querySelector('.comments-btn');
        const commentsSection = document.getElementById('comments-section');

        commentsBtn.click();
        expect(commentsSection.classList.contains('hidden')).toBe(false);

        commentsBtn.click();
        expect(commentsSection.classList.contains('hidden')).toBe(true);
    });
});