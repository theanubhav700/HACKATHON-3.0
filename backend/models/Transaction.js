const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientName: {
      type: String,
      required: [true, 'Recipient name is required'],
      trim: true,
    },
    recipientIdentifier: {
      type: String,
      required: [true, 'Recipient identifier is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING', 'CANCELLED'],
      default: 'SUCCESS',
    },
    failureReason: {
      type: String,
      default: null,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    fictionalBank: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: 'Virtual payment transfer',
    },
    senderUsername: {
      type: String,
      required: true,
    },
    senderVirtualAccount: {
      type: String,
      required: true,
    },
    openingBalance: {
      type: Number,
    },
    closingBalance: {
      type: Number,
    },
    transactionType: {
      type: String,
      enum: ['DEBIT', 'CREDIT', 'TOPUP_CREDIT'],
      default: 'DEBIT',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
