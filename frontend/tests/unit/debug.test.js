describe('Debug Upload', () => {
    test('debug_upload.js file exists and loads without errors', () => {
        expect(() => {
            require('../../static/js/debug_upload.js');
        }).not.toThrow();
    });

    test('debug upload initialization', () => {
        document.body.innerHTML = `
            <input id="mediaFiles" type="file">
            <div id="fileUploadArea"></div>
            <div id="filePreview"></div>
        `;
        
        require('../../static/js/debug_upload.js');
        
        expect(() => {
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }).not.toThrow();
    });
});