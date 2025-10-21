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
    
    // Обработка удаления комментариев
    const deleteCommentButtons = document.querySelectorAll('.delete-comment-btn');
    deleteCommentButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) {
                e.preventDefault();
            }
        });
    });
});