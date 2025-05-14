const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String },
  action: { 
    type: String, 
    enum: ['Create', 'Update', 'Delete', 'Login', 'Logout', 'Transfer', 'Purchase', 'Assignment', 'Expenditure', 'Authentication', 'Failed Login'],
    required: true
  },
  resourceType: { 
    type: String, 
    enum: ['Asset', 'User', 'Transfer', 'Purchase', 'Assignment', 'Expenditure'],
    required: true
  },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: Object },
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);