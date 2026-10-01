const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    fullName: {
      type: String,
      default: '',
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    paymentPinHash: {
      type: String,
      required: [true, 'Payment PIN is required'],
    },
    pinLength: {
      type: Number,
      enum: [4, 6],
      default: 4,
    },
    fictionalBank: {
      type: String,
      required: [true, 'Fictional bank name is required'],
    },
    virtualAccountNumber: {
      type: String,
      required: true,
    },
    virtualAccountMasked: {
      type: String,
      required: true,
    },
    virtualUpiId: {
      type: String,
      required: true,
      unique: true,
    },
    virtualBalance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Virtual balance cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Never expose passwordHash or paymentPinHash in JSON responses
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.paymentPinHash;
  return user;
};

module.exports = mongoose.model('User', userSchema);
