// frontend/static/js/voting.js
document.addEventListener('DOMContentLoaded', function() {
    const voteButtons = document.querySelectorAll('.vote-btn');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    
    console.log('Voting script loaded');
    console.log('Found vote buttons:', voteButtons.length);
    console.log('CSRF token:', csrfToken ? 'Present' : 'Missing');
    
    if (!voteButtons.length || !csrfToken) {
        console.error('No vote buttons or CSRF token found');
        return;
    }
    
    voteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const voteType = this.dataset.voteType;
            const postElement = this.closest('[data-post-id]');
            const postId = postElement ? postElement.dataset.postId : null;
            
            console.log('Vote clicked:', { 
                voteType: voteType, 
                postId: postId,
                element: this 
            });
            
            if (!postId) {
                console.error('Post ID not found. Check data-post-id attribute');
                showNotification('Ошибка: ID поста не найден', 'error');
                return;
            }
            
            // Блокируем кнопку на время запроса
            const originalText = this.innerHTML;
            this.innerHTML = '...';
            this.disabled = true;
            
            // Отправляем запрос
            fetch(`/posts/${postId}/vote/${voteType}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Vote response data:', data);
                if (data.success) {
                    updateVoteCounters(data, postId);
                    updateButtonStyles(this, voteType);
                    showNotification('Голос учтен!', 'success');
                } else {
                    showNotification('Ошибка: ' + data.error, 'error');
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
                showNotification('Произошла ошибка при голосовании: ' + error.message, 'error');
            })
            .finally(() => {
                this.innerHTML = originalText;
                this.disabled = false;
            });
        });
    });
    
    function updateVoteCounters(data, postId) {
        console.log('Updating counters for post:', postId, 'with data:', data);
        
        // Обновляем счетчики на детальной странице
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
        
        // Обновляем счетчики в списке постов
        const listScoreElement = document.getElementById(`post-score-${postId}`);
        if (listScoreElement) {
            listScoreElement.textContent = data.score;
            listScoreElement.classList.remove('positive', 'negative');
            if (data.score > 0) {
                listScoreElement.classList.add('positive');
            } else if (data.score < 0) {
                listScoreElement.classList.add('negative');
            }
        }
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
        // Временное решение - используем alert для отладки
        alert(`${type.toUpperCase()}: ${message}`);
    }
});