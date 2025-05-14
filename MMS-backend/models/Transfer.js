const mongoose = require('mongoose');

const TransferSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  assetName: { type: String, required: true },
  assetType: { type: String, required: true },
  fromBase: { type: String, required: true },
  toBase: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  transferredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transfer', TransferSchema);
