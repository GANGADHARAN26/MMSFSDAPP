const ActivityLog = require('../models/ActivityLog');

/**
 * Middleware to log API activities
 */
const logger = async (req, res, next) => {
  // Store the original send function
  const originalSend = res.send;
  
  // Override the send function to log the activity after response is sent
  res.send = function(body) {
    // Call the original send function
    originalSend.call(this, body);
    
    // Only log successful operations (status 2xx)
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      const logActivity = async () => {
        try {
          // Determine action type based on HTTP method
          let action;
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
            default:
              action = req.method;
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
          else resourceType = 'Other';
          
          // Create log entry
          await new ActivityLog({
            user: req.user._id,
            username: req.user.username,
            action,
            resourceType,
            resourceId: req.params.id || (typeof body === 'object' ? body._id : undefined),
            details: {
              method: req.method,
              path: req.path,
              query: req.query,
              body: req.body,
              statusCode: res.statusCode
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            timestamp: new Date()
          }).save();
        } catch (error) {
          console.error('Error logging activity:', error);
        }
      };
      
      // Execute logging asynchronously to not block the response
      logActivity();
    }
    
    return res;
  };
  
  next();
};

module.exports = logger;