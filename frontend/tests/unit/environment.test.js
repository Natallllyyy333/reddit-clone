/**
 * @jest-environment jsdom
 */

test('Jest DOM environment basic check', () => {
    console.log('=== ENVIRONMENT CHECK ===');
    console.log('document:', typeof document);
    console.log('document.body:', document.body);
    console.log('document.body.innerHTML:', document.body.innerHTML);
    
    // Проверим базовые возможности DOM
    document.body.innerHTML = '<div id="test">Hello World</div>';
    console.log('After setting innerHTML:', document.body.innerHTML);
    
    const element = document.getElementById('test');
    console.log('Found element:', element);
    console.log('Element text:', element ? element.textContent : 'NOT FOUND');
    
    expect(element).toBeTruthy();
    expect(element.textContent).toBe('Hello World');
});