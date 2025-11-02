// SIMPLE SCRIPT FOR LIKES ON POST_LIST
document.addEventListener('DOMContentLoaded', function() {
    console.log('Vote handler loaded for post_list');
    
    document.querySelectorAll('.vote-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Vote form submitted');
            
            const formData = new FormData(this);
            const url = this.action;
            const postId = this.querySelector('button').dataset.postId;
            
            // Adding CSRF token
            const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
            if (csrfInput) {
                formData.append('csrfmiddlewaretoken', csrfInput.value);
            }
            
            // A SIMPLE FETCH WITHOUT COMPLEX LOGIC
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
                
                // Updating the counter
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
                // In case of an error, just reload the page
                window.location.reload();
            });
        });
    });
});