document.addEventListener('DOMContentLoaded', function() {
    const voteForms = document.querySelectorAll('form[action*="vote"]');
    
    voteForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const url = this.action;
            const postId = this.querySelector('.vote-btn').dataset.postId;
            
            fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                }
            })
            .then(response => response.json())
            .then(data => {
                // Updating the vote counter
                const voteCount = document.querySelector(`[data-post-id="${postId}"]`).closest('.vote-buttons').querySelector('.vote-count strong');
                voteCount.textContent = data.total_votes;
                
                // Updating button styles
                updateButtonStyles(postId, data.user_vote);
            })
            .catch(error => console.error('Error:', error));
        });
    });
    
    function updateButtonStyles(postId, userVote) {
        const voteButtons = document.querySelectorAll(`[data-post-id="${postId}"]`);
        
        voteButtons.forEach(button => {
            button.classList.remove('active', 'btn-success', 'btn-danger');
            button.classList.add('btn-outline-success', 'btn-outline-danger');
        });
        
        if (userVote === 1) {
            const upvoteBtn = document.querySelector(`[data-post-id="${postId}"][data-vote-type="upvote"]`);
            upvoteBtn.classList.remove('btn-outline-success');
            upvoteBtn.classList.add('btn-success', 'active');
        } else if (userVote === -1) {
            const downvoteBtn = document.querySelector(`[data-post-id="${postId}"][data-vote-type="downvote"]`);
            downvoteBtn.classList.remove('btn-outline-danger');
            downvoteBtn.classList.add('btn-danger', 'active');
        }
    }
});