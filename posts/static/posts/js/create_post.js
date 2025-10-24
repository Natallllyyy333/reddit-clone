class CreatePostForm {
    constructor() {
        this.uploadedFiles = [];
        this.init();
    }

    init() {
        this.setupCharacterCounters();
        this.setupFileUpload();
        this.setupFormValidation();
    }

    setupCharacterCounters() {
        // Используем прямые селекторы вместо Django template tags
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
    }

    handleFiles(files) {
        for (let file of files) {
            if (this.isValidFile(file)) {
                if (!this.isDuplicateFile(file)) {
                    this.uploadedFiles.push(file);
                    this.createPreview(file);
                }
            } else {
                this.showError(`Файл "${file.name}" не поддерживается. Разрешены только изображения и видео до 10MB.`);
            }
        }
       
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

        previewItem.appendChild(removeBtn);
        filePreview.appendChild(previewItem);

        // ========== СКРЫТЬ ОБЛАСТЬ ЗАГРУЗКИ ПРИ НАЛИЧИИ ФАЙЛОВ ==========
        document.getElementById('fileUploadArea').style.display = 'none';
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
                this.showError('Пожалуйста, введите заголовок поста');
                titleInput?.focus();
                return;
            }

            if (!content) {
                e.preventDefault();
                this.showError('Пожалуйста, введите содержание поста');
                contentInput?.focus();
                return;
            }

            // Disable submit button to prevent double submission
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Публикация...';
            }
        });
    }

    showError(message) {
        // Можно заменить на красивый toast или modal
        alert(message);
    }
}

// Инициализация при загрузке документа
document.addEventListener('DOMContentLoaded', function() {
    new CreatePostForm();
});