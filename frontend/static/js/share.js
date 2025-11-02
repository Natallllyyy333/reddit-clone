// Function to open a modal window with post data
function openShareModal(postId, postTitle) {
    const shareUrl = `${window.location.origin}/posts/${postId}/`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(postTitle || 'Check this post');
    
    // Setting the URL for copying
    document.getElementById('shareUrl').value = shareUrl;
    
    // Setting up links for social networks
    document.getElementById('twitterShare').href = 
        `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
    document.getElementById('facebookShare').href = 
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    document.getElementById('linkedinShare').href = 
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    document.getElementById('telegramShare').href = 
        `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
    
    // Showing a modal window
    const shareModal = new bootstrap.Modal(document.getElementById('shareModal'));
    shareModal.show();
}

// Function to copy URL
function copyShareUrl() {
    const shareUrl = document.getElementById('shareUrl');
    shareUrl.select();
    shareUrl.setSelectionRange(0, 99999); // Для мобильных устройств
    
    try {
        // Modern way of copying
        navigator.clipboard.writeText(shareUrl.value).then(() => {
            showCopyFeedback();
        });
    } catch (err) {
        // Old method for compatibility
        document.execCommand('copy');
        showCopyFeedback();
    }
}

// Show feedback when copying
function showCopyFeedback() {
    const copyBtn = document.getElementById('copyShareUrlBtn');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    copyBtn.classList.remove('btn-outline-secondary');
    copyBtn.classList.add('btn-success');
    
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.classList.remove('btn-success');
        copyBtn.classList.add('btn-outline-secondary');
    }, 2000);
}

// Initializing sharing buttons after the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initializing sharing buttons
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');


           // Improved post title search for different structures
            let postTitle = '';
            const card = this.closest('.card');
            if (card) {
                const titleElement = card.querySelector('.card-title a') || 
                                   card.querySelector('.post-title') ||
                                   card.querySelector('h5') ||
                                   card.querySelector('h1');
                postTitle = titleElement ? titleElement.textContent.trim() : '';
            }
            
            openShareModal(postId, postTitle);
        });
    });
    
    // Initializing the copy button
    const copyBtn = document.getElementById('copyShareUrlBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyShareUrl);
    }
    
    // Closing the modal window when clicking outside of it
    const shareModal = document.getElementById('shareModal');
    if (shareModal) {
        shareModal.addEventListener('click', function(event) {
            if (event.target === this) {
                const modal = bootstrap.Modal.getInstance(this);
                modal.hide();
            }
        });
    }
});

