(function() {
    'use strict';
    
    // Защита от множественной инициализации
    if (window.voteHandlerInitialized) {
        console.log('Vote handler already initialized, skipping...');
        return;
    }
    window.voteHandlerInitialized = true;

    document.addEventListener('DOMContentLoaded', function() {
        console.log('Vote handler initialized - CLEAN VERSION');
        
        // Обработчик для всех форм голосования
        document.querySelectorAll('form.vote-form').forEach(form => {
            // Удаляем любые существующие обработчики чтобы избежать дублирования
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            newForm.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopImmediatePropagation(); // Более строгая остановка
                
                console.log('Vote form submitted - AJAX HANDLED');
                
                const formData = new FormData(this);
                const url = this.action;
                const button = this.querySelector('button[data-post-id]');
                const postId = button ? button.dataset.postId : null;
                
                if (!postId) {
                    console.error('No post ID found in form');
                    return;
                }
                
                // Сохраняем позицию прокрутки
                const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
                
                // Показываем индикатор загрузки
                const originalHTML = button.innerHTML;
                button.innerHTML = '⏳';
                button.disabled = true;
                
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': getCSRFToken()
                    },
                    body: formData
                })
                .then(response => {
                    console.log('Response status:', response.status);
                    
                    if (response.status === 401) {
                        return response.json().then(data => {
                            const loginUrl = data.login_url || `/users/login/?next=${encodeURIComponent(window.location.href)}`;
                            console.log('Redirecting to login:', loginUrl);
                            window.location.href = loginUrl;
                            throw new Error('Authentication required');
                        });
                    }
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    return response.json();
                })
                .then(data => {
                    // Восстанавливаем кнопку
                    button.innerHTML = originalHTML;
                    button.disabled = false;
                    
                    if (data.error) {
                        console.error('Server error:', data.error);
                        return;
                    }
                    
                    // Обновляем счетчик голосов
                    updateVoteCount(postId, data.total_votes);
                    
                    // Обновляем стили кнопок
                    updateVoteButtons(postId, data.user_vote);
                    
                    // Восстанавливаем позицию прокрутки
                    window.scrollTo(0, scrollPosition);
                    
                    console.log('Vote successful, count updated:', data.total_votes);
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                    button.innerHTML = originalHTML;
                    button.disabled = false;
                    
                    // Восстанавливаем позицию прокрутки даже при ошибке
                    window.scrollTo(0, scrollPosition);
                    
                    if (!error.message.includes('Authentication required')) {
                        console.log('Error occurred, but preventing page reload');
                    }
                });
                
                return false; // Дополнительная защита
            });
        });
        
        function getCSRFToken() {
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
            return csrfToken ? csrfToken.value : '';
        }
        
        function updateVoteCount(postId, totalVotes) {
            const voteCountElement = document.getElementById(`vote-count-${postId}`);
            if (voteCountElement) {
                const strongElement = voteCountElement.querySelector('strong');
                if (strongElement) {
                    strongElement.textContent = totalVotes;
                } else {
                    voteCountElement.textContent = totalVotes;
                }
            }
        }
        
        function updateVoteButtons(postId, userVote) {
            const upvoteBtn = document.querySelector(`[data-post-id="${postId}"][data-vote-type="upvote"]`);
            const downvoteBtn = document.querySelector(`[data-post-id="${postId}"][data-vote-type="downvote"]`);
            
            if (!upvoteBtn || !downvoteBtn) return;
            
            // Сбрасываем стили
            upvoteBtn.classList.remove('btn-success');
            upvoteBtn.classList.add('btn-outline-success');
            downvoteBtn.classList.remove('btn-danger');
            downvoteBtn.classList.add('btn-outline-danger');
            
            // Устанавливаем активные стили
            if (userVote === 1) {
                upvoteBtn.classList.remove('btn-outline-success');
                upvoteBtn.classList.add('btn-success');
            } else if (userVote === -1) {
                downvoteBtn.classList.remove('btn-outline-danger');
                downvoteBtn.classList.add('btn-danger');
            }
        }
    });
})();