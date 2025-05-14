const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['Vehicle', 'Weapon', 'Ammunition', 'Equipment', 'Other']
  },
  base: { type: String, required: true },
  openingBalance: { type: Number, default: 0 },
  closingBalance: { type: Number, default: 0 },
  purchases: { type: Number, default: 0 },
  transferIn: { type: Number, default: 0 },
  transferOut: { type: Number, default: 0 },
  assigned: { type: Number, default: 0 },
  expended: { type: Number, default: 0 },
  available: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Virtual property for net movement
AssetSchema.virtual('netMovement').get(function() {
  return this.purchases + this.transferIn - this.transferOut;
});

// Method to update balances
AssetSchema.methods.updateBalances = function() {
  this.closingBalance = this.openingBalance + this.purchases + this.transferIn - this.transferOut - this.expended;
  this.available = this.closingBalance - this.assigned;
  return this.save();
};

module.exports = mongoose.model('Asset', AssetSchema);
