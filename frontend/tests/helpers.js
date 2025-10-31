// frontend/tests/helpers.js
export const createFullDOM = () => {
    document.body.innerHTML = `
        <header style="height: 60px;"></header>
        <button class="share-btn" data-post-id="123">Share</button>
        <button class="comments-btn">Comments</button>
        <div class="card">
            <h2 class="post-title">Test Post Title</h2>
            <span class="comments-count">5</span>
        </div>
        <div id="shareModal">
            <input id="shareUrl" type="text" value="http://localhost:8000/posts/123/">
            <button id="copyShareUrlBtn">Copy</button>
            <a id="twitterShare"></a>
            <a id="facebookShare"></a>
            <a id="linkedinShare"></a>
            <a id="telegramShare"></a>
        </div>
        <div id="comments-section" class="hidden">
            <a href="#write_comment">Write comment</a>
            <div id="write_comment">
                <textarea></textarea>
            </div>
            <div id="deleteCommentModal">
                <form id="deleteCommentForm"></form>
            </div>
        </div>
        <input name="csrfmiddlewaretoken" value="test-csrf-token">
        <form class="vote-form">
            <button class="vote-btn" data-post-id="1" data-vote-type="upvote">Upvote</button>
        </form>
    `;
};