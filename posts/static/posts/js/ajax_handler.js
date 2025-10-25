document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.vote-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const url = this.action;
            const postId = this.querySelector('button').dataset.postId;
            
            // Показываем загрузку
            const submitBtn = this.querySelector('button');
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '⏳';
            submitBtn.disabled = true;
            
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
                // Восстанавливаем кнопку
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
                
                // ОБНОВЛЯЕМ ПО ID - НАДЕЖНЫЙ СПОСОБ
                const voteCount = document.getElementById('vote-count-' + postId);
                if (voteCount) {
                    const strongElement = voteCount.querySelector('strong');
                    if (strongElement) {
                        strongElement.textContent = data.total_votes;
                    } else {
                        voteCount.textContent = data.total_votes;
                    }
                }
                
                // Обновляем стили кнопок
                updateButtonStyles(form, data.user_vote);
            })
            .catch(error => {
                console.error('Error:', error);
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
            });
        });
    });
    
    function updateButtonStyles(form, userVote) {
        const footer = form.closest('.card-footer');
        if (!footer) return;
        
        const upvoteBtn = footer.querySelector('[data-vote-type="upvote"]');
        const downvoteBtn = footer.querySelector('[data-vote-type="downvote"]');
        
        // Сбрасываем стили
        upvoteBtn.className = upvoteBtn.className.replace(/btn-(success|outline-success)/g, '') + ' btn-outline-success';
        downvoteBtn.className = downvoteBtn.className.replace(/btn-(danger|outline-danger)/g, '') + ' btn-outline-danger';
        
        // Активные стили
        if (userVote === 1) {
            upvoteBtn.classList.replace('btn-outline-success', 'btn-success');
        } else if (userVote === -1) {
            downvoteBtn.classList.replace('btn-outline-danger', 'btn-danger');
        }
    }
});