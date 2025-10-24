document.addEventListener('DOMContentLoaded', function() {
    // Обработка лайков через AJAX
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
                
                // Обновляем счетчик голосов
                const voteCount = form.closest('.card-footer').querySelector('.vote-count strong');
                if (voteCount) {
                    voteCount.textContent = data.total_votes;
                }
                
                // Обновляем стили кнопок
                updateVoteButtons(form, data.user_vote);
            })
            .catch(error => {
                console.error('Error:', error);
                // Fallback - отправляем форму обычным способом
                form.submit();
            });
        });
    });
    
    function updateVoteButtons(form, userVote) {
        const footer = form.closest('.card-footer');
        const upvoteBtn = footer.querySelector('[data-vote-type="upvote"]');
        const downvoteBtn = footer.querySelector('[data-vote-type="downvote"]');
        
        // Сбрасываем стили
        upvoteBtn.classList.remove('btn-success', 'btn-outline-success');
        downvoteBtn.classList.remove('btn-danger', 'btn-outline-danger');
        
        // Устанавливаем базовые стили
        upvoteBtn.classList.add('btn-outline-success');
        downvoteBtn.classList.add('btn-outline-danger');
        
        // Устанавливаем активные стили
        if (userVote === 1) {
            upvoteBtn.classList.add('btn-success');
            upvoteBtn.classList.remove('btn-outline-success');
        } else if (userVote === -1) {
            downvoteBtn.classList.add('btn-danger');
            downvoteBtn.classList.remove('btn-outline-danger');
        }
    }
});