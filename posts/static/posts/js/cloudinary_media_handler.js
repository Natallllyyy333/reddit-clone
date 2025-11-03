// cloudinary_media_handler.js - FIXED VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cloudinary media handler initialized');
    
    // Handle media loading errors with better timing and less aggressive hiding
    function handleMediaErrors() {
        const mediaContainers = document.querySelectorAll('.post-media-container');
        
        mediaContainers.forEach(container => {
            const images = container.querySelectorAll('img');
            const videos = container.querySelectorAll('video');
            let hasVisibleMedia = false;
            let checkedCount = 0;
            const totalMedia = images.length + videos.length;
            
            // Check images with better error handling
            images.forEach(img => {
                // Only handle images that haven't loaded properly after a delay
                if (img.complete) {
                    if (img.naturalHeight === 0) {
                        console.log('Image failed to load:', img.src);
                        img.style.display = 'none';
                    } else {
                        hasVisibleMedia = true;
                    }
                    checkedCount++;
                    checkCompletion();
                } else {
                    img.addEventListener('load', function() {
                        console.log('Image loaded successfully:', img.src);
                        hasVisibleMedia = true;
                        checkedCount++;
                        checkCompletion();
                    });
                    
                    img.addEventListener('error', function() {
                        console.log('Image failed to load:', img.src);
                        img.style.display = 'none';
                        checkedCount++;
                        checkCompletion();
                    });
                    
                    // Fallback in case events don't fire
                    setTimeout(() => {
                        if (!img.complete && img.style.display !== 'none') {
                            console.log('Image load timeout:', img.src);
                            checkedCount++;
                            checkCompletion();
                        }
                    }, 3000);
                }
            });
            
            // Check videos with better error handling
            videos.forEach(video => {
                const source = video.querySelector('source');
                if (source) {
                    video.addEventListener('loadeddata', function() {
                        console.log('Video loaded successfully:', source.src);
                        hasVisibleMedia = true;
                        checkedCount++;
                        checkCompletion();
                    });
                    
                    video.addEventListener('error', function() {
                        console.log('Video failed to load:', source.src);
                        video.style.display = 'none';
                        const playButton = video.parentElement.querySelector('.video-play-button');
                        if (playButton) playButton.style.display = 'none';
                        checkedCount++;
                        checkCompletion();
                    });
                    
                    // Fallback check
                    setTimeout(() => {
                        if (video.readyState < 1 && video.style.display !== 'none') {
                            console.log('Video load timeout, but keeping visible:', source.src);
                            // Don't hide on timeout - just assume it's slow loading
                            checkedCount++;
                            checkCompletion();
                        }
                    }, 5000);
                } else {
                    checkedCount++;
                    checkCompletion();
                }
            });
            
            function checkCompletion() {
                // Only hide container if ALL media failed AND we've checked everything
                if (checkedCount === totalMedia && !hasVisibleMedia && totalMedia > 0) {
                    container.style.display = 'none';
                    console.log('Hiding media container - no visible media after all checks');
                }
            }
            
            // If no media to check, don't hide container
            if (totalMedia === 0) {
                container.style.display = 'none';
            }
        });
    }
    
    // Initialize with longer delay to account for Heroku latency
    setTimeout(handleMediaErrors, 2000);
    
    // Optional: Re-check after longer delay for very slow connections
    setTimeout(handleMediaErrors, 8000);
});