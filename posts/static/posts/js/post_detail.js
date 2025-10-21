class PostDetail {
    constructor() {
        this.init();
    }

    init() {
        this.setupVoteButtons();
        this.setupCommentForm();
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
                        this.updateVoteDisplay(data);
                    } else {
                        console.error('Error voting:', response.status);
                        form.submit();
                    }
                } catch (error) {
                    console.error('Error:', error);
                    form.submit();
                }
            });
        });
    }

    updateVoteDisplay(data) {
        // Обновляем счетчик голосов
        const voteCountElements = document.querySelectorAll('.vote-count strong');
        voteCountElements.forEach(element => {
            element.textContent = data.total_votes;
        });

        // Обновляем статистику
        const statsElement = document.querySelector('.post-stats .stat-item:first-child strong');
        if (statsElement) {
            statsElement.textContent = data.total_votes;
        }

        // Обновляем стили кнопок
        this.updateButtonStyles(data.user_vote);
    }

    updateButtonStyles(userVote) {
        const upvoteBtn = document.querySelector('[data-vote-type="upvote"]');
        const downvoteBtn = document.querySelector('[data-vote-type="downvote"]');
        
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

    setupCommentForm() {
        const commentForm = document.querySelector('.comment-form');
        if (commentForm) {
            commentForm.addEventListener('submit', function(e) {
                const textarea = this.querySelector('textarea');
                if (textarea.value.trim().length === 0) {
                    e.preventDefault();
                    alert('Пожалуйста, введите текст комментария');
                    textarea.focus();
                }
            });
        }
    }
}

// Инициализация при загрузке документа
document.addEventListener('DOMContentLoaded', function() {
    new PostDetail();
});