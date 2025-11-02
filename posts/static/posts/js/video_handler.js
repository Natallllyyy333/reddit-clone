// Video handler with start/stop on click anywhere
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
    
    // Playing the video
    video.play().catch(error => {
        console.error('❌ Error playing video:', error);
        // Show the back button on error
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
        // Starting the video
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
        // Pause the video and show the preview
        video.pause();
        video.currentTime = 0; // Reset to the beginning
        container.classList.remove('playing');
        
        if (playButton) playButton.style.display = 'flex';
        if (videoPreview) videoPreview.style.display = 'block';
    }
}

// Function to create a poster from the first frame of a video
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
    
    // Trying to set a poster from the first frame
    video.addEventListener('loadeddata', function() {
        try {
            // Creating a canvas to extract a frame
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set the current time to the first frame
            video.currentTime = 0.1;
            
            const onSeeked = function() {
                try {
                    canvas.width = video.videoWidth || 400;
                    canvas.height = video.videoHeight || 300;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    const posterUrl = canvas.toDataURL();
                    videoPreview.src = posterUrl;
                    console.log('✅ Video poster generated from first frame');
                    
                    // Remove the handler after use
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
    
    // We set up a fallback if the main method doesn't work
    setTimeout(() => {
        if (!videoPreview.src || videoPreview.src === '') {
            setFallbackPoster(videoPreview);
        }
    }, 3000);
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
    if (playButton) playButton.style.display = 'flex';
    if (videoPreview) videoPreview.style.display = 'block';
}

// Initialization of handlers
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
            
            // Generating a poster
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
            
            //Load error handling
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

// Initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoHandlers);
} else {
    initVideoHandlers();
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
            setTimeout(initVideoHandlers, 100);
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