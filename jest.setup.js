// jest.setup.js
jest.setTimeout(10000);

// Глобальные моки
beforeEach(() => {
    jest.clearAllMocks();
});