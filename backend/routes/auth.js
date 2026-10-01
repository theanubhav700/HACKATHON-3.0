const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const FICTIONAL_BANKS = [
  'NovaBank',
  'PrimeTrust Bank',
  'UrbanPay Bank',
  'Zenith Digital Bank',
  'Apex Horizon Bank',
  'NeoSphere Bank',
];

// Helper to generate JWT token
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'fake_money_secret_fallback';
  return jwt.sign({ id: userId }, secret, { expiresIn: '7d' });
};

// ─── POST /api/auth/register ──────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const {
      username,
      password,
      confirmPassword,
      initialVirtualBalance,
      paymentPin,
      confirmPaymentPin,
    } = req.body;

    // Validate username
    if (!username || typeof username !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Username is required.',
      });
    }

    const trimmedUsername = username.trim().toLowerCase();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmedUsername)) {
      return res.status(400).json({
        success: false,
        message: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username: trimmedUsername });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username is already taken. Please choose another one.',
      });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and Confirm Password do not match.',
      });
    }

    // Validate initial virtual balance
    const parsedBalance = Number(initialVirtualBalance);
    if (isNaN(parsedBalance) || parsedBalance < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid virtual balance. Must be a non-negative number.',
      });
    }

    if (parsedBalance > 100000) {
      return res.status(400).json({
        success: false,
        message: 'Maximum allowed initial virtual balance is ₹1,00,000.',
      });
    }

    // Validate payment PIN
    if (!paymentPin || !/^\d{4}$|^\d{6}$/.test(String(paymentPin))) {
      return res.status(400).json({
        success: false,
        message: 'Payment PIN must be exactly 4 or 6 numeric digits.',
      });
    }

    if (String(paymentPin) !== String(confirmPaymentPin)) {
      return res.status(400).json({
        success: false,
        message: 'Payment PIN and Confirm PIN do not match.',
      });
    }

    // Randomly assign a fictional bank
    const randomBank = FICTIONAL_BANKS[Math.floor(Math.random() * FICTIONAL_BANKS.length)];
    const randomLast4 = Math.floor(1000 + Math.random() * 9000);
    const virtualAccountNumber = `VIRT-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const virtualAccountMasked = `•••• •••• ${randomLast4}`;
    const virtualUpiId = `${trimmedUsername}@fakemoney`;

    // Hash password and PIN
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const paymentPinHash = await bcrypt.hash(String(paymentPin), saltRounds);

    const newUser = new User({
      username: trimmedUsername,
      passwordHash,
      paymentPinHash,
      pinLength: String(paymentPin).length,
      fictionalBank: randomBank,
      virtualAccountNumber,
      virtualAccountMasked,
      virtualUpiId,
      virtualBalance: parsedBalance,
    });

    await newUser.save();

    const token = generateToken(newUser._id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Fake Money.',
      token,
      user: newUser.toJSON(),
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during account registration. Please try again.',
    });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password.',
      });
    }

    let trimmedUsername = username.trim().toLowerCase();
    if (trimmedUsername === 'fakepayment' || trimmedUsername === 'fakepayment@idc' || trimmedUsername === 'fakemoney') {
      trimmedUsername = 'fakemoney@idc';
    } else if (trimmedUsername === 'fakemoney2' || trimmedUsername === 'fakepayment2') {
      trimmedUsername = 'fakemoney2@idc';
    }
    const user = await User.findOne({ username: trimmedUsername });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    const token = generateToken(user._id);
    const userObj = user.toJSON();
    if (userObj.username === 'fakemoney2@idc') {
      userObj.fictionalBank = userObj.fictionalBank || 'HDFC Bank';
      userObj.fullName = userObj.fullName || 'Manni Singh';
    } else if (userObj.username === 'fakemoney@idc') {
      userObj.fictionalBank = userObj.fictionalBank || 'Union Bank';
      userObj.fullName = userObj.fullName || 'Anubhav Tiwari';
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: userObj,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.',
    });
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────
router.post('/logout', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

module.exports = router;
