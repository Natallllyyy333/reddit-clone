describe('Basic Test', () => {
    test('Jest is working', () => {
        expect(1 + 1).toBe(2);
    });

    test('DOM environment is set up', () => {
        document.body.innerHTML = '<div id="test">Hello World</div>';
        expect(document.getElementById('test').textContent).toBe('Hello World');
    });
});