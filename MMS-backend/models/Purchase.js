const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
  assetName: { type: String, required: true },
  assetType: { type: String, required: true },
  base: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitCost: { type: Number, required: true },
  totalCost: { type: Number },
  supplier: { type: String, required: true },
  purchaseDate: { type: Date, default: Date.now },
  deliveryDate: { type: Date },
  status: { 
    type: String, 
    enum: ['Ordered', 'Delivered', 'Cancelled'],
    default: 'Ordered'
  },
  purchasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  invoiceNumber: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Calculate total cost before saving
PurchaseSchema.pre('save', function(next) {
  this.totalCost = this.quantity * this.unitCost;
  next();
});

module.exports = mongoose.model('Purchase', PurchaseSchema);