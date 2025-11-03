// static/js/cloudinary_media_handler.js - ULTRA SIMPLE
console.log('✅ Cloudinary handler loaded');

// Just make everything visible, never hide anything
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Ensuring all media is visible...');
    
    function makeEverythingVisible() {
        const selectors = [
            '.post-media-container',
            '.media-carousel', 
            '.media-image',
            '.media-video',
            '.video-container',
            '.media-item'
        ];
        
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.style.display = 'block';
                el.style.visibility = 'visible';
                el.style.opacity = '1';
            });
        });
    }
    
    makeEverythingVisible();
    setTimeout(makeEverythingVisible, 1000);
    setTimeout(makeEverythingVisible, 3000);
});