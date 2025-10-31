// frontend/tests/unit/debug_dom.test.js
describe('DOM Debug Test', () => {
    test('debug DOM changes', () => {
        const initialHTML = `
            <button class="share-btn" data-post-id="123">Share</button>
            <button class="comments-btn">Comments</button>
        `;
        document.body.innerHTML = initialHTML;

        console.log('BEFORE loading scripts:');
        console.log('share-btn exists:', !!document.querySelector('.share-btn'));
        console.log('comments-btn exists:', !!document.querySelector('.comments-btn'));
        console.log('Full DOM:', document.body.innerHTML);

        // Загружаем скрипты
        require('../../static/js/share.js');
        require('../../static/js/comments.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        console.log('AFTER loading scripts:');
        console.log('share-btn exists:', !!document.querySelector('.share-btn'));
        console.log('comments-btn exists:', !!document.querySelector('.comments-btn'));
        console.log('Full DOM:', document.body.innerHTML);

        // Просто проверяем, что скрипты загрузились без ошибок
        expect(true).toBe(true);
    });
});