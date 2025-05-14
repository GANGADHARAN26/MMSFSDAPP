/**
 * API Logger Middleware
 * 
 * This middleware logs all API requests and responses.
 * It uses Winston for logging and also saves activity logs to the database.
 */

const ActivityLog = require('../models/ActivityLog');
const logger = require('../utils/logger');

/**
 * Middleware to log API requests and responses
 */
const apiLogger = async (req, res, next) => {
  const startTime = new Date();
  
  // Log request
  logger.http({
    message: `API Request: ${req.method} ${req.originalUrl}`,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    userId: req.user ? req.user._id : 'unauthenticated',
    username: req.user ? req.user.username : 'unauthenticated',
    body: req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' 
      ? JSON.stringify(req.body) 
      : undefined
  });
  
  // Store the original send function
  const originalSend = res.send;
  
  // Override the send function to log the response
  res.send = function(body) {
    const responseTime = new Date() - startTime;
    
    // Call the original send function
    originalSend.call(this, body);
    
    // Parse response body if it's JSON
    let parsedBody;
    try {
      parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
    } catch (e) {
      parsedBody = body;
    }
    
    // Log response
    logger.http({
      message: `API Response: ${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms`,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      responseSize: Buffer.byteLength(body, 'utf8'),
      userId: req.user ? req.user._id : 'unauthenticated',
      username: req.user ? req.user.username : 'unauthenticated'
    });
    
    // Log errors with more detail
    if (res.statusCode >= 400) {
      const logLevel = res.statusCode >= 500 ? 'error' : 'warn';
      logger[logLevel]({
        message: `API Error: ${req.method} ${req.originalUrl} ${res.statusCode}`,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        error: parsedBody.error || parsedBody.message || 'Unknown error',
        userId: req.user ? req.user._id : 'unauthenticated',
        username: req.user ? req.user.username : 'unauthenticated',
        stack: parsedBody.stack
      });
    }
    
    // Log to ActivityLog model for authenticated requests
    if (req.user) {
      const logActivity = async () => {
        try {
          // Determine action type based on HTTP method and status code
          let action;
          if (res.statusCode >= 400) {
            action = 'Error';
          } else {
            switch (req.method) {
              case 'POST':
                action = 'Create';
                break;
              case 'PUT':
              case 'PATCH':
                action = 'Update';
                break;
              case 'DELETE':
                action = 'Delete';
                break;
              case 'GET':
                action = 'Read';
                break;
              default:
                action = req.method;
            }
          }
          
          // Determine resource type from the URL path
          const path = req.path.toLowerCase();
          let resourceType;
          
          if (path.includes('asset')) resourceType = 'Asset';
          else if (path.includes('user')) resourceType = 'User';
          else if (path.includes('transfer')) resourceType = 'Transfer';
          else if (path.includes('purchase')) resourceType = 'Purchase';
          else if (path.includes('assignment')) resourceType = 'Assignment';
          else if (path.includes('expenditure')) resourceType = 'Expenditure';
          else if (path.includes('auth/login')) {
            resourceType = 'User';
            action = res.statusCode >= 400 ? 'Failed Login' : 'Login';
          }
          else if (path.includes('auth/logout')) {
            resourceType = 'User';
            action = 'Logout';
          }
          else resourceType = 'Other';
          
          // Create log entry
          await new ActivityLog({
            user: req.user._id,
            username: req.user.username,
            action,
            resourceType,
            resourceId: req.params.id || (parsedBody && parsedBody._id ? parsedBody._id : undefined),
            details: {
              method: req.method,
              path: req.path,
              query: req.query,
              body: req.body,
              statusCode: res.statusCode,
              responseTime,
              response: res.statusCode >= 400 ? parsedBody : undefined
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            timestamp: new Date()
          }).save();
        } catch (error) {
          logger.error({
            message: 'Error logging activity to database',
            error: error.message,
            stack: error.stack
          });
        }
      };
      
      // Execute logging asynchronously to not block the response
      logActivity();
    }
    
    return res;
  };
  
  next();
};

module.exports = apiLogger;