document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('mediaFiles');
    const filePreview = document.getElementById('filePreview');
    const uploadArea = document.getElementById('fileUploadArea');
    
    // File selection handling
    fileInput.addEventListener('change', function(e) {
        handleFiles(e.target.files);
    });
    
    // Drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        uploadArea.classList.add('highlight');
    }
    
    function unhighlight() {
        uploadArea.classList.remove('highlight');
    }
    
    uploadArea.addEventListener('drop', function(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
        fileInput.files = files; // Обновляем input files
    });
    
    function handleFiles(files) {
        if (files.length > 0) {
            uploadArea.style.display = 'none';
        }
        
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    previewItem.innerHTML = `
                        <img src="${e.target.result}" alt="Preview">
                        <button type="button" class="btn-remove" onclick="removePreview(this)">×</button>
                    `;
                    filePreview.appendChild(previewItem);
                };
                reader.readAsDataURL(file);
            } else if (file.type.startsWith('video/')) {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <div class="video-preview">
                        <i class="fas fa-video"></i>
                        <p>${file.name}</p>
                    </div>
                    <button type="button" class="btn-remove" onclick="removePreview(this)">×</button>
                `;
                filePreview.appendChild(previewItem);
            }
        });
    }
    
    window.removePreview = function(button) {
        const previewItem = button.parentElement;
        previewItem.remove();
        
        // Show the loading area if there is no preview
        if (filePreview.children.length === 0) {
            uploadArea.style.display = 'block';
        }
    };
});