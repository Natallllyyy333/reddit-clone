// frontend/static/js/share.js

// Функция для открытия модального окна с данными поста
function openShareModal(postId, postTitle) {
    const shareUrl = `${window.location.origin}/posts/${postId}/`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(postTitle || 'Check this post');
    
    // Устанавливаем URL для копирования
    document.getElementById('shareUrl').value = shareUrl;
    
    // Устанавливаем ссылки для социальных сетей
    document.getElementById('twitterShare').href = 
        `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
    document.getElementById('facebookShare').href = 
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    document.getElementById('linkedinShare').href = 
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    document.getElementById('telegramShare').href = 
        `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
    
    // Показываем модальное окно
    const shareModal = new bootstrap.Modal(document.getElementById('shareModal'));
    shareModal.show();
}

// Функция для копирования URL
function copyShareUrl() {
    const shareUrl = document.getElementById('shareUrl');
    shareUrl.select();
    shareUrl.setSelectionRange(0, 99999); // Для мобильных устройств
    
    try {
        // Современный способ копирования
        navigator.clipboard.writeText(shareUrl.value).then(() => {
            showCopyFeedback();
        });
    } catch (err) {
        // Старый способ для совместимости
        document.execCommand('copy');
        showCopyFeedback();
    }
}

// Показать feedback при копировании
function showCopyFeedback() {
    const copyBtn = document.getElementById('copyShareUrlBtn');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    copyBtn.classList.remove('btn-outline-secondary');
    copyBtn.classList.add('btn-success');
    
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.classList.remove('btn-success');
        copyBtn.classList.add('btn-outline-secondary');
    }, 2000);
}

// Инициализация кнопок шаринга после загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация кнопок шаринга
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');


           // Улучшенный поиск заголовка поста для разных структур
            let postTitle = '';
            const card = this.closest('.card');
            if (card) {
                const titleElement = card.querySelector('.card-title a') || 
                                   card.querySelector('.post-title') ||
                                   card.querySelector('h5') ||
                                   card.querySelector('h1');
                postTitle = titleElement ? titleElement.textContent.trim() : '';
            }
            
            openShareModal(postId, postTitle);
        });
    });
    
    // Инициализация кнопки копирования
    const copyBtn = document.getElementById('copyShareUrlBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyShareUrl);
    }
    
    // Закрытие модального окна при клике вне его
    const shareModal = document.getElementById('shareModal');
    if (shareModal) {
        shareModal.addEventListener('click', function(event) {
            if (event.target === this) {
                const modal = bootstrap.Modal.getInstance(this);
                modal.hide();
            }
        });
    }
});