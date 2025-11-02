describe('DOM Integrity Check', () => {
    test('DOM elements persist after script loading', () => {
        // Full DOM structure
        document.body.innerHTML = `
            <button class="share-btn" data-post-id="123">Share</button>
            <button class="comments-btn">Comments</button>
            <div id="shareModal">
                <input id="shareUrl" type="text">
                <button id="copyShareUrlBtn">Copy</button>
                <a id="twitterShare"></a>
                <a id="facebookShare"></a>
                <a id="linkedinShare"></a>
                <a id="telegramShare"></a>
            </div>
            <div id="comments-section">
                <a href="#write_comment">Write comment</a>
                <div id="write_comment">
                    <textarea></textarea>
                </div>
                <div id="deleteCommentModal">
                    <form id="deleteCommentForm"></form>
                </div>
            </div>
            <input name="csrfmiddlewaretoken" value="test-csrf">
        `;

       
        require('../../static/js/share.js');      
        require('../../static/js/comments.js');   

        document.dispatchEvent(new Event('DOMContentLoaded'));

        expect(document.querySelector('.share-btn')).toBeTruthy();
        expect(document.querySelector('.comments-btn')).toBeTruthy();
    });
});