describe('Share Extended Tests', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <button class="share-btn" data-post-id="123">Share</button>
            <div id="shareModal">
                <input id="shareUrl" type="text">
                <button id="copyShareUrlBtn">Copy</button>
                <a id="twitterShare"></a>
                <a id="facebookShare"></a>
                <a id="linkedinShare"></a>
                <a id="telegramShare"></a>
            </div>
            <div class="card">
                <h2 class="post-title">Test Post Title</h2>
            </div>
        `;

        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn().mockResolvedValue(undefined)
            }
        });
    });

    test('should handle all share functionality', async () => {
        require('../../static/js/share.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const shareBtn = document.querySelector('.share-btn');
        expect(shareBtn).toBeTruthy();
        expect(shareBtn.getAttribute('data-post-id')).toBe('123');

        const copyBtn = document.getElementById('copyShareUrlBtn');
        expect(copyBtn).toBeTruthy();
        
        document.getElementById('shareUrl').value = 'http://test.com';
        copyBtn.click();

        await new Promise(resolve => setTimeout(resolve, 0));
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://test.com');
    });

    test('should handle copy feedback', async () => {
        require('../../static/js/share.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const copyBtn = document.getElementById('copyShareUrlBtn');
        const originalHTML = copyBtn.innerHTML;

        // Setting the URL for copying
        document.getElementById('shareUrl').value = 'http://test.com';
        
        // INSTEAD of calling window.copyShareUrl() - we simulate a real click
        copyBtn.click();

        await new Promise(resolve => setTimeout(resolve, 50)); // Increasing the delay
        
        // Checking that the clipboard was called
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://test.com');
        
        // We check that the UI has changed (the button shows 'Copied')
        expect(copyBtn.innerHTML).not.toBe(originalHTML);
        expect(copyBtn.innerHTML).toContain('Copied'); // or another expected text
    });
});