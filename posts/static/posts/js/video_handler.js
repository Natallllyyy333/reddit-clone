console.log('🎬 Video handler loaded');

function handleVideoPlay(button) {
    console.log('🎯 Play button clicked');
    
    const container = button.closest('.video-container');
    const video = container.querySelector('video');
    
    if (!video) {
        console.error('❌ Video element not found');
        return;
    }
    
    // Hide play button
    button.style.display = 'none';
    
    // Add controls and play
    video.setAttribute('controls', 'true');
    video.style.display = 'block';
    
    video.play().catch(error => {
        console.error('❌ Error playing video:', error);
        // Show button again on error
        button.style.display = 'flex';
        video.removeAttribute('controls');
    });
}

// Simple initialization
function initVideoHandlers() {
    console.log('🔄 Initializing video handlers...');
    
    const videoContainers = document.querySelectorAll('.video-container');
    console.log(`🎬 Found ${videoContainers.length} video containers`);
    
    videoContainers.forEach((container, index) => {
        const video = container.querySelector('video');
        const playButton = container.querySelector('.video-play-button');
        
        console.log(`🎬 Video ${index + 1}:`, {
            container: container,
            video: video,
            playButton: playButton,
            videoSrc: video ? video.src : 'none'
        });
        
        if (video && playButton) {
            // Ensure elements are visible
            video.style.display = 'block';
            playButton.style.display = 'flex';
            
            // Add click handler to play button
            playButton.addEventListener('click', function(e) {
                e.stopPropagation();
                handleVideoPlay(this);
            });
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initVideoHandlers, 1000);
    });
} else {
    setTimeout(initVideoHandlers, 1000);
}