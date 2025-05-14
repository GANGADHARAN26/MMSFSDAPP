const mongoose = require('mongoose');

const ExpenditureSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  assetName: { type: String, required: true },
  assetType: { type: String, required: true },
  base: { type: String, required: true },
  quantity: { type: Number, required: true },
  reason: { 
    type: String, 
    enum: ['Training', 'Operation', 'Maintenance', 'Damaged', 'Lost', 'Other'],
    required: true
  },
  authorizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expendedBy: { 
    name: { type: String, required: true },
    rank: { type: String, required: true },
    id: { type: String, required: true }
  },
  operationName: { type: String },
  expenditureDate: { type: Date, default: Date.now },
  location: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expenditure', ExpenditureSchema);