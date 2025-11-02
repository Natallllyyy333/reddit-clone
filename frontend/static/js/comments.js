// frontend/static/js/comments.js

document.addEventListener('DOMContentLoaded', function() {
    const commentsBtn = document.querySelector('.comments-btn');
    const commentsSection = document.getElementById('comments-section');
    const shareBtn = document.querySelector('.share-btn');
    
    // Processing the comment button
    if (commentsBtn && commentsSection) {
        commentsBtn.addEventListener('click', function() {
            commentsSection.classList.toggle('hidden');
            
            // Updating the button text
            if (commentsSection.classList.contains('hidden')) {
                const commentCount = document.querySelector('.comments-count');
                commentsBtn.innerHTML = `<i>💬</i> ${commentCount ? commentCount.textContent : '0'} comments`;
            } else {
                commentsBtn.innerHTML = '<i>💬</i> Hide comments';
            }
        });
    }
    
    // Share button handling
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            if (navigator.share) {
                navigator.share({
                    title: document.querySelector('.post-title').textContent,
                    text: 'Take a look at this post',
                    url: window.location.href,
                })
                .catch(error => console.log('Error while trying to share:', error));
            } else {
                // Fallback for browsers without Web Share API
                navigator.clipboard.writeText(window.location.href)
                    .then(() => alert('Link copied to clipboard!'))
                    .catch(() => alert('Failed to copy the link'));
            }
        });
    }
    
    // Processing the comment deletion modal
    const deleteCommentModal = document.getElementById('deleteCommentModal');
    
    if (deleteCommentModal) {
        deleteCommentModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            if (!button) {
            console.warn('No relatedTarget found in delete comment modal event');
            return;
        }
        
        const commentId = button.getAttribute('data-comment-id');
        const deleteUrl = button.getAttribute('data-comment-url');
        
        // Update the form action
        const form = document.getElementById('deleteCommentForm');
        if (form) {
            form.action = deleteUrl;
            }
        });
    }

    //  Enhanced smooth scrolling to comment anchors
    const smoothScrollToAnchor = function() {
        const hash = window.location.hash;
        if (hash) {
            // Wait a bit for the DOM to fully load
            setTimeout(() => {
                const targetId = hash.replace('#', '');
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    //We calculate the position taking into account the fixed header (if any)
                    const headerHeight = document.querySelector('header') ? document.querySelector('header').offsetHeight : 0;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20; // 20px additional indent

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Adding a visual effect to attract attention
                    targetElement.style.transition = 'all 0.3s ease';
                    targetElement.style.backgroundColor = 'rgba(255, 245, 0, 0.2)';
                    targetElement.style.borderRadius = '4px';
                    
                    setTimeout(() => {
                        targetElement.style.backgroundColor = '';
                    }, 2000);

                    // Focus on the textarea if this is a comment form
                    if (hash === '#write_comment') {
                        const textarea = targetElement.querySelector('textarea');
                        if (textarea) {
                            setTimeout(() => {
                                textarea.focus();
                            }, 500);
                        }
                    }
                }
            }, 100);
        }
    };

    // Processing all anchor links on the page
    const initAnchorLinks = function() {
        const anchorLinks = document.querySelectorAll('a[href*="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // We check that this is an anchor link on the same page
                if (href.includes('#') && (href.startsWith('#') || href.startsWith(window.location.pathname + '#'))) {
                    e.preventDefault();
                    
                    let targetId;
                    if (href.startsWith('#')) {
                        targetId = href.substring(1);
                    } else {
                        targetId = href.split('#')[1];
                    }
                    
                    // Updating the URL without reloading the page
                    history.pushState(null, null, `#${targetId}`);
                    
                    // Performing smooth scrolling
                    scrollToElement(targetId);
                }
            });
        });
    };

    // Function to scroll to a specific element
    const scrollToElement = function(elementId) {
        const targetElement = document.getElementById(elementId);
        if (!targetElement) return;

        const headerHeight = document.querySelector('header') ? document.querySelector('header').offsetHeight : 0;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        // Visual highlighting of an element
        targetElement.style.transition = 'all 0.3s ease';
        targetElement.style.backgroundColor = 'rgba(255, 245, 0, 0.2)';
        targetElement.style.borderRadius = '4px';
        
        setTimeout(() => {
            targetElement.style.backgroundColor = '';
        }, 2000);

        // Focus on the textarea for the comment form
        if (elementId === 'write_comment') {
            const textarea = targetElement.querySelector('textarea');
            if (textarea) {
                setTimeout(() => {
                    textarea.focus();
                }, 500);
            }
        }
    };

    // Initialization on page load
    smoothScrollToAnchor();
    initAnchorLinks();

    // Handling browser navigation (back/forward)
    window.addEventListener('hashchange', smoothScrollToAnchor);

});