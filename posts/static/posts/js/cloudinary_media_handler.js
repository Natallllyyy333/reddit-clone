document.addEventListener('DOMContentLoaded', function() {
    console.log('Cloudinary media handler initialized');
    
    // Handle media loading errors
    function handleMediaErrors() {
        const mediaContainers = document.querySelectorAll('.post-media-container');
        
        mediaContainers.forEach(container => {
            const images = container.querySelectorAll('img');
            const videos = container.querySelectorAll('video');
            let hasVisibleMedia = false;
            
            // Check images
            images.forEach(img => {
                // Test if image loads successfully
                const testImage = new Image();
                testImage.onload = function() {
                    console.log('Image loaded successfully:', img.src);
                    hasVisibleMedia = true;
                };
                testImage.onerror = function() {
                    console.log('Image failed to load, hiding:', img.src);
                    img.style.display = 'none';
                };
                testImage.src = img.src;
            });
            
            // Check videos
            videos.forEach(video => {
                const source = video.querySelector('source');
                if (source) {
                    // Test if video source is accessible
                    fetch(source.src, { method: 'HEAD' })
                        .then(response => {
                            if (response.ok) {
                                console.log('Video source accessible:', source.src);
                                hasVisibleMedia = true;
                            } else {
                                console.log('Video source not accessible, hiding:', source.src);
                                video.style.display = 'none';
                                const playButton = video.parentElement.querySelector('.video-play-button');
                                if (playButton) playButton.style.display = 'none';
                            }
                        })
                        .catch(error => {
                            console.log('Video source fetch failed, hiding:', source.src, error);
                            video.style.display = 'none';
                            const playButton = video.parentElement.querySelector('.video-play-button');
                            if (playButton) playButton.style.display = 'none';
                        });
                }
            });
            
            // Hide container if no media is visible after checking
            setTimeout(() => {
                const visibleImages = Array.from(images).filter(img => img.style.display !== 'none');
                const visibleVideos = Array.from(videos).filter(video => video.style.display !== 'none');
                
                if (visibleImages.length === 0 && visibleVideos.length === 0 && 
                    (images.length > 0 || videos.length > 0)) {
                    container.style.display = 'none';
                    console.log('Hiding media container - no visible media');
                }
            }, 2000);
        });
    }
    
    // Initialize media error handling
    handleMediaErrors();
    
    // Re-check when new content might be loaded (for dynamic content)
    setTimeout(handleMediaErrors, 5000);
});