const express = require('express');
const rateLimitMiddleware = require('./security/middleware/rateLimit');
const helmetMiddleware = require('./security/middleware/helmet');
const corsMiddleware = require('./security/middleware/cors');
const performanceMonitor = require('./security/monitoring/performance');

const app = express();

// Apply security middleware
app.use(rateLimitMiddleware);
app.use(helmetMiddleware);
app.use(corsMiddleware);

// Initialize performance monitoring
const observer = performanceMonitor.observe();

// Example route with performance monitoring
app.get('/api/resource', (req, res) => {
  performanceMonitor.start('resource-fetch');
  
  // Your route logic here
  
  performanceMonitor.end('resource-fetch');
  res.send('Resource data');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;
