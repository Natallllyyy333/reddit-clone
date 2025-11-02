// =============================================
// Mock for Bootstrap
// =============================================
global.bootstrap = {
    Modal: {
        getOrCreateInstance: jest.fn((element) => ({
            show: jest.fn(),
            hide: jest.fn(),
            dispose: jest.fn(),
            _element: element
        })),
        getInstance: jest.fn(() => ({
            hide: jest.fn()
        }))
    },
    Alert: {
        getOrCreateInstance: jest.fn((element) => ({
            close: jest.fn(),
            dispose: jest.fn(),
            _element: element
        }))
    }
};

// =============================================
// Mock for fetch
// =============================================
global.fetch = jest.fn(() => 
    Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({ 
            success: true, 
            score: 5, 
            upvotes: 3, 
            downvotes: 2,
            user_vote: 'upvote'
        }),
        text: () => Promise.resolve('')
    })
);

// =============================================
// Mock for window and DOM API
// =============================================
window.scrollTo = jest.fn();

Object.defineProperty(window, 'scrollX', { value: 0 });
Object.defineProperty(window, 'scrollY', { value: 0 });
Object.defineProperty(window, 'pageYOffset', { value: 0 });

Element.prototype.getBoundingClientRect = jest.fn(() => ({
    top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0
}));

// =============================================
// Mock for Clipboard API
// =============================================
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
    }
});

// =============================================
// Mock for остальных API
// =============================================
global.IntersectionObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}));

global.ResizeObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}));

// Mock for matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
    })),
});

// Mock for URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

// =============================================
// Mock for History API
// =============================================
window.history.pushState = jest.fn();
window.history.replaceState = jest.fn();

// Mock for location
delete window.location;
window.location = {
    href: 'http://localhost:8000/',
    origin: 'http://localhost:8000',
    pathname: '/',
    search: '',
    hash: '',
    assign: jest.fn(),
    reload: jest.fn()
};

// =============================================
// Mock for CSRF token
// =============================================
const originalQuerySelector = document.querySelector;
document.querySelector = jest.fn((selector) => {
    if (selector === '[name=csrfmiddlewaretoken]') {
        return { value: 'test-csrf-token' };
    }
    // for for all other selectors, we use the original implementation
    return originalQuerySelector.call(document, selector);
});

console.log('✅ Clean test environment setup complete');