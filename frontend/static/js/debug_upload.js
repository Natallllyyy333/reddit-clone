// debug_upload.js - для диагностики дублирования
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
    
    // Проверяем обработчики событий
    console.log('Event listeners on file input:');
    if (typeof getEventListeners === 'function') {
        console.log(getEventListeners(fileInput));
    }
    
    // Добавляем простой обработчик для отслеживания
    fileInput.addEventListener('change', function(e) {
        console.log('=== FILE INPUT CHANGE ===');
        console.log('Files selected:', e.target.files.length);
        console.log('Files:', Array.from(e.target.files).map(f => f.name));
        
        // Проверяем текущее состояние превью
        console.log('Current preview items:', filePreview?.children.length || 0);
    });
    
    // Проверяем drag & drop обработчики
    if (uploadArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, function(e) {
                console.log(`Upload area ${eventName} event fired`);
            });
        });
    }
    
    console.log('=== UPLOAD DEBUGGER READY ===');
});