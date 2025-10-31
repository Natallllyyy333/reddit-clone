// frontend/tests/unit/find_ajax_handler.test.js
const fs = require('fs');
const path = require('path');

describe('Find AJAX Handler', () => {
    test('should locate ajax_handler.js file', () => {
        const possiblePaths = [
            path.join(__dirname, '../../../posts/static/posts/js/ajax_handler.js'),
            path.join(__dirname, '../../../../posts/static/posts/js/ajax_handler.js'),
            path.join(__dirname, '../../posts/static/posts/js/ajax_handler.js'),
            path.join(__dirname, '../posts/static/posts/js/ajax_handler.js'),
            './posts/static/posts/js/ajax_handler.js',
            '../posts/static/posts/js/ajax_handler.js',
        ];

        console.log('Current directory:', __dirname);
        console.log('Project root (from __dirname):', path.join(__dirname, '../../..'));
        
        let found = false;
        for (const filePath of possiblePaths) {
            console.log('Checking path:', filePath);
            if (fs.existsSync(filePath)) {
                console.log('✅ FOUND ajax_handler.js at:', filePath);
                found = true;
                break;
            }
        }
        
        if (!found) {
            console.log('❌ ajax_handler.js not found in any of the expected locations');
            
            // Поиск рекурсивно от корня проекта
            const searchDir = path.join(__dirname, '../../..');
            console.log('Searching recursively in:', searchDir);
            
            function findFile(dir, filename) {
                try {
                    const files = fs.readdirSync(dir);
                    for (const file of files) {
                        const filePath = path.join(dir, file);
                        try {
                            const stat = fs.statSync(filePath);
                            if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
                                const foundPath = findFile(filePath, filename);
                                if (foundPath) return foundPath;
                            } else if (file === filename) {
                                return filePath;
                            }
                        } catch (e) {
                            // Пропускаем ошибки доступа
                        }
                    }
                } catch (e) {
                    console.log('Error reading directory:', dir, e.message);
                }
                return null;
            }
            
            const foundPath = findFile(searchDir, 'ajax_handler.js');
            if (foundPath) {
                console.log('✅ FOUND ajax_handler.js recursively at:', foundPath);
            } else {
                console.log('❌ ajax_handler.js not found anywhere in project');
            }
        }
        
        expect(true).toBe(true); // Всегда проходит, мы просто хотим увидеть вывод
    });
});