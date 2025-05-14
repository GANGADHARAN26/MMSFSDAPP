const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

/**
 * Authentication middleware
 * @param {Array} roles - Array of roles allowed to access the route
 * @param {Boolean} baseSpecific - If true, user can only access resources for their assigned base
 */
const auth = (roles = [], baseSpecific = false) => {
  return async (req, res, next) => {
    try {
      // Check if Authorization header exists
      if (!req.header('Authorization')) {
        throw new Error('Authorization header missing');
      }

      const token = req.header('Authorization').replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.active) {
        throw new Error('User account is inactive');
      }

      // Check if user has required role
      if (roles.length && !roles.includes(user.role)) {
        throw new Error('Insufficient permissions');
      }

      // For base-specific resources, check if user has access to the base
      if (baseSpecific && user.role === 'BaseCommander') {
        const requestedBase = req.body.base || req.query.base;
        
        if (requestedBase && user.assignedBase !== requestedBase) {
          throw new Error('Not authorized to access resources for this base');
        }
      }

      // Set user in request object
      req.user = user;
      req.token = token;
      
      // Update last login time
      user.lastLogin = new Date();
      await user.save();
      
      next();
    } catch (error) {
      // Log authentication failures
      try {
        await new ActivityLog({
          action: 'Authentication',
          resourceType: 'User',
          details: { 
            error: error.message,
            path: req.path,
            method: req.method
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }).save();
      } catch (logError) {
        console.error('Error logging authentication failure:', logError.message);
      }
      
      res.status(401).send({ 
        error: 'Authentication failed', 
        message: error.message || 'Not authorized to access this resource'
      });
    }
  };
};

module.exports = auth;
