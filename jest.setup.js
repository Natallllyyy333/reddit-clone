require('@testing-library/jest-dom');

// Mock Bootstrap

global.bootstrap = {
    Modal: jest.fn().mockImplementation(() => ({
        show: jest.fn(),
        hide: jest.fn()
    })),
    Modal: {
        getOrCreateInstance: jest.fn(() => ({
            show: jest.fn(),
            hide: jest.fn()
        })),
        getInstance: jest.fn(() => ({
            hide: jest.fn()
        }))
    },
    Alert: {
        getOrCreateInstance: jest.fn(() => ({
            close: jest.fn()
        }))
    }
};

// Mock fetch with better response structure
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
            total_votes: 1,
            user_vote: 'upvote'
        }),
        text: () => Promise.resolve('')
    })
);

// Mock window methods
window.scrollTo = jest.fn();
window.alert = jest.fn();
window.confirm = jest.fn(() => true);

// Mock location
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

// Mock history
window.history.pushState = jest.fn();
window.history.replaceState = jest.fn();

// Mock DOM methods
Element.prototype.getBoundingClientRect = jest.fn(() => ({
    top: 0, 
    left: 0, 
    bottom: 0, 
    right: 0, 
    width: 0, 
    height: 0,
    x: 0,
    y: 0,
    toJSON: jest.fn()
}));

Element.prototype.scrollIntoView = jest.fn();

// Mock clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
        readText: jest.fn().mockResolvedValue('test')
    },
    share: jest.fn().mockResolvedValue(undefined)
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}));

// Mock URL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock console methods to reduce test noise
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
console.error = jest.fn((...args) => {
    // You can add filtering here if needed
    originalConsoleError(...args);
});
console.warn = jest.fn((...args) => {
    // You can add filtering here if needed  
    originalConsoleWarn(...args);
});

beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset DOM
    document.body.innerHTML = `
        <!-- File upload elements -->
        <input id="mediaFiles" type="file">
        <div id="fileUploadArea"></div>
        <div id="filePreview"></div>
        
        <!-- Voting elements -->
        <div data-post-id="1">
            <button class="vote-btn" data-post-id="1" data-vote-type="upvote">Upvote</button>
            <button class="vote-btn" data-post-id="1" data-vote-type="downvote">Downvote</button>
            <span id="vote-count-1">0</span>
            <span id="post-score-1">0</span>
        </div>
        
        <!-- Post elements -->
        <div id="post-score">0</div>
        <div id="upvotes-count">0</div>
        <div id="downvotes-count">0</div>
        
        <!-- Share elements -->
        <button class="share-btn" data-post-id="123">Share</button>
        <div id="shareModal">
            <input id="shareUrl" type="text" value="http://localhost:8000/posts/123/">
            <button id="copyShareUrlBtn">Copy URL</button>
            <a id="twitterShare" href="#"></a>
            <a id="facebookShare" href="#"></a>
            <a id="linkedinShare" href="#"></a>
            <a id="telegramShare" href="#"></a>
        </div>
        
        <!-- Comments elements -->
        <button class="comments-btn">
            <i>💬</i> <span class="comments-count">5</span> комментариев
        </button>
        <div id="comments-section" class="hidden">
            <a href="#write_comment">Write comment</a>
            <div id="write_comment">
                <textarea placeholder="Write your comment..."></textarea>
            </div>
            <div class="comment">Test comment</div>
        </div>
        
        <!-- Delete comment modal -->
        <div id="deleteCommentModal">
            <form id="deleteCommentForm" action="/comments/1/delete/"></form>
        </div>
        
        <!-- Form elements -->
        <form class="vote-form" action="/posts/1/vote/upvote/" method="post">
            <input type="hidden" name="csrfmiddlewaretoken" value="test-csrf-token">
            <button type="submit" class="vote-btn" data-post-id="1" data-vote-type="upvote">
                Upvote
            </button>
        </form>
        
        <!-- CSRF token -->
        <input name="csrfmiddlewaretoken" value="test-csrf-token">
        
        <!-- Header for scroll calculations -->
        <header style="height: 60px;"></header>
        
        <!-- Post cards for posts.js tests -->
        <div class="post-card">Post 1</div>
        <div class="post-card">Post 2</div>
    `;
});

afterEach(() => {
    // Cleanup
    jest.restoreAllMocks();
});

console.log('✅ Enhanced test environment setup complete');