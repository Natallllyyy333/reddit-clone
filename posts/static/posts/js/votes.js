document.addEventListener('DOMContentLoaded', function() {
    // Processing likes through AJAX
    document.querySelectorAll('.vote-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const form = this;
            const url = form.action;
            const formData = new FormData(form);
            
            fetch(url, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': formData.get('csrfmiddlewaretoken')
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Error:', data.error);
                    return;
                }
                
                // Updating the vote counter
                const voteCount = form.closest('.card-footer').querySelector('.vote-count strong');
                if (voteCount) {
                    voteCount.textContent = data.total_votes;
                }
                
                // Updating button styles
                updateVoteButtons(form, data.user_vote);
            })
            .catch(error => {
                console.error('Error:', error);
                // Fallback - We send the form in the usual way
                form.submit();
            });
        });
    });
    
    function updateVoteButtons(form, userVote) {
        const footer = form.closest('.card-footer');
        const upvoteBtn = footer.querySelector('[data-vote-type="upvote"]');
        const downvoteBtn = footer.querySelector('[data-vote-type="downvote"]');
        
        // Reset styles
        upvoteBtn.classList.remove('btn-success', 'btn-outline-success');
        downvoteBtn.classList.remove('btn-danger', 'btn-outline-danger');
        
        // Setting up basic styles
        upvoteBtn.classList.add('btn-outline-success');
        downvoteBtn.classList.add('btn-outline-danger');
        
        // Setting active styles
        if (userVote === 1) {
            upvoteBtn.classList.add('btn-success');
            upvoteBtn.classList.remove('btn-outline-success');
        } else if (userVote === -1) {
            downvoteBtn.classList.add('btn-danger');
            downvoteBtn.classList.remove('btn-outline-danger');
        }
    }
});