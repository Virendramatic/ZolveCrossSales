const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Determine frontend path - try multiple locations
let frontendPath = path.join(__dirname, '../Frontend/dist');
if (!fs.existsSync(frontendPath)) {
  frontendPath = path.join(__dirname, 'Frontend/dist');
}
if (!fs.existsSync(frontendPath)) {
  frontendPath = path.join(process.cwd(), 'Frontend/dist');
}

console.log('Frontend path:', frontendPath);
console.log('Frontend path exists:', fs.existsSync(frontendPath));
console.log('Index.html exists:', fs.existsSync(path.join(frontendPath, 'index.html')));

// Serve static files with proper MIME types
app.use(express.static(frontendPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'text/javascript');
    } else if (path.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    }
  }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes - try to load from compiled backend
try {
  console.log('Loading API routes from backend/dist...');
  
  try {
    const backendApp = require('../backend/dist/index.js').app;
    if (backendApp) {
      console.log('Successfully loaded full backend app');
      app.use(backendApp);
    }
  } catch (e) {
    console.warn('Could not load full backend app:', e.message);
    
    try {
      const authRoutes = require('../backend/dist/routes/auth.routes.js').default;
      const leadRoutes = require('../backend/dist/routes/lead.routes.js').default;
      const educationLoanRoutes = require('../backend/dist/routes/education-loan.routes.js').default;
      
      app.use('/api/auth', authRoutes);
      app.use('/api/leads', leadRoutes);
      app.use('/api/loans', educationLoanRoutes);
      
      console.log('Successfully loaded individual API routes');
    } catch (err) {
      console.warn('Could not load individual routes:', err.message);
    }
  }
} catch (error) {
  console.error('Error setting up API routes:', error.message);
}

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'API endpoint not found',
    },
  });
});

// SPA fallback - serve index.html for all routes
app.use((req, res) => {
  const indexPath = path.join(frontendPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Frontend not found', path: indexPath });
  }
});

module.exports = app;
