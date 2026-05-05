const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  capacity: { type: Number, default: 4 },
  isActive: { type: Boolean, default: true },
  qrCode: { type: String }, // URL or base64
});

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    logo: { type: String },
    coverImage: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    phone: String,
    email: String,
    tables: [tableSchema],
    isOpen: { type: Boolean, default: true },
    currency: { type: String, default: 'INR' },
    taxRate: { type: Number, default: 5 }, // percentage
    offers: [
      {
        code: String,
        discount: Number, // percentage
        maxDiscount: Number,
        minOrder: Number,
        isActive: { type: Boolean, default: true },
        expiresAt: Date,
      },
    ],
    settings: {
      acceptingOrders: { type: Boolean, default: true },
      estimatedPrepTime: { type: Number, default: 20 }, // minutes
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
