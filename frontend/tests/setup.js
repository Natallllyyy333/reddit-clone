// frontend/tests/setup.js - УЛУЧШЕННАЯ ВЕРСИЯ
// Jest setup file - используем CommonJS вместо ES6 модулей

// Mock Bootstrap
global.bootstrap = {
    Alert: {
        getOrCreateInstance: jest.fn(() => ({
            close: jest.fn(),
            dispose: jest.fn()
        }))
    },
    Modal: {
        getOrCreateInstance: jest.fn(() => ({
            show: jest.fn(),
            hide: jest.fn(),
            dispose: jest.fn()
        }))
    }
};

// Mock fetch с базовой реализацией
global.fetch = jest.fn(() => 
    Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve('')
    })
);

// Mock console для чистого вывода тестов
// Но оставляем console.error для отладки ошибок
global.console = {
    ...console, // сохраняем оригинальные методы
    log: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
    // error оставляем для видимости реальных ошибок
};

// Mock CSRF token
document.querySelector = jest.fn((selector) => {
    if (selector === '[name=csrfmiddlewaretoken]') {
        return { value: 'test-csrf-token' };
    }
    return null;
});

// Mock для navigator.clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
        readText: jest.fn().mockResolvedValue('')
    },
});

// Mock для document.execCommand (старый способ копирования)
document.execCommand = jest.fn().mockReturnValue(true);

// Mock для window.scrollTo
window.scrollTo = jest.fn();

// Mock для IntersectionObserver (если используется)
global.IntersectionObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}));

// Mock для ResizeObserver (если используется)
global.ResizeObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}));