try {
  const appModule = require('../backend/dist/index.js');
  const app = appModule.app || appModule.default;
  
  if (!app) {
    throw new Error('No app export found in backend module');
  }
  
  module.exports = app;
} catch (error) {
  console.error('Failed to load backend app:', error);
  
  // Fallback handler
  module.exports = (req, res) => {
    res.status(503).json({ 
      status: 'error',
      message: 'Backend service unavailable',
      error: error.message 
    });
  };
}
