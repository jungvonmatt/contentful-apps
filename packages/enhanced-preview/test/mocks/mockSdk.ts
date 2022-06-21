const mockSdk: any = {
  app: {
    onConfigure: jest.fn(),
    getParameters: jest.fn().mockReturnValueOnce({}),
    setReady: jest.fn(),
    getCurrentState: jest.fn(),
  },
  ids: {
    app: 'test-app'
  },
  locales: {
    default: 'en'
  },
  window: {
    startAutoResizer:jest.fn(),
    stopAutoResizer:jest.fn()
  }
};

export { mockSdk };
