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

        // Обновляем видимость области загрузки при инициализации
        this.updateUploadAreaVisibility();
    }

    handleFiles(files) {
        let filesAdded = 0;

        for (let file of files) {
            // Проверяем лимит файлов
            if (this.uploadedFiles.length >= this.maxFiles) {
                this.showError(`Максимальное количество файлов: ${this.maxFiles}`);
                break;
            }
            if (this.isValidFile(file)) {
                if (!this.isDuplicateFile(file)) {
                    this.uploadedFiles.push(file);
                    this.createPreview(file);
                    filesAdded++;
                }
            } else {
                this.showError(`Файл "${file.name}" не поддерживается. Разрешены только изображения и видео до 10MB.`);
            }
        }
        
        // Обновляем видимость области загрузки
        this.updateUploadAreaVisibility();
        
        // Сбрасываем input чтобы можно было выбрать те же файлы снова
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
            this.updateUploadAreaVisibility(); // Обновляем видимость при удалении
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

        // Добавляем информацию о файле
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        fileInfo.innerHTML = `
            <small class="file-name">${file.name}</small>
            <small class="file-size">${this.formatFileSize(file.size)}</small>
        `;
        previewItem.appendChild(fileInfo);
        previewItem.appendChild(removeBtn);
        filePreview.appendChild(previewItem);
        
        // ВАЖНО: НЕ скрываем область загрузки здесь!
        // Область загрузки будет управляться только через updateUploadAreaVisibility()
    }

    // Метод для обновления видимости области загрузки
    updateUploadAreaVisibility() {
        const fileUploadArea = document.getElementById('fileUploadArea');
        
        if (!fileUploadArea) return;

        // Создаем счетчик файлов если его нет
        let fileCounter = document.getElementById('fileCounter');
        if (!fileCounter) {
            fileCounter = document.createElement('div');
            fileCounter.id = 'fileCounter';
            fileCounter.className = 'file-counter';
            fileUploadArea.parentNode.insertBefore(fileCounter, fileUploadArea);
        }

        // Обновляем счетчик
        fileCounter.textContent = `Файлов: ${this.uploadedFiles.length}/${this.maxFiles}`;
        
        // ВАЖНОЕ ИСПРАВЛЕНИЕ: Область загрузки скрывается ТОЛЬКО при достижении лимита
        if (this.uploadedFiles.length >= this.maxFiles) {
            fileUploadArea.style.display = 'none';
        } else {
            fileUploadArea.style.display = 'block'; // Всегда показываем, если не достигнут лимит
        }

        // Обновляем текст в области загрузки чтобы показать сколько файлов осталось
        const uploadText = fileUploadArea.querySelector('h5');
        if (uploadText) {
            const remaining = this.maxFiles - this.uploadedFiles.length;
            uploadText.textContent = `Перетащите файлы сюда (осталось: ${remaining})`;
        }
        
        // Показываем сообщение при достижении лимита
        let maxFilesMessage = document.getElementById('maxFilesMessage');
        if (this.uploadedFiles.length >= this.maxFiles) {
            if (!maxFilesMessage) {
                maxFilesMessage = document.createElement('div');
                maxFilesMessage.id = 'maxFilesMessage';
                maxFilesMessage.className = 'alert alert-info mt-2';
                maxFilesMessage.innerHTML = `
                    <i class="fas fa-info-circle"></i>
                    Достигнут лимит в ${this.maxFiles} файлов. 
                    Удалите некоторые файлы чтобы добавить новые.
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