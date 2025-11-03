class CreatePostForm {
    constructor() {
        this.uploadedFiles = [];
        this.maxFiles = 10;
        this.init();
    }

    init() {
        this.setupCharacterCounters();
        this.setupFileUpload();
        this.setupFormValidation();
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

        // Updating the visibility of the loading area during initialization
        this.updateUploadAreaVisibility();
    }

    handleFiles(files) {
        let filesAdded = 0;

        for (let file of files) {
            // Checking file limit
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
        
        // Updating the visibility of the loading area
        this.updateUploadAreaVisibility();
        
        // We reset the input so that the same files can be selected again
        document.getElementById('mediaFiles').value = '';
    }

    isValidFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
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
            this.updateUploadAreaVisibility(); // Updating visibility upon deletion
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

        // Adding information about the file
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

    // Method for updating the visibility of the loading area
    updateUploadAreaVisibility() {
        const fileUploadArea = document.getElementById('fileUploadArea');
        
        if (!fileUploadArea) return;

        // Creating a file counter if it doesn't exist
        let fileCounter = document.getElementById('fileCounter');
        if (!fileCounter) {
            fileCounter = document.createElement('div');
            fileCounter.id = 'fileCounter';
            fileCounter.className = 'file-counter';
            fileUploadArea.parentNode.insertBefore(fileCounter, fileUploadArea);
        }

        // Updating the counter
        fileCounter.textContent = `Files: ${this.uploadedFiles.length}/${this.maxFiles}`;
        
        // The upload area hides ONLY when the limit is reached
        if (this.uploadedFiles.length >= this.maxFiles) {
            fileUploadArea.style.display = 'none';
        } else {
            fileUploadArea.style.display = 'block'; // Always show if the limit has not been reached
        }

        // Updating the text in the upload area to show how many files are left
        const uploadText = fileUploadArea.querySelector('h5');
        if (uploadText) {
            const remaining = this.maxFiles - this.uploadedFiles.length;
            uploadText.textContent = `Drag files here (remaining: ${remaining})`;
        }
        
        // Show a message when the limit is reached
        let maxFilesMessage = document.getElementById('maxFilesMessage');
        if (this.uploadedFiles.length >= this.maxFiles) {
            if (!maxFilesMessage) {
                maxFilesMessage = document.createElement('div');
                maxFilesMessage.id = 'maxFilesMessage';
                maxFilesMessage.className = 'alert alert-info mt-2';
                maxFilesMessage.innerHTML = `
                    <i class="fas fa-info-circle"></i>
                    Limit reached in ${this.maxFiles} Files. Delete some files to add new ones.
                `;
                fileUploadArea.parentNode.appendChild(maxFilesMessage);
            }
        } else {
            if (maxFilesMessage) {
                maxFilesMessage.remove();
            }
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

            // Disable submit button to prevent double submission
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Posting...';
            }
        });
    }

    showError(message) {
        
        alert(message);
    }
}

// Initialization on document load
document.addEventListener('DOMContentLoaded', function() {
    new CreatePostForm();
});