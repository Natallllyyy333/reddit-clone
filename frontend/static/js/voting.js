// frontend/static/js/voting.js

document.addEventListener('DOMContentLoaded', function() {
    const voteButtons = document.querySelectorAll('.vote-btn');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    
    if (!voteButtons.length || !csrfToken) {
        return;
    }
    
    voteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const voteType = this.dataset.voteType;
            const postId = this.closest('[data-post-id]')?.dataset.postId;
            
            if (!postId) {
                console.error('Post ID not found');
                return;
            }
            
            // Блокируем кнопку на время запроса
            const originalText = this.innerHTML;
            this.innerHTML = '...';
            this.disabled = true;
            
            fetch(`/posts/${postId}/vote/${voteType}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    updateVoteCounters(data);
                    updateButtonStyles(this, voteType);
                    showNotification('Голос учтен!', 'success');
                } else {
                    showNotification('Ошибка: ' + data.error, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Произошла ошибка при голосовании', 'error');
            })
            .finally(() => {
                this.innerHTML = originalText;
                this.disabled = false;
            });
        });
    });
    
    function updateVoteCounters(data) {
        const scoreElement = document.getElementById('post-score');
        const upvotesElement = document.getElementById('upvotes-count');
        const downvotesElement = document.getElementById('downvotes-count');
        
        if (scoreElement) {
            scoreElement.textContent = data.score;
            scoreElement.classList.remove('positive', 'negative');
            if (data.score > 0) {
                scoreElement.classList.add('positive');
            } else if (data.score < 0) {
                scoreElement.classList.add('negative');
            }
        }
        if (upvotesElement) upvotesElement.textContent = data.upvotes;
        if (downvotesElement) downvotesElement.textContent = data.downvotes;
    }
    
    function updateButtonStyles(clickedButton, voteType) {
        const allButtons = document.querySelectorAll('.vote-btn');
        
        // Сбрасываем стили всех кнопок
        allButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Применяем стиль к активной кнопке
        if (voteType === 'upvote' || voteType === 'downvote') {
            clickedButton.classList.add('active');
        }
    }
    
    function showNotification(message, type = 'info') {
        const alertClass = type === 'error' ? 'alert-danger' : 
                          type === 'success' ? 'alert-success' : 'alert-info';
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 3000);
    }
});