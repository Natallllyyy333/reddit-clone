function scrollMedia(postId, direction) {
    const scrollContainer = document.getElementById(`mediaScroll-${postId}`);
    const mediaItems = scrollContainer.querySelectorAll('.media-item');
    const scrollWidth = scrollContainer.offsetWidth;
    const currentScroll = scrollContainer.scrollLeft || 0;
    
    let targetScroll = currentScroll + (direction * scrollWidth);
    
    // Ограничиваем прокрутку
    const maxScroll = scrollWidth * (mediaItems.length - 1);
    targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
    
    scrollContainer.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
    });
    
    // Обновляем счетчик
    updateMediaCounter(postId, Math.round(targetScroll / scrollWidth) + 1);
}

function updateMediaCounter(postId, currentIndex) {
    const counter = document.querySelector(`#mediaScroll-${postId}`).closest('.post-media-container').querySelector('.media-counter .current');
    if (counter) {
        counter.textContent = currentIndex;
    }
}

function playVideo(element) {
    const video = element.parentElement.querySelector('video');
    video.controls = true;
    video.play();
    element.style.display = 'none';
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем обработчики для свайпа на мобильных устройствах
    document.querySelectorAll('.media-scroll').forEach(container => {
        let startX;
        let scrollLeft;
        let isDown = false;
        
        container.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });
        
        container.addEventListener('mouseleave', () => {
            isDown = false;
        });
        
        container.addEventListener('mouseup', () => {
            isDown = false;
        });
        
        container.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        });
        
        // Touch events для мобильных
        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });
        
        container.addEventListener('touchmove', (e) => {
            if (!e.touches || e.touches.length !== 1) return;
            const x = e.touches[0].pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        });
    });
});