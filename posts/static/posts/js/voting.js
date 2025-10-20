// posts/static/posts/js/voting.js

document.addEventListener('DOMContentLoaded', function() {
    const voteButtons = document.querySelectorAll('.vote-btn');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    
    if (!voteButtons.length || !csrfToken) {
        return; // Если нет кнопок голосования или CSRF токена, выходим
    }
    
    voteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const voteType = this.dataset.voteType;
            const postId = this.closest('[data-post-id]')?.dataset.postId || 
                          document.querySelector('[data-post-id]')?.dataset.postId;
            
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
                    // Обновляем счетчики на странице
                    updateVoteCounters(data);
                    
                    // Визуальная обратная связь
                    updateButtonStyles(this, voteType);
                    
                    // Показываем уведомление
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
                // Восстанавливаем кнопку
                this.innerHTML = originalText;
                this.disabled = false;
            });
        });
    });
    
    function updateVoteCounters(data) {
        const scoreElement = document.getElementById('post-score');
        const upvotesElement = document.getElementById('upvotes-count');
        const downvotesElement = document.getElementById('downvotes-count');
        
        if (scoreElement) scoreElement.textContent = data.score;
        if (upvotesElement) upvotesElement.textContent = data.upvotes;
        if (downvotesElement) downvotesElement.textContent = data.downvotes;
        
        // Также обновляем счетчики в списке постов если они есть
        const listScoreElements = document.querySelectorAll('.post-score');
        const listUpvotesElements = document.querySelectorAll('.post-upvotes');
        const listDownvotesElements = document.querySelectorAll('.post-downvotes');
        
        listScoreElements.forEach(el => el.textContent = data.score);
        listUpvotesElements.forEach(el => el.textContent = data.upvotes);
        listDownvotesElements.forEach(el => el.textContent = data.downvotes);
    }
    
    function updateButtonStyles(clickedButton, voteType) {
        const allButtons = document.querySelectorAll('.vote-btn');
        
        // Сбрасываем стили всех кнопок
        allButtons.forEach(btn => {
            btn.classList.remove('btn-success', 'btn-danger', 'btn-primary');
            btn.classList.add('btn-outline-success', 'btn-outline-danger', 'btn-outline-secondary');
        });
        
        // Применяем стиль к активной кнопке
        if (voteType === 'upvote') {
            clickedButton.classList.remove('btn-outline-success');
            clickedButton.classList.add('btn-success');
        } else if (voteType === 'downvote') {
            clickedButton.classList.remove('btn-outline-danger');
            clickedButton.classList.add('btn-danger');
        } else if (voteType === 'remove') {
            clickedButton.classList.remove('btn-outline-secondary');
            clickedButton.classList.add('btn-primary');
        }
    }
    
    function showNotification(message, type = 'info') {
        // Создаем уведомление Bootstrap
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
        
        // Автоматически удаляем через 3 секунды
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 3000);
    }
});