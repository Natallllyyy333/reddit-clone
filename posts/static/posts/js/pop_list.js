class PostList {
    constructor() {
        this.init();
    }

    init() {
        this.setupVoteButtons();
        this.setupPostInteractions();
    }

    setupVoteButtons() {
        const voteForms = document.querySelectorAll('form[action*="vote"]');
        
        voteForms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(form);
                const url = form.action;
                
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-CSRFToken': formData.get('csrfmiddlewaretoken')
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        this.updateVoteDisplay(form, data);
                    } else {
                        console.error('Error voting:', response.status);
                        // Fallback to form submission
                        form.submit();
                    }
                } catch (error) {
                    console.error('Error:', error);
                    // Fallback to form submission
                    form.submit();
                }
            });
        });
    }

    updateVoteDisplay(form, data) {
        const postId = form.querySelector('.vote-btn').dataset.postId;
        const voteCount = form.closest('.vote-buttons').querySelector('.vote-count strong');
        
        if (voteCount) {
            voteCount.textContent = data.total_votes;
        }
        
        // Обновляем стили кнопок
        this.updateButtonStyles(postId, data.user_vote);
    }

    updateButtonStyles(postId, userVote) {
        const upvoteBtn = document.querySelector(`[data-post-id="${postId}"][data-vote-type="upvote"]`);
        const downvoteBtn = document.querySelector(`[data-post-id="${postId}"][data-vote-type="downvote"]`);
        
        if (upvoteBtn && downvoteBtn) {
            // Сбрасываем стили
            upvoteBtn.classList.remove('btn-success', 'active');
            upvoteBtn.classList.add('btn-outline-success');
            
            downvoteBtn.classList.remove('btn-danger', 'active');
            downvoteBtn.classList.add('btn-outline-danger');
            
            // Применяем новые стили
            if (userVote === 1) {
                upvoteBtn.classList.remove('btn-outline-success');
                upvoteBtn.classList.add('btn-success', 'active');
            } else if (userVote === -1) {
                downvoteBtn.classList.remove('btn-outline-danger');
                downvoteBtn.classList.add('btn-danger', 'active');
            }
        }
    }

    setupPostInteractions() {
        // Добавляем дополнительные взаимодействия если нужно
        console.log('Post list initialized');
    }
}

// Инициализация при загрузке документа
document.addEventListener('DOMContentLoaded', function() {
    new PostList();
});