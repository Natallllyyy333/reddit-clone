// ПРОСТОЙ СКРИПТ ДЛЯ ЛАЙКОВ НА POST_LIST
document.addEventListener('DOMContentLoaded', function() {
    console.log('Vote handler loaded for post_list');
    
    document.querySelectorAll('.vote-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Vote form submitted');
            
            const formData = new FormData(this);
            const url = this.action;
            const postId = this.querySelector('button').dataset.postId;
            
            // Добавляем CSRF token
            const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
            if (csrfInput) {
                formData.append('csrfmiddlewaretoken', csrfInput.value);
            }
            
            // ПРОСТОЙ FETCH БЕЗ СЛОЖНОЙ ЛОГИКИ
            fetch(url, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network error');
                }
                return response.json();
            })
            .then(data => {
                console.log('Vote successful:', data);
                
                // Обновляем счетчик
                const voteCount = document.getElementById('vote-count-' + postId);
                if (voteCount) {
                    const strongElement = voteCount.querySelector('strong');
                    if (strongElement) {
                        strongElement.textContent = data.total_votes;
                    }
                }
            })
            .catch(error => {
                console.error('Vote error:', error);
                // При ошибке просто перезагружаем страницу
                window.location.reload();
            });
        });
    });
});