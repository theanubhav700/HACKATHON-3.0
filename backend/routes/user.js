const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const authenticate = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Helper to generate transaction ID
const generateTxnId = () => {
  const chars = '0123456789ABCDEF';
  let id = 'TXN_';
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

// ─── GET /api/user/profile ─────────────────────────────────────────────
router.get('/profile', authenticate, async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user.toJSON(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.',
    });
  }
});

// ─── GET /api/user/balance ─────────────────────────────────────────────
router.get('/balance', authenticate, async (req, res) => {
  try {
    // Always fetch fresh balance from database
    const freshUser = await User.findById(req.user._id);
    if (!freshUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      virtualBalance: freshUser.virtualBalance,
      fictionalBank: freshUser.fictionalBank || (freshUser.username === 'fakemoney2@idc' ? 'HDFC Bank' : 'Union Bank'),
      virtualAccountMasked: freshUser.virtualAccountMasked,
      virtualAccountNumber: freshUser.virtualAccountNumber,
      virtualUpiId: freshUser.virtualUpiId,
      username: freshUser.username,
      fullName: freshUser.fullName || (freshUser.username === 'fakemoney2@idc' ? 'Manni Singh' : 'Anubhav Tiwari'),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch virtual balance.',
    });
  }
});

// ─── PATCH /api/user/password ─────────────────────────────────────────
router.patch('/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match.',
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.',
      });
    }

    const saltRounds = 10;
    user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    console.error('Password update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating password.',
    });
  }
});

// ─── PATCH /api/user/pin ──────────────────────────────────────────────
router.patch('/pin', authenticate, async (req, res) => {
  try {
    const { currentPin, newPin, confirmNewPin } = req.body;

    if (!currentPin || !newPin) {
      return res.status(400).json({
        success: false,
        message: 'Current PIN and new PIN are required.',
      });
    }

    if (!/^\d{4}$|^\d{6}$/.test(String(newPin))) {
      return res.status(400).json({
        success: false,
        message: 'New PIN must be 4 or 6 numeric digits.',
      });
    }

    if (String(newPin) !== String(confirmNewPin)) {
      return res.status(400).json({
        success: false,
        message: 'New PIN and confirmation do not match.',
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(String(currentPin), user.paymentPinHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current payment PIN.',
      });
    }

    const saltRounds = 10;
    user.paymentPinHash = await bcrypt.hash(String(newPin), saltRounds);
    user.pinLength = String(newPin).length;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Payment PIN updated successfully.',
    });
  } catch (error) {
    console.error('PIN update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating PIN.',
    });
  }
});

// ─── POST /api/user/add-virtual-funds ──────────────────────────────────
// Allows the user to reload virtual funds for demo testing up to ₹1,00,000 maximum cap
router.post('/add-virtual-funds', authenticate, async (req, res) => {
  try {
    const { amount, paymentPin } = req.body;
    const parsedAmount = Number(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid positive virtual amount.',
      });
    }

    // Verify PIN for reload security
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(String(paymentPin), user.paymentPinHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect payment PIN.',
      });
    }

    if (user.virtualBalance + parsedAmount > 100000) {
      return res.status(400).json({
        success: false,
        message: `Adding ₹${parsedAmount.toLocaleString('en-IN')} would exceed the maximum demo virtual balance limit of ₹1,00,000 (Current: ₹${user.virtualBalance.toLocaleString('en-IN')}).`,
      });
    }

    const openingBalance = user.virtualBalance;
    user.virtualBalance += parsedAmount;
    await user.save();

    // Create topup transaction
    const transaction = new Transaction({
      transactionId: generateTxnId(),
      userId: user._id,
      recipientName: 'Virtual Demo Wallet Top-Up',
      recipientIdentifier: user.virtualUpiId,
      amount: parsedAmount,
      status: 'SUCCESS',
      paymentMethod: `${user.fictionalBank} Virtual Deposit`,
      fictionalBank: user.fictionalBank,
      description: 'Reloaded virtual testing balance',
      senderUsername: 'System Virtual Vault',
      senderVirtualAccount: 'SYSTEM-RELOAD',
      openingBalance,
      closingBalance: user.virtualBalance,
      transactionType: 'TOPUP_CREDIT',
    });

    await transaction.save();

    return res.status(200).json({
      success: true,
      message: `₹${parsedAmount.toLocaleString('en-IN')} virtual funds added successfully.`,
      virtualBalance: user.virtualBalance,
      transaction,
    });
  } catch (error) {
    console.error('Add virtual funds error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add virtual funds.',
    });
  }
});

module.exports = router;
