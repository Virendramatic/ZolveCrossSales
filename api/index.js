const path = require('path');
const express = require('express');

try {
  const appModule = require('../backend/dist/index.js');
  const app = appModule.app || appModule.default;
  
  if (!app) {
    throw new Error('No app export found in backend module');
  }

  // Serve static files from Frontend/dist
  const frontendPath = path.join(__dirname, '../Frontend/dist');
  app.use(express.static(frontendPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
  
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
