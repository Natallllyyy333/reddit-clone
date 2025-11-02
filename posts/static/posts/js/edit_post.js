class EditPostForm {
    constructor() {
        this.uploadedFiles = [];
        this.maxFiles = 10;
        this.deletedMediaIds = [];
        this.init();
    }

    init() {
        this.setupCharacterCounters();
        this.setupFileUpload();
        this.setupFormValidation();
        this.setupExistingMedia();
    }

    setupCharacterCounters() {
        const titleInput = document.querySelector('input[name="title"]');
        const contentInput = document.querySelector('textarea[name="content"]');
        const titleCount = document.getElementById('titleCount');
        const contentCount = document.getElementById('contentCount');
        const titleCurrent = document.getElementById('titleCurrent');
        const contentCurrent = document.getElementById('contentCurrent');

        if (titleInput) {
            titleInput.addEventListener('input', () => {
                this.updateCharacterCount(titleInput, titleCurrent, titleCount, 200);
            });
            this.updateCharacterCount(titleInput, titleCurrent, titleCount, 200);
        }

        if (contentInput) {
            contentInput.addEventListener('input', () => {
                this.updateCharacterCount(contentInput, contentCurrent, contentCount, 10000);
            });
            this.updateCharacterCount(contentInput, contentCurrent, contentCount, 10000);
        }
    }

    updateCharacterCount(input, currentSpan, countElement, maxLength) {
        const length = input.value.length;
        currentSpan.textContent = length;
        
        countElement.classList.remove('warning', 'danger');
        if (length > maxLength * 0.8) {
            countElement.classList.add('warning');
        }
        if (length > maxLength) {
            countElement.classList.add('danger');
        }
    }

    setupFileUpload() {
        const fileUploadArea = document.getElementById('fileUploadArea');
        const fileInput = document.getElementById('mediaFiles');
        const filePreview = document.getElementById('filePreview');

        if (!fileUploadArea || !fileInput) return;

        // Drag and drop functionality
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('dragover');
        });

        fileUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
            this.updateFileInput();
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
            this.updateFileInput();
        });

        this.updateUploadAreaVisibility();
    }

    setupExistingMedia() {
        // Processing the deletion of existing media files
        const existingMediaItems = document.querySelectorAll('.existing-media-item');
        existingMediaItems.forEach(item => {
            const removeBtn = item.querySelector('.remove-existing-file');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    const mediaId = item.getAttribute('data-media-id');
                    this.deletedMediaIds.push(mediaId);
                    
                    // Creating a hidden field for deletion
                    const deleteInput = document.createElement('input');
                    deleteInput.type = 'hidden';
                    deleteInput.name = 'delete_media';
                    deleteInput.value = mediaId;
                    document.getElementById('postForm').appendChild(deleteInput);
                    
                    item.remove();
                    this.updateUploadAreaVisibility();
                });
            }
        });
    }

    handleFiles(files) {
        let filesAdded = 0;

        for (let file of files) {
            if (this.uploadedFiles.length >= this.maxFiles) {
                this.showError(`Maximum number of files: ${this.maxFiles}`);
                break;
            }
            if (this.isValidFile(file)) {
                if (!this.isDuplicateFile(file)) {
                    this.uploadedFiles.push(file);
                    this.createPreview(file);
                    filesAdded++;
                }
            } else {
                this.showError(`File "${file.name}" not supported. Only images and videos up to 10MB.`);
            }
        }
        
        this.updateUploadAreaVisibility();
        document.getElementById('mediaFiles').value = '';
    }

    isValidFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
        const maxSize = 10 * 1024 * 1024;
        return validTypes.includes(file.type) && file.size <= maxSize;
    }

    isDuplicateFile(newFile) {
        return this.uploadedFiles.some(existingFile => 
            existingFile.name === newFile.name && 
            existingFile.size === newFile.size &&
            existingFile.type === newFile.type
        );
    }

    createPreview(file) {
        const filePreview = document.getElementById('filePreview');
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-file';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => {
            previewItem.remove();
            this.uploadedFiles = this.uploadedFiles.filter(f => f !== file);
            this.updateFileInput();
            this.updateUploadAreaVisibility();
        };

        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = file.name;
            previewItem.appendChild(img);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.controls = true;
            video.muted = true;
            video.style.maxWidth = '150px';
            video.style.maxHeight = '150px';
            previewItem.appendChild(video);
        }

        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        fileInfo.innerHTML = `
            <small class="file-name">${file.name}</small>
            <small class="file-size">${this.formatFileSize(file.size)}</small>
        `;
        previewItem.appendChild(fileInfo);
        previewItem.appendChild(removeBtn);
        filePreview.appendChild(previewItem);
    }

    updateUploadAreaVisibility() {
        const fileUploadArea = document.getElementById('fileUploadArea');
        const existingMediaCount = document.querySelectorAll('.existing-media-item').length;
        const totalFiles = this.uploadedFiles.length + existingMediaCount;
        
        if (!fileUploadArea) return;

        let fileCounter = document.getElementById('fileCounter');
        if (!fileCounter) {
            fileCounter = document.createElement('div');
            fileCounter.id = 'fileCounter';
            fileCounter.className = 'file-counter';
            fileUploadArea.parentNode.insertBefore(fileCounter, fileUploadArea);
        }

        fileCounter.textContent = `Файлов: ${totalFiles}/${this.maxFiles}`;
        
        if (totalFiles >= this.maxFiles) {
            fileUploadArea.style.display = 'none';
        } else {
            fileUploadArea.style.display = 'block';
        }

        const uploadText = fileUploadArea.querySelector('h5');
        if (uploadText) {
            const remaining = this.maxFiles - totalFiles;
            uploadText.textContent = `Drag files here (left: ${remaining})`;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    updateFileInput() {
        const fileInput = document.getElementById('mediaFiles');
        const dataTransfer = new DataTransfer();
        this.uploadedFiles.forEach(file => dataTransfer.items.add(file));
        fileInput.files = dataTransfer.files;
    }

    setupFormValidation() {
        const form = document.getElementById('postForm');
        const submitBtn = document.getElementById('submitBtn');

        if (!form) return;

        form.addEventListener('submit', (e) => {
            const titleInput = document.querySelector('input[name="title"]');
            const contentInput = document.querySelector('textarea[name="content"]');
            
            const title = titleInput?.value.trim();
            const content = contentInput?.value.trim();

            if (!title) {
                e.preventDefault();
                this.showError('Please enter the post title');
                titleInput?.focus();
                return;
            }

            if (!content) {
                e.preventDefault();
                this.showError('Please enter the content of the post');
                contentInput?.focus();
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Saving...';
            }
        });
    }

    showError(message) {
        alert(message);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new EditPostForm();
});