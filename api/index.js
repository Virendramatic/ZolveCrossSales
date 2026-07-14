/**
 * Vercel Serverless Handler
 * Exports the Express app from the compiled backend
 */

// Load and export the backend app directly
const { app } = require('../backend/dist/index.js');

module.exports = app;
