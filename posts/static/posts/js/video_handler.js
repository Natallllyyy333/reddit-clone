// video_handler.js - Обработчик видео с запуском/остановкой по клику на любую область

console.log('🎬 Video handler loaded');

function handleVideoPlay(button) {
    console.log('🎯 Play button clicked');
    
    const container = button.closest('.video-container');
    const video = container.querySelector('video');
    const videoPreview = container.querySelector('.video-preview');
    
    if (!video) {
        console.error('❌ Video element not found');
        return;
    }
    
    // Скрываем кнопку воспроизведения и превью
    button.style.display = 'none';
    if (videoPreview) videoPreview.style.display = 'none';
    
    // Воспроизводим видео
    video.play().catch(error => {
        console.error('❌ Error playing video:', error);
        // Показываем кнопку обратно при ошибке
        button.style.display = 'flex';
        if (videoPreview) videoPreview.style.display = 'block';
    });
}

function toggleVideoPlayback(container) {
    console.log('🎬 Video area clicked');
    
    const video = container.querySelector('video');
    const videoPreview = container.querySelector('.video-preview');
    const playButton = container.querySelector('.video-play-button');
    
    if (!video) return;
    
    if (video.paused) {
        // Запускаем видео
        if (playButton) playButton.style.display = 'none';
        if (videoPreview) videoPreview.style.display = 'none';
        
        video.play().then(() => {
            container.classList.add('playing');
        }).catch(error => {
            console.error('Error playing video on click:', error);
            if (playButton) playButton.style.display = 'flex';
            if (videoPreview) videoPreview.style.display = 'block';
        });
    } else {
        // Останавливаем видео и показываем превью
        video.pause();
        video.currentTime = 0; // Сбрасываем на начало
        container.classList.remove('playing');
        
        if (playButton) playButton.style.display = 'flex';
        if (videoPreview) videoPreview.style.display = 'block';
    }
}

// Функция для создания постера из первого кадра видео
function createVideoPoster(video) {
    const container = video.closest('.video-container');
    
    // Создаем элемент для постера
    let videoPreview = container.querySelector('.video-preview');
    if (!videoPreview) {
        videoPreview = document.createElement('img');
        videoPreview.className = 'video-preview img-fluid rounded';
        videoPreview.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; cursor:pointer; z-index:5; display:block;';
        container.appendChild(videoPreview);
    }
    
    // Пытаемся установить постер из первого кадра
    video.addEventListener('loadeddata', function() {
        try {
            // Создаем canvas для извлечения кадра
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Устанавливаем текущее время на первый кадр
            video.currentTime = 0.1;
            
            const onSeeked = function() {
                try {
                    canvas.width = video.videoWidth || 400;
                    canvas.height = video.videoHeight || 300;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    const posterUrl = canvas.toDataURL();
                    videoPreview.src = posterUrl;
                    console.log('✅ Video poster generated from first frame');
                    
                    // Убираем обработчик после использования
                    video.removeEventListener('seeked', onSeeked);
                } catch (error) {
                    console.error('❌ Error generating poster from frame:', error);
                    setFallbackPoster(videoPreview);
                }
            };
            
            video.addEventListener('seeked', onSeeked);
        } catch (error) {
            console.error('❌ Error in poster generation:', error);
            setFallbackPoster(videoPreview);
        }
    });
    
    // Устанавливаем fallback, если основной метод не сработал
    setTimeout(() => {
        if (!videoPreview.src || videoPreview.src === '') {
            setFallbackPoster(videoPreview);
        }
    }, 3000);
}

// Fallback методы для постера
function setFallbackPoster(videoPreview) {
    // Создаем canvas с градиентным фоном
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    // Создаем градиент
    const gradient = ctx.createLinearGradient(0, 0, 400, 300);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(1, '#3498db');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 300);
    
    // Добавляем иконку play
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('▶', 200, 150);
    
    videoPreview.src = canvas.toDataURL();
    console.log('🎨 Using gradient fallback poster');
}

// Обработчик окончания видео
function handleVideoEnd(video) {
    const container = video.closest('.video-container');
    const playButton = container.querySelector('.video-play-button');
    const videoPreview = container.querySelector('.video-preview');
    
    container.classList.remove('playing');
    if (playButton) playButton.style.display = 'flex';
    if (videoPreview) videoPreview.style.display = 'block';
}

// Инициализация обработчиков
function initVideoHandlers() {
    console.log('🔄 Initializing video handlers...');
    
    // Обработчики для кнопок воспроизведения
    document.querySelectorAll('.video-play-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            handleVideoPlay(this);
        });
        
        // Гарантируем, что кнопка видима
        button.style.display = 'flex';
    });
    
    // Обработчики для видео элементов
    document.querySelectorAll('.video-container').forEach(container => {
        const video = container.querySelector('video');
        
        if (video) {
            // Гарантируем, что видео видимо
            video.style.display = 'block';
            
            // Генерируем постер
            createVideoPoster(video);
            
            // ОБРАБОТЧИК КЛИКА НА КОНТЕЙНЕР - главный обработчик
            container.addEventListener('click', function(e) {
                // Предотвращаем всплытие, чтобы не срабатывали родительские обработчики
                e.stopPropagation();
                e.preventDefault();
                
                // Игнорируем клики непосредственно на кнопке воспроизведения
                if (e.target.closest('.video-play-button')) {
                    return;
                }
                
                toggleVideoPlayback(container);
            });
            
            // События видео
            video.addEventListener('play', function() {
                this.closest('.video-container').classList.add('playing');
                const playButton = this.closest('.video-container').querySelector('.video-play-button');
                const videoPreview = this.closest('.video-container').querySelector('.video-preview');
                if (playButton) playButton.style.display = 'none';
                if (videoPreview) videoPreview.style.display = 'none';
            });
            
            video.addEventListener('ended', function() {
                handleVideoEnd(this);
            });
            
            // Обработка ошибок загрузки
            video.addEventListener('error', function() {
                console.error('❌ Video loading error:', this.error);
                const playButton = this.closest('.video-container').querySelector('.video-play-button');
                const videoPreview = this.closest('.video-container').querySelector('.video-preview');
                if (playButton) playButton.style.display = 'flex';
                if (videoPreview) videoPreview.style.display = 'block';
            });
        }
    });
}

// Инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoHandlers);
} else {
    initVideoHandlers();
}

// Для динамического контента
if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function(mutations) {
        let shouldReinit = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.querySelector && node.querySelector('.video-container')) {
                        shouldReinit = true;
                    }
                });
            }
        });
        if (shouldReinit) {
            console.log('🔄 New video content detected, reinitializing...');
            setTimeout(initVideoHandlers, 100);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Глобальные функции
window.handleVideoPlay = handleVideoPlay;
window.toggleVideoPlayback = toggleVideoPlayback;