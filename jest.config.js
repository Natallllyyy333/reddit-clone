// jest.config.js
module.exports = {
    roots: ['<rootDir>/frontend/tests'],
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: [
        '<rootDir>/frontend/tests/setup.js',
        '<rootDir>/jest.setup.js' // Добавьте эту строку
    ],
    // ... остальная конфигурация
};