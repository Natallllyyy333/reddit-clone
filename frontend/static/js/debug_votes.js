// frontend/static/js/debug_votes.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== VOTE DEBUGGER STARTED ===');
    
    // Проверяем все формы голосования
    const voteForms = document.querySelectorAll('form.vote-form');
    console.log(`Found ${voteForms.length} vote forms`);
    
    voteForms.forEach((form, index) => {
        console.log(`Form ${index}:`, form);
        console.log(`Form action: ${form.action}`);
        console.log(`Form classes: ${form.className}`);
        
        // Добавляем обработчик с подробным логированием
        form.addEventListener('submit', function(e) {
            console.log('=== FORM SUBMISSION DETECTED ===');
            console.log('Event target:', e.target);
            console.log('Default prevented:', e.defaultPrevented);
            
            e.preventDefault();
            console.log('After preventDefault - default prevented:', e.defaultPrevented);
            
            // Проверяем, есть ли другие обработчики
            console.log('Event listeners on this form:');
            const listeners = getEventListeners(form);
            console.log(listeners);
            
            // Имитируем успешный AJAX запрос для тестирования
            setTimeout(() => {
                const postId = form.querySelector('button')?.dataset.postId;
                if (postId) {
                    const voteCount = document.getElementById(`vote-count-${postId}`);
                    if (voteCount) {
                        const current = parseInt(voteCount.textContent) || 0;
                        voteCount.textContent = current + 1;
                        console.log(`Updated vote count for post ${postId}`);
                    }
                }
            }, 100);
        });
    });
    
    // Проверяем кнопки голосования
    const voteButtons = document.querySelectorAll('.vote-btn');
    console.log(`Found ${voteButtons.length} vote buttons`);
    
    voteButtons.forEach((button, index) => {
        console.log(`Button ${index}:`, button);
        console.log(`Button data-post-id: ${button.dataset.postId}`);
        console.log(`Button data-vote-type: ${button.dataset.voteType}`);
    });
    
    console.log('=== VOTE DEBUGGER FINISHED ===');
});