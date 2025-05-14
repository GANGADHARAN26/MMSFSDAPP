/**
 * Middleware to restrict access based on user's assigned base
 */
const baseAccess = async (req, res, next) => {
  try {
    // Skip for admin users - they have access to all bases
    if (req.user.role === 'Admin') {
      return next();
    }
    
    // For BaseCommander and LogisticsOfficer, check base access
    const requestedBase = req.body.base || req.query.base || req.params.base;
    
    // If no base is specified in the request, allow access
    if (!requestedBase) {
      return next();
    }
    
    // For BaseCommander, they can only access their assigned base
    if (req.user.role === 'BaseCommander' && req.user.assignedBase !== requestedBase) {
      return res.status(403).send({ 
        error: 'Access denied', 
        message: 'You do not have permission to access resources for this base' 
      });
    }
    
    // For LogisticsOfficer, they might have access to multiple bases or all bases
    // This would depend on your specific requirements
    
    next();
  } catch (error) {
    res.status(500).send({ error: 'Server error', message: error.message });
  }
};

module.exports = baseAccess;