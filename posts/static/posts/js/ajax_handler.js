// ========== НАЧАЛО ИСПРАВЛЕННОГО КОДА ==========
(function() {
    if (window.voteHandlerInitialized) {
        console.log('Vote handler already initialized, skipping...');
        return;
    }
    window.voteHandlerInitialized = true;

    console.log('🔧 AJAX Handler: Starting initialization');

    document.addEventListener('DOMContentLoaded', function() {
        console.log('🔧 AJAX Handler: DOM loaded, setting up handlers');
        
        // ========== ИСПРАВЛЕНИЕ ДВОЙНОГО СРАБАТЫВАНИЯ ==========
        // Удаляем все существующие обработчики перед добавлением новых
        const voteForms = document.querySelectorAll('form.vote-form');
        voteForms.forEach(form => {
            // Создаем новую копию формы чтобы сбросить обработчики
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
        });

        // ========== ИНИЦИАЛИЗАЦИЯ АВТОМАТИЧЕСКОГО СКРЫТИЯ УВЕДОМЛЕНИЙ ==========
        function initializeAlertAutoDismiss() {
            console.log('🔔 Alert Auto-Dismiss: Initializing...');
            
            if (typeof bootstrap === 'undefined') {
                console.log('🔔 Alert Auto-Dismiss: Bootstrap not loaded, retrying...');
                setTimeout(initializeAlertAutoDismiss, 100);
                return;
            }
            
            const systemAlerts = document.querySelectorAll('.alert-dismissible:not(.position-fixed)');
            console.log(`🔔 Alert Auto-Dismiss: Found ${systemAlerts.length} alerts`);
            
            systemAlerts.forEach((alert, index) => {
                setTimeout(() => {
                    if (alert.parentNode) {
                        try {
                            const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
                            bsAlert.close();
                        } catch (e) {
                            alert.style.transition = 'opacity 0.5s ease';
                            alert.style.opacity = '0';
                            setTimeout(() => {
                                if (alert.parentNode) {
                                    alert.parentNode.removeChild(alert);
                                }
                            }, 500);
                        }
                    }
                }, 5000);
            });
        }
        initializeAlertAutoDismiss();

        // ========== ОБРАБОТЧИКИ ГОЛОСОВАНИЯ С ЗАЩИТОЙ ОТ ДВОЙНОГО СРАБАТЫВАНИЯ ==========
        const refreshedForms = document.querySelectorAll('form.vote-form');
        console.log(`🔧 Vote Handler: Found ${refreshedForms.length} vote forms`);
        
        refreshedForms.forEach((form, index) => {
            if (form.hasAttribute('data-vote-handler')) {
                console.log(`🔧 Vote Handler: Form ${index} already has handler, skipping`);
                return;
            }
            form.setAttribute('data-vote-handler', 'true');
            
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation(); // Дополнительная защита
                
                console.log('🔧 Vote Handler: Form submission intercepted');
                
                // Блокируем повторные отправки
                if (this.hasAttribute('data-processing')) {
                    console.log('🔧 Vote Handler: Request already in progress, skipping');
                    return;
                }
                this.setAttribute('data-processing', 'true');
                
                const formData = new FormData(this);
                const url = this.action;
                const button = this.querySelector('button[data-post-id]');
                const postId = button ? button.dataset.postId : null;
                
                if (!postId) {
                    console.error('❌ Vote Handler: No post ID found in form');
                    this.removeAttribute('data-processing');
                    return;
                }
                
                // Сохраняем позицию прокрутки
                const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
                
                // Индикатор загрузки
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
                    console.log(`🔧 Vote Handler: Response status: ${response.status}`);
                    
                    if (response.status === 401) {
                        return response.json().then(data => {
                            const loginUrl = data.login_url || `/users/login/?next=${encodeURIComponent(window.location.href)}`;
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
                    console.log('🔧 Vote Handler: Received data:', data);
                    
                    // Восстанавливаем кнопку
                    button.innerHTML = originalHTML;
                    button.disabled = false;
                    this.removeAttribute('data-processing');
                    
                    if (data.error) {
                        console.error('❌ Vote Handler: Server error:', data.error);
                        showTempMessage('Error: ' + data.error, 'danger');
                        return;
                    }
                    
                    // Обновляем UI
                    updateVoteCount(postId, data.total_votes);
                    updateVoteButtons(postId, data.user_vote);
                    
                    console.log(`🔧 Vote Handler: Vote successful! Total: ${data.total_votes}, User vote: ${data.user_vote}`);
                    
                    // Восстанавливаем позицию прокрутки
                    window.scrollTo(0, scrollPosition);
                    
                    if (data.message) {
                        showTempMessage(data.message, 'success');
                    }
                })
                .catch(error => {
                    console.error('❌ Vote Handler: Fetch error:', error);
                    button.innerHTML = originalHTML;
                    button.disabled = false;
                    this.removeAttribute('data-processing');
                    
                    // Восстанавливаем позицию прокрутки при ошибке
                    window.scrollTo(0, scrollPosition);
                    
                    if (!error.message.includes('Authentication required')) {
                        showTempMessage('Error processing vote. Please try again.', 'danger');
                    }
                });
            });
        });
        
        function getCSRFToken() {
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
            return csrfToken ? csrfToken.value : '';
        }
        
        function updateVoteCount(postId, totalVotes) {
            console.log(`🔧 Update Vote Count: Post ${postId}, Total: ${totalVotes}`);
            
            const voteCountElement = document.getElementById(`vote-count-${postId}`);
            if (voteCountElement) {
                const strongElement = voteCountElement.querySelector('strong');
                if (strongElement) {
                    strongElement.textContent = totalVotes;
                } else {
                    voteCountElement.textContent = totalVotes;
                }
            } else {
                console.error(`❌ Update Vote Count: Element #vote-count-${postId} not found`);
            }
        }
        
        function updateVoteButtons(postId, userVote) {
            console.log(`🔧 Update Vote Buttons: Post ${postId}, User vote: ${userVote}`);
            
            const upvoteBtn = document.querySelector(`[data-post-id="${postId}"][data-vote-type="upvote"]`);
            const downvoteBtn = document.querySelector(`[data-post-id="${postId}"][data-vote-type="downvote"]`);
            
            if (!upvoteBtn || !downvoteBtn) {
                console.error(`❌ Update Vote Buttons: Buttons not found for post ${postId}`);
                return;
            }
            
            // Сбрасываем стили
            upvoteBtn.classList.remove('btn-success', 'btn-outline-success');
            downvoteBtn.classList.remove('btn-danger', 'btn-outline-danger');
            
            // Базовые стили
            upvoteBtn.classList.add('btn-outline-success');
            downvoteBtn.classList.add('btn-outline-danger');
            
            // Активные стили
            if (userVote === 1) {
                upvoteBtn.classList.remove('btn-outline-success');
                upvoteBtn.classList.add('btn-success');
            } else if (userVote === -1) {
                downvoteBtn.classList.remove('btn-outline-danger');
                downvoteBtn.classList.add('btn-danger');
            }
        }
        
        function showTempMessage(message, type) {
            console.log(`🔧 Temp Message: ${message} (${type})`);
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
            alertDiv.style.cssText = `
                position: fixed !important;
                top: 20px !important;
                right: 20px !important;
                z-index: 9999 !important;
                min-width: 300px;
                max-width: 500px;
            `;
            alertDiv.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <span>${message}</span>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
            
            document.body.appendChild(alertDiv);
            
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    try {
                        const bsAlert = bootstrap.Alert.getOrCreateInstance(alertDiv);
                        bsAlert.close();
                    } catch (e) {
                        alertDiv.remove();
                    }
                }
            }, 3000);
        }
    });
})();
// ========== КОНЕЦ ИСПРАВЛЕННОГО КОДА ==========