// frontend/static/js/voting.js
document.addEventListener('DOMContentLoaded', function() {
    const voteButtons = document.querySelectorAll('.vote-btn');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    
    if (!voteButtons.length || !csrfToken) {
        console.log('No vote buttons or CSRF token found');
        return;
    }
    
    voteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const voteType = this.dataset.voteType;
            const postId = this.closest('[data-post-id]')?.dataset.postId;
            
            console.log('Vote clicked:', { voteType, postId }); // Для отладки
            
            if (!postId) {
                console.error('Post ID not found');
                showNotification('Ошибка: ID поста не найден', 'error');
                return;
            }
            
            // Блокируем кнопку на время запроса
            const originalText = this.innerHTML;
            this.innerHTML = '...';
            this.disabled = true;
            
            // ✅ ИСПРАВЛЕННЫЙ ПУТЬ - убрали лишний posts/
            fetch(`/posts/${postId}/vote/${voteType}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Vote response:', data); // Для отладки
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
        
        console.log('Updating counters:', data); // Для отладки
        
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
        // Упрощенное уведомление
        alert(message); // Временное решение
    }
});