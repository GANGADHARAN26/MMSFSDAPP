const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  assetName: { type: String, required: true },
  assetType: { type: String, required: true },
  base: { type: String, required: true },
  quantity: { type: Number, required: true },
  assignedTo: { 
    name: { type: String, required: true },
    rank: { type: String, required: true },
    id: { type: String, required: true }
  },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  purpose: { type: String, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: { 
    type: String, 
    enum: ['Active', 'Returned', 'Lost', 'Damaged'],
    default: 'Active'
  },
  returnedQuantity: { type: Number, default: 0 },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', AssignmentSchema);