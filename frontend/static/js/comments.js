// frontend/static/js/comments.js

document.addEventListener('DOMContentLoaded', function() {
    const commentsBtn = document.querySelector('.comments-btn');
    const commentsSection = document.getElementById('comments-section');
    const shareBtn = document.querySelector('.share-btn');
    
    // Обработка кнопки комментариев
    if (commentsBtn && commentsSection) {
        commentsBtn.addEventListener('click', function() {
            commentsSection.classList.toggle('hidden');
            
            // Обновляем текст кнопки
            if (commentsSection.classList.contains('hidden')) {
                const commentCount = document.querySelector('.comments-count');
                commentsBtn.innerHTML = `<i>💬</i> ${commentCount ? commentCount.textContent : '0'} комментариев`;
            } else {
                commentsBtn.innerHTML = '<i>💬</i> Скрыть комментарии';
            }
        });
    }
    
    // Обработка кнопки поделиться
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            if (navigator.share) {
                navigator.share({
                    title: document.querySelector('.post-title').textContent,
                    text: 'Посмотрите на этот пост',
                    url: window.location.href,
                })
                .catch(error => console.log('Ошибка при попытке поделиться:', error));
            } else {
                // Fallback для браузеров без Web Share API
                navigator.clipboard.writeText(window.location.href)
                    .then(() => alert('Ссылка скопирована в буфер обмена!'))
                    .catch(() => alert('Не удалось скопировать ссылку'));
            }
        });
    }
    
    // НОВАЯ ФУНКЦИОНАЛЬНОСТЬ: Обработка модального окна удаления комментариев
    const deleteCommentModal = document.getElementById('deleteCommentModal');
    
    if (deleteCommentModal) {
        deleteCommentModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            if (!button) {
            console.warn('No relatedTarget found in delete comment modal event');
            return;
        }
        
        const commentId = button.getAttribute('data-comment-id');
        const deleteUrl = button.getAttribute('data-comment-url');
        
        // Update the form action
        const form = document.getElementById('deleteCommentForm');
        if (form) {
            form.action = deleteUrl;
            }
        });
    }

    // НОВАЯ ФУНКЦИОНАЛЬНОСТЬ: Улучшенный плавный скролл к якорям комментариев
    const smoothScrollToAnchor = function() {
        const hash = window.location.hash;
        if (hash) {
            // Ждем немного чтобы DOM полностью загрузился
            setTimeout(() => {
                const targetId = hash.replace('#', '');
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Рассчитываем позицию с учетом фиксированного хедера (если есть)
                    const headerHeight = document.querySelector('header') ? document.querySelector('header').offsetHeight : 0;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20; // 20px дополнительный отступ

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Добавляем визуальный эффект для привлечения внимания
                    targetElement.style.transition = 'all 0.3s ease';
                    targetElement.style.backgroundColor = 'rgba(255, 245, 0, 0.2)';
                    targetElement.style.borderRadius = '4px';
                    
                    setTimeout(() => {
                        targetElement.style.backgroundColor = '';
                    }, 2000);

                    // Фокус на textarea если это форма комментария
                    if (hash === '#write_comment') {
                        const textarea = targetElement.querySelector('textarea');
                        if (textarea) {
                            setTimeout(() => {
                                textarea.focus();
                            }, 500);
                        }
                    }
                }
            }, 100);
        }
    };

    // Обработка всех якорных ссылок на странице
    const initAnchorLinks = function() {
        const anchorLinks = document.querySelectorAll('a[href*="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Проверяем, что это якорная ссылка на этой же странице
                if (href.includes('#') && (href.startsWith('#') || href.startsWith(window.location.pathname + '#'))) {
                    e.preventDefault();
                    
                    let targetId;
                    if (href.startsWith('#')) {
                        targetId = href.substring(1);
                    } else {
                        targetId = href.split('#')[1];
                    }
                    
                    // Обновляем URL без перезагрузки страницы
                    history.pushState(null, null, `#${targetId}`);
                    
                    // Выполняем плавный скролл
                    scrollToElement(targetId);
                }
            });
        });
    };

    // Функция для скролла к конкретному элементу
    const scrollToElement = function(elementId) {
        const targetElement = document.getElementById(elementId);
        if (!targetElement) return;

        const headerHeight = document.querySelector('header') ? document.querySelector('header').offsetHeight : 0;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        // Визуальное выделение элемента
        targetElement.style.transition = 'all 0.3s ease';
        targetElement.style.backgroundColor = 'rgba(255, 245, 0, 0.2)';
        targetElement.style.borderRadius = '4px';
        
        setTimeout(() => {
            targetElement.style.backgroundColor = '';
        }, 2000);

        // Фокус на textarea для формы комментария
        if (elementId === 'write_comment') {
            const textarea = targetElement.querySelector('textarea');
            if (textarea) {
                setTimeout(() => {
                    textarea.focus();
                }, 500);
            }
        }
    };

    // Инициализация при загрузке страницы
    smoothScrollToAnchor();
    initAnchorLinks();

    // Обработка навигации браузера (назад/вперед)
    window.addEventListener('hashchange', smoothScrollToAnchor);

    // СТАРАЯ ФУНКЦИОНАЛЬНОСТЬ: Удаляем обработку confirm для удаления комментариев
    // так как теперь используем модальное окно Bootstrap
    /*
    const deleteCommentButtons = document.querySelectorAll('.delete-comment-btn');
    deleteCommentButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) {
                e.preventDefault();
            }
        });
    });
    */
});