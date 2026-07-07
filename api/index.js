// Import the Express app from the compiled backend
const backend = require('../backend/dist/index.js');
const app = backend.app;

// Export the app for Vercel's serverless runtime
module.exports = app;
