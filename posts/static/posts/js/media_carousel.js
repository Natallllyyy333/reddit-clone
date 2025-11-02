function stopAllVideosInContainer(container) {
    const videos = container.querySelectorAll('.video-player:not(.d-none)');
    videos.forEach(video => {
        video.pause();
        video.currentTime = 0; // Reset to the beginning
        // Dropping the video to the preview
        const videoContainer = video.closest('.video-container');
        if (videoContainer) {
            const preview = videoContainer.querySelector('.video-preview');
            const playButton = videoContainer.querySelector('.video-play-button');
            if (preview && playButton) {
                video.classList.add('d-none');
                preview.classList.remove('d-none');
                playButton.classList.remove('d-none');
            }
        }
    });
}

// Function for scrolling media
function scrollMedia(postId, direction) {
    const mediaScroll = document.getElementById(`mediaScroll-${postId}`);
    const mediaItems = mediaScroll.querySelectorAll('.media-item');
    const scrollAmount = mediaItems[0].offsetWidth + 10; // 10px для gap
    
    // Pause the video before scrolling
    stopAllVideosInContainer(mediaScroll);
    
    mediaScroll.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
    
    // Обновляем счетчик (если есть)
    updateMediaCounter(postId);
}

// Функция для обновления счетчика медиа
function updateMediaCounter(postId) {
    const mediaScroll = document.getElementById(`mediaScroll-${postId}`);
    const mediaItems = mediaScroll.querySelectorAll('.media-item');
    const scrollLeft = mediaScroll.scrollLeft;
    const itemWidth = mediaItems[0].offsetWidth + 10; // 10px gap
    
    const currentIndex = Math.round(scrollLeft / itemWidth) + 1;
    const total = mediaItems.length;
    
    const counter = document.querySelector(`#mediaScroll-${postId}`).closest('.post-media-container').querySelector('.media-counter');
    if (counter) {
        counter.querySelector('.current').textContent = currentIndex;
        counter.querySelector('.total').textContent = total;
    }
}

// Carousel initialization on load
document.addEventListener('DOMContentLoaded', function() {
    // Adding handlers for mouse wheel scrolling
    const mediaScrolls = document.querySelectorAll('.media-scroll');
    mediaScrolls.forEach(scroll => {
        scroll.addEventListener('wheel', function(e) {
            e.preventDefault();
            this.scrollLeft += e.deltaY;
        });
    });
});