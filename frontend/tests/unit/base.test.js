describe('Base JavaScript Functions', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <a href="#test-section">Scroll to section</a>
            <div id="test-section">Target</div>
        `;
    });

    test('base.js file exists and loads without errors', () => {
        expect(() => {
            require('../../static/js/base.js');
        }).not.toThrow();
    });

    test('DOMContentLoaded event works', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        require('../../static/js/base.js');
        
        document.dispatchEvent(new Event('DOMContentLoaded'));
        
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});