document.addEventListener('DOMContentLoaded', function() {
    console.log('Posts page loaded');
    
    // Post appearance animation
    const postCards = document.querySelectorAll('.post-card');
    postCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Lazy loading of images (if any)
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
});


// AJAX sharing
document.addEventListener('DOMContentLoaded', function() {
    const shareForms = document.querySelectorAll('#shareForm');
    
    shareForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const postId = this.getAttribute('data-post-id');
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update sharing counter
                    const shareBadge = document.querySelector(`[data-post-id="${postId}"] .badge`);
                    if (shareBadge) {
                        shareBadge.textContent = data.shares_count;
                    }
                    // Close modal window
                    bootstrap.Modal.getInstance(document.getElementById('shareModal')).hide();
                }
            });
        });
    });
});