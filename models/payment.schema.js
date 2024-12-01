const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be greater than zero'],
  },
  currency: {
    type: String,
    required: true,
    enum: ['usd', 'eur', 'gbp', 'inr', 'aud'], 
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
  },
  stripePaymentId: {
    type: String,
    required: true,
  },
  stripeClientSecret: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
