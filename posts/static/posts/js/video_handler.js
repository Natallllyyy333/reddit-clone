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
    
    // Hiding the play button and preview
    button.style.display = 'none';
    if (videoPreview) videoPreview.style.display = 'none';
    
    // Add controls for better mobile compatibility
    video.setAttribute('controls', 'true');
    
    // Playing the video with better error handling
    video.play().catch(error => {
        console.error('❌ Error playing video:', error);
        // Show the back button on error
        button.style.display = 'flex';
        if (videoPreview) videoPreview.style.display = 'block';
        video.removeAttribute('controls');
    });
}

function toggleVideoPlayback(container) {
    console.log('🎬 Video area clicked');
    
    const video = container.querySelector('video');
    const videoPreview = container.querySelector('.video-preview');
    const playButton = container.querySelector('.video-play-button');
    
    if (!video) return;
    
    if (video.paused) {
        // Starting the video
        if (playButton) playButton.style.display = 'none';
        if (videoPreview) videoPreview.style.display = 'none';
        
        // Add controls for better compatibility
        video.setAttribute('controls', 'true');
        
        video.play().then(() => {
            container.classList.add('playing');
        }).catch(error => {
            console.error('Error playing video on click:', error);
            if (playButton) playButton.style.display = 'flex';
            if (videoPreview) videoPreview.style.display = 'block';
            video.removeAttribute('controls');
        });
    } else {
        // Pause the video and show the preview
        video.pause();
        video.currentTime = 0; // Reset to the beginning
        container.classList.remove('playing');
        video.removeAttribute('controls');
        
        if (playButton) playButton.style.display = 'flex';
        if (videoPreview) videoPreview.style.display = 'block';
    }
}

// SIMPLIFIED: Function to create a poster from the first frame of a video
function createVideoPoster(video) {
    const container = video.closest('.video-container');
    
    // Creating an element for the poster
    let videoPreview = container.querySelector('.video-preview');
    if (!videoPreview) {
        videoPreview = document.createElement('img');
        videoPreview.className = 'video-preview img-fluid rounded';
        videoPreview.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; cursor:pointer; z-index:5; display:block;';
        container.appendChild(videoPreview);
    }
    
    // Use a simple approach - don't try to capture first frame due to CORS/Cloudinary issues
    setFallbackPoster(videoPreview);
    
    // Set a timeout to ensure preview is visible even if video loads slowly
    setTimeout(() => {
        if (!videoPreview.src || videoPreview.src === '') {
            setFallbackPoster(videoPreview);
        }
    }, 1000);
}

// Fallback methods for the poster
function setFallbackPoster(videoPreview) {
    // Creating a canvas with a gradient background
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    // Creating a gradient
    const gradient = ctx.createLinearGradient(0, 0, 400, 300);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(1, '#3498db');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 300);
    
    // Adding an icon play
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('▶', 200, 150);
    
    videoPreview.src = canvas.toDataURL();
    console.log('🎨 Using gradient fallback poster');
}

// Video end handler
function handleVideoEnd(video) {
    const container = video.closest('.video-container');
    const playButton = container.querySelector('.video-play-button');
    const videoPreview = container.querySelector('.video-preview');
    
    container.classList.remove('playing');
    video.removeAttribute('controls');
    
    if (playButton) playButton.style.display = 'flex';
    if (videoPreview) videoPreview.style.display = 'block';
}

// IMPROVED: Initialization of handlers with better error handling
function initVideoHandlers() {
    console.log('🔄 Initializing video handlers...');
    
    // Handlers for playback buttons
    document.querySelectorAll('.video-play-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            handleVideoPlay(this);
        });
        
        // We guarantee that the button is visible
        button.style.display = 'flex';
    });
    
    // Handlers for video elements
    document.querySelectorAll('.video-container').forEach(container => {
        const video = container.querySelector('video');
        
        if (video) {
            // We guarantee that the video is visible
            video.style.display = 'block';
            
            // Make sure video has proper attributes for Cloudinary
            if (!video.hasAttribute('playsinline')) {
                video.setAttribute('playsinline', '');
            }
            if (!video.hasAttribute('webkit-playsinline')) {
                video.setAttribute('webkit-playsinline', '');
            }
            if (!video.hasAttribute('muted')) {
                video.setAttribute('muted', '');
            }
            if (!video.hasAttribute('preload')) {
                video.setAttribute('preload', 'metadata');
            }
            
            // Generating a poster - simplified for Heroku/Cloudinary
            createVideoPoster(video);
            
            // CLICK HANDLER ON CONTAINER - main handler
            container.addEventListener('click', function(e) {
                // Prevent bubbling so that parent handlers do not trigger
                e.stopPropagation();
                e.preventDefault();
                
                // Ignore clicks directly on the play button
                if (e.target.closest('.video-play-button')) {
                    return;
                }
                
                toggleVideoPlayback(container);
            });
            
            // Video events
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
            
            // Load error handling - less aggressive
            video.addEventListener('error', function() {
                console.error('❌ Video loading error:', this.error);
                const playButton = this.closest('.video-container').querySelector('.video-play-button');
                const videoPreview = this.closest('.video-container').querySelector('.video-preview');
                if (playButton) playButton.style.display = 'flex';
                if (videoPreview) videoPreview.style.display = 'block';
                
                // Don't hide the container - let it be visible even if video fails
                console.log('⚠️ Video error but keeping container visible');
            });
            
            // Loaded event for better debugging
            video.addEventListener('loadeddata', function() {
                console.log('✅ Video data loaded:', this.src);
            });
            
            // Can play through event
            video.addEventListener('canplaythrough', function() {
                console.log('✅ Video can play through:', this.src);
            });
        }
    });
}

// IMPROVED: Initialization with retry for Heroku cold starts
function initializeWithRetry() {
    try {
        initVideoHandlers();
        console.log('✅ Video handlers initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing video handlers, retrying...', error);
        setTimeout(initVideoHandlers, 1000);
    }
}

// Initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Delay initialization to account for Heroku latency
        setTimeout(initializeWithRetry, 500);
    });
} else {
    setTimeout(initializeWithRetry, 500);
}

// For dynamic content
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
            setTimeout(initVideoHandlers, 500);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Global functions
window.handleVideoPlay = handleVideoPlay;
window.toggleVideoPlayback = toggleVideoPlayback;

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleVideoPlay,
        toggleVideoPlayback,
        initVideoHandlers
    };
}