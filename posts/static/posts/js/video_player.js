// Функция для переключения между превью и видео
function toggleVideoPlayback(previewElement) {
    const container = previewElement.closest('.video-container');
    const videoPreview = container.querySelector('.video-preview');
    const videoPlayer = container.querySelector('.video-player');
    const playButton = container.querySelector('.video-play-button');
    
    if (videoPlayer.classList.contains('d-none')) {
        // Показываем видео-плеер и начинаем воспроизведение
        videoPreview.classList.add('d-none');
        playButton.classList.add('d-none');
        videoPlayer.classList.remove('d-none');
        videoPlayer.play().catch(error => {
            console.error("Error playing video:", error);
        });
    } else {
        // Скрываем видео-плеер и показываем превью
        videoPlayer.pause();
        videoPlayer.currentTime = 0; // Сбрасываем на начало
        videoPlayer.classList.add('d-none');
        videoPreview.classList.remove('d-none');
        playButton.classList.remove('d-none');
    }
}

// Инициализация видео-превью
function initVideoPreviews() {
    const videoPreviews = document.querySelectorAll('.video-preview');
    videoPreviews.forEach(video => {
        // Устанавливаем первый кадр как превью
        video.addEventListener('loadeddata', function() {
            // Убедимся, что видео остановлено на первом кадре
            this.pause();
            this.currentTime = 0;
        });
        
        // Обрабатываем ошибки загрузки
        video.addEventListener('error', function() {
            console.error("Error loading video preview:", this.src);
        });
    });
}

// Останавливаем видео при переходе между слайдами карусели
function initVideoPlayers() {
    // Останавливаем видео при прокрутке карусели
    const mediaScrolls = document.querySelectorAll('.media-scroll');
    mediaScrolls.forEach(scroll => {
        // Используем MutationObserver для отслеживания изменений в карусели
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const videos = scroll.querySelectorAll('.video-player:not(.d-none)');
                    videos.forEach(video => {
                        video.pause();
                        video.currentTime = 0;
                        // Сбрасываем видео к превью
                        const container = video.closest('.video-container');
                        if (container) {
                            const preview = container.querySelector('.video-preview');
                            const playButton = container.querySelector('.video-play-button');
                            if (preview && playButton) {
                                video.classList.add('d-none');
                                preview.classList.remove('d-none');
                                playButton.classList.remove('d-none');
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(scroll, { attributes: true });
    });
}

// Инициализация при загрузке документа
document.addEventListener('DOMContentLoaded', function() {
    initVideoPreviews();
    initVideoPlayers();
});