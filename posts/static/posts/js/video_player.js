// Функция для переключения между превью и видео
function toggleVideoPlayback(container) {
    if (!container) {
        console.error('Video container not found');
        return;
    }

    const videoPreview = container.querySelector('.video-preview');
    const videoPlayer = container.querySelector('.video-player');
    const playButton = container.querySelector('.video-play-button');
    const overlay = container.querySelector('.video-overlay');
    
    console.log('Toggle video playback:', {videoPreview, videoPlayer, playButton, overlay});

    if (!videoPlayer || !videoPreview) {
        console.error('Video elements not found');
        return;
    }

    // Если видео уже играет - останавливаем
    if (!videoPlayer.classList.contains('d-none')) {
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
        videoPlayer.classList.add('d-none');
        videoPreview.classList.remove('d-none');
        if (playButton) playButton.style.display = 'block';
        if (overlay) overlay.style.display = 'flex';
        return;
    }

    // Запускаем видео
    videoPreview.classList.add('d-none');
    if (playButton) playButton.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
    videoPlayer.classList.remove('d-none');
    
    // Пытаемся запустить воспроизведение
    const playPromise = videoPlayer.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log('Video started successfully');
        }).catch(error => {
            console.error('Error playing video:', error);
            // В случае ошибки возвращаем к превью
            resetVideoToPreview(container);
        });
    }
}

// Сброс к превью
function resetVideoToPreview(container) {
    const videoPreview = container.querySelector('.video-preview');
    const videoPlayer = container.querySelector('.video-player');
    const playButton = container.querySelector('.video-play-button');
    const overlay = container.querySelector('.video-overlay');
    
    if (videoPlayer) {
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
        videoPlayer.classList.add('d-none');
    }
    if (videoPreview) {
        videoPreview.classList.remove('d-none');
    }
    if (playButton) {
        playButton.style.display = 'block';
    }
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

// Обработчики кликов
function handlePlayButtonClick(event, playButton) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Play button clicked');
    
    const container = playButton.closest('.video-container');
    toggleVideoPlayback(container);
}

function handleVideoOverlayClick(overlay) {
    console.log('Overlay clicked');
    const container = overlay.closest('.video-container');
    toggleVideoPlayback(container);
}

function handleVideoClick(videoPreview) {
    console.log('Video preview clicked');
    const container = videoPreview.closest('.video-container');
    toggleVideoPlayback(container);
}

function handleVideoPlayerClick(videoPlayer) {
    // Останавливаем всплытие, чтобы не срабатывали родительские обработчики
    event.stopPropagation();
}

// Инициализация всех видео элементов
function initVideoPlayers() {
    console.log('Initializing video players...');
    
    // Инициализация превью
    const videoPreviews = document.querySelectorAll('.video-preview');
    videoPreviews.forEach(video => {
        video.addEventListener('loadeddata', function() {
            this.pause();
            this.currentTime = 0;
        });
        
        video.addEventListener('error', function() {
            console.error('Error loading video preview:', this.src);
        });
    });

    // Инициализация кнопок воспроизведения
    const playButtons = document.querySelectorAll('.video-play-button');
    playButtons.forEach(button => {
        button.style.pointerEvents = 'auto';
        button.style.cursor = 'pointer';
        console.log('Play button initialized:', button);
    });

    // Инициализация overlay
    const overlays = document.querySelectorAll('.video-overlay');
    overlays.forEach(overlay => {
        overlay.style.pointerEvents = 'auto';
        overlay.style.cursor = 'pointer';
        console.log('Overlay initialized:', overlay);
    });

    // Остановка видео при скролле карусели
    const mediaScrolls = document.querySelectorAll('.media-scroll');
    mediaScrolls.forEach(scroll => {
        scroll.addEventListener('scroll', function() {
            const playingVideos = this.querySelectorAll('.video-player:not(.d-none)');
            playingVideos.forEach(video => {
                const container = video.closest('.video-container');
                resetVideoToPreview(container);
            });
        });
    });

    console.log(`Initialized: ${videoPreviews.length} videos, ${playButtons.length} play buttons, ${overlays.length} overlays`);
}

// Глобальные функции для использования в HTML
window.toggleVideoPlayback = toggleVideoPlayback;
window.handlePlayButtonClick = handlePlayButtonClick;
window.handleVideoOverlayClick = handleVideoOverlayClick;
window.handleVideoClick = handleVideoClick;
window.handleVideoPlayerClick = handleVideoPlayerClick;
window.resetVideoToPreview = resetVideoToPreview;

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing video players...');
    initVideoPlayers();
});

// Для динамического контента
if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                let shouldReinit = false;
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        if (node.querySelector && (
                            node.querySelector('.video-container') || 
                            node.classList?.contains('video-container')
                        )) {
                            shouldReinit = true;
                        }
                    }
                });
                if (shouldReinit) {
                    setTimeout(initVideoPlayers, 100);
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}