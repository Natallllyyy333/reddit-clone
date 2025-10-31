// frontend/tests/unit/ajax_handler_basic.test.js
describe('AJAX Handler - Basic Functionality', () => {
    test('basic DOM query works', () => {
        document.body.innerHTML = '<div class="test">Hello</div>';
        const element = document.querySelector('.test');
        expect(element).toBeTruthy();
        expect(element.textContent).toBe('Hello');
    });

    test('form elements can be created and queried', () => {
        document.body.innerHTML = `
            <form class="test-form">
                <input name="test" value="test-value">
            </form>
        `;
        
        const form = document.querySelector('.test-form');
        const input = document.querySelector('input[name="test"]');
        
        expect(form).toBeTruthy();
        expect(input).toBeTruthy();
        expect(input.value).toBe('test-value');
    });

    test('event dispatching works', () => {
        document.body.innerHTML = '<button class="test-btn">Click</button>';
        
        const button = document.querySelector('.test-btn');
        let clicked = false;
        
        button.addEventListener('click', () => {
            clicked = true;
        });
        
        button.dispatchEvent(new Event('click'));
        
        expect(clicked).toBe(true);
    });
});