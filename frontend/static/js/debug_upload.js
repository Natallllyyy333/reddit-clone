document.addEventListener('DOMContentLoaded', function() {
    console.log('=== UPLOAD DEBUGGER STARTED ===');
    
    const fileInput = document.getElementById('mediaFiles');
    const uploadArea = document.getElementById('fileUploadArea');
    const filePreview = document.getElementById('filePreview');
    
    if (!fileInput) {
        console.error('File input not found');
        return;
    }
    
    console.log('File input found:', fileInput);
    console.log('Upload area found:', !!uploadArea);
    console.log('File preview found:', !!filePreview);
    
    // Checking event handlers
    console.log('Event listeners on file input:');
    if (typeof getEventListeners === 'function') {
        console.log(getEventListeners(fileInput));
    }
    
    // Adding a simple handler for tracking
    fileInput.addEventListener('change', function(e) {
        console.log('=== FILE INPUT CHANGE ===');
        console.log('Files selected:', e.target.files.length);
        console.log('Files:', Array.from(e.target.files).map(f => f.name));
        
        // Checking the current state of the preview
        console.log('Current preview items:', filePreview?.children.length || 0);
    });
    
    // Checking drag & drop handlers
    if (uploadArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, function(e) {
                console.log(`Upload area ${eventName} event fired`);
            });
        });
    }
    
    console.log('=== UPLOAD DEBUGGER READY ===');
});