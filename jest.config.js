module.exports = {
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/frontend/tests'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    collectCoverageFrom: [
        'frontend/static/js/**/*.js',
        'posts/static/posts/js/**/*.js',
        '!frontend/static/js/debug_*.js',
        '!**/node_modules/**'
    ],
    coverageThreshold: {
        global: {
            branches: 60,
            functions: 60,
            lines: 60,
            statements: 60
        }
    },
    testMatch: [
        '**/__tests__/**/*.js',
        '**/?(*.)+(spec|test).js'
    ],
    moduleFileExtensions: ['js', 'json'],
    transform: {}
};