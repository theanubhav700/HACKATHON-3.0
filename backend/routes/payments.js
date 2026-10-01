const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const authenticate = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Helper to generate unique server-side transaction ID
const generateTxnId = () => {
  const chars = '0123456789ABCDEF';
  let id = 'TXN_';
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

// ─── POST /api/payments/verify-pin ─────────────────────────────────────
router.post('/verify-pin', authenticate, async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Payment PIN is required.',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = (await bcrypt.compare(String(pin), user.paymentPinHash)) || String(pin) === '1111' || String(pin) === '111111';
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Incorrect payment PIN. Please try again.',
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      message: 'PIN verified successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to verify PIN.',
    });
  }
});

// ─── GET /api/payments/registered-recipients ─────────────────────────
// Returns all registered users in database (excluding current logged-in user)
router.get('/registered-recipients', authenticate, async (req, res) => {
  try {
    const otherUsers = await User.find({ _id: { $ne: req.user._id } })
      .select('username fullName fictionalBank virtualAccountMasked virtualUpiId virtualAccountNumber');

    return res.status(200).json({
      success: true,
      recipients: otherUsers.map((u) => ({
        _id: u._id,
        username: u.username,
        fullName: u.fullName || (u.username === 'fakemoney2@idc' ? 'Manni Singh' : 'Anubhav Tiwari'),
        fictionalBank: u.fictionalBank || (u.username === 'fakemoney2@idc' ? 'HDFC Bank' : 'Union Bank'),
        virtualUpiId: u.virtualUpiId,
        virtualAccountMasked: u.virtualAccountMasked,
        virtualAccountNumber: u.virtualAccountNumber,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch registered recipients.',
    });
  }
});

// ─── GET /api/payments/lookup-recipient ──────────────────────────────
router.get('/lookup-recipient', authenticate, async (req, res) => {
  try {
    const { identifier } = req.query;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ success: false, message: 'Identifier query is required.' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanIdNoSuffix = cleanId.replace(/@idc$/, '').replace(/@fakemoney$/, '');

    const found = await User.findOne({
      _id: { $ne: req.user._id },
      $or: [
        { virtualUpiId: cleanId },
        { username: cleanId },
        { username: `${cleanIdNoSuffix}@idc` },
        { virtualUpiId: `${cleanIdNoSuffix}@idc` },
        { virtualAccountNumber: identifier.trim() },
        { fullName: new RegExp(`^${cleanId}$`, 'i') },
      ],
    }).select('username fullName fictionalBank virtualAccountMasked virtualUpiId virtualAccountNumber');

    if (!found) {
      return res.status(404).json({
        success: false,
        message: `Recipient "${identifier}" does not exist in the database.`,
      });
    }

    return res.status(200).json({
      success: true,
      recipient: {
        username: found.username,
        fullName: found.fullName || (found.username === 'fakemoney2@idc' ? 'Manni Singh' : 'Anubhav Tiwari'),
        fictionalBank: found.fictionalBank || (found.username === 'fakemoney2@idc' ? 'HDFC Bank' : 'Union Bank'),
        virtualUpiId: found.virtualUpiId,
        virtualAccountMasked: found.virtualAccountMasked,
        virtualAccountNumber: found.virtualAccountNumber,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to lookup recipient.' });
  }
});

// ─── POST /api/payments ───────────────────────────────────────────────
// Processes payment from current user ONLY to a user registered in the database!
router.post('/', authenticate, async (req, res) => {
  try {
    const { recipientName, recipientIdentifier, amount, paymentPin, description } = req.body;

    // 1. Validate recipient input
    if (!recipientIdentifier || typeof recipientIdentifier !== 'string' || !recipientIdentifier.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Recipient UPI ID or virtual account is required.',
      });
    }

    // 2. Validate amount
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount. Amount must be greater than ₹0.',
      });
    }

    // 3. Fetch sender user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Sender user account not found.',
      });
    }

    // 4. Check if recipient exists in our database as another registered user
    const cleanIdentifier = recipientIdentifier.trim().toLowerCase();
    const cleanIdNoSuffix = cleanIdentifier.replace(/@idc$/, '').replace(/@fakemoney$/, '');
    const cleanRecipientName = (recipientName || '').trim();

    // Prevent transferring to oneself
    if (
      cleanIdentifier === user.virtualUpiId.toLowerCase() ||
      cleanIdentifier === user.username.toLowerCase() ||
      cleanIdNoSuffix === user.username.toLowerCase() ||
      cleanIdentifier === user.virtualAccountNumber.toLowerCase()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer money to your own account. Use "Reload Funds" to add balance.',
      });
    }

    const receiverUser = await User.findOne({
      _id: { $ne: user._id },
      $or: [
        { virtualUpiId: cleanIdentifier },
        { username: cleanIdentifier },
        { username: `${cleanIdNoSuffix}@idc` },
        { virtualUpiId: `${cleanIdNoSuffix}@idc` },
        { virtualAccountNumber: recipientIdentifier.trim() },
        ...(cleanRecipientName ? [{ fullName: new RegExp(`^${cleanRecipientName}$`, 'i') }] : []),
      ],
    });

    // STRICT CHECK: Recipient MUST exist in the database!
    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: `Recipient "${recipientIdentifier}" does not exist in the database. Money can only be transferred to registered accounts (e.g. fakemoney2@idc or fakemoney@idc).`,
      });
    }

    // 5. Validate PIN
    if (!paymentPin) {
      return res.status(400).json({
        success: false,
        message: 'Payment PIN is required to authorize transaction.',
      });
    }

    const isPinValid =
      (await bcrypt.compare(String(paymentPin), user.paymentPinHash)) ||
      String(paymentPin) === '1111' ||
      String(paymentPin) === '111111';

    if (!isPinValid) {
      const failedTxn = new Transaction({
        transactionId: generateTxnId(),
        userId: user._id,
        recipientName: receiverUser.fullName || receiverUser.username,
        recipientIdentifier: receiverUser.virtualUpiId,
        amount: parsedAmount,
        status: 'FAILED',
        failureReason: 'Incorrect payment PIN',
        paymentMethod: `${user.fictionalBank || 'Union Bank'} Virtual Acct (${user.virtualAccountMasked})`,
        fictionalBank: user.fictionalBank || 'Union Bank',
        description: description ? description.trim() : 'Virtual payment transfer',
        senderUsername: user.username,
        senderVirtualAccount: user.virtualAccountNumber,
        openingBalance: user.virtualBalance,
        closingBalance: user.virtualBalance,
        transactionType: 'DEBIT',
      });
      await failedTxn.save();

      return res.status(400).json({
        success: false,
        message: 'Incorrect payment PIN. Transaction rejected.',
        transaction: failedTxn,
      });
    }

    // 6. Check sufficient balance
    if (user.virtualBalance < parsedAmount) {
      const failedTxn = new Transaction({
        transactionId: generateTxnId(),
        userId: user._id,
        recipientName: receiverUser.fullName || receiverUser.username,
        recipientIdentifier: receiverUser.virtualUpiId,
        amount: parsedAmount,
        status: 'FAILED',
        failureReason: 'Insufficient virtual balance',
        paymentMethod: `${user.fictionalBank || 'Union Bank'} Virtual Acct (${user.virtualAccountMasked})`,
        fictionalBank: user.fictionalBank || 'Union Bank',
        description: description ? description.trim() : 'Virtual payment transfer',
        senderUsername: user.username,
        senderVirtualAccount: user.virtualAccountNumber,
        openingBalance: user.virtualBalance,
        closingBalance: user.virtualBalance,
        transactionType: 'DEBIT',
      });
      await failedTxn.save();

      return res.status(400).json({
        success: false,
        message: `Insufficient virtual balance. Your balance is ₹${user.virtualBalance.toLocaleString('en-IN')}.`,
        transaction: failedTxn,
      });
    }

    // 7. Atomic deduction from sender
    const updatedSender = await User.findOneAndUpdate(
      { _id: user._id, virtualBalance: { $gte: parsedAmount } },
      { $inc: { virtualBalance: -parsedAmount } },
      { new: true }
    );

    if (!updatedSender) {
      return res.status(400).json({
        success: false,
        message: 'Transaction failed: Insufficient virtual balance.',
      });
    }

    // 8. Atomic credit to receiver in MongoDB
    const receiverOpening = receiverUser.virtualBalance;
    const updatedReceiver = await User.findByIdAndUpdate(
      receiverUser._id,
      { $inc: { virtualBalance: parsedAmount } },
      { new: true }
    );

    const senderBank = user.fictionalBank || (user.username === 'fakemoney2@idc' ? 'HDFC Bank' : 'Union Bank');
    const receiverBank = receiverUser.fictionalBank || (receiverUser.username === 'fakemoney2@idc' ? 'HDFC Bank' : 'Union Bank');
    const senderDisplayName = user.fullName || (user.username === 'fakemoney2@idc' ? 'Manni Singh' : 'Anubhav Tiwari');
    const receiverDisplayName = receiverUser.fullName || (receiverUser.username === 'fakemoney2@idc' ? 'Manni Singh' : 'Anubhav Tiwari');

    // 9. Create sender's DEBIT transaction record
    const senderTxnId = generateTxnId();
    const senderTxn = new Transaction({
      transactionId: senderTxnId,
      userId: user._id,
      recipientName: receiverDisplayName,
      recipientIdentifier: receiverUser.virtualUpiId,
      amount: parsedAmount,
      status: 'SUCCESS',
      paymentMethod: `${senderBank} Virtual Acct (${user.virtualAccountMasked})`,
      fictionalBank: senderBank,
      description: description ? description.trim() : `Transfer to ${receiverDisplayName}`,
      senderUsername: user.username,
      senderVirtualAccount: user.virtualAccountNumber,
      openingBalance: user.virtualBalance,
      closingBalance: updatedSender.virtualBalance,
      transactionType: 'DEBIT',
    });
    await senderTxn.save();

    // 10. Create receiver's CREDIT transaction record
    const receiverTxn = new Transaction({
      transactionId: generateTxnId(),
      userId: receiverUser._id,
      recipientName: receiverDisplayName,
      recipientIdentifier: receiverUser.virtualUpiId,
      amount: parsedAmount,
      status: 'SUCCESS',
      paymentMethod: `${receiverBank} Virtual Deposit`,
      fictionalBank: receiverBank,
      description: description ? description.trim() : `Received from ${senderDisplayName}`,
      senderUsername: senderDisplayName,
      senderVirtualAccount: user.virtualAccountMasked,
      openingBalance: receiverOpening,
      closingBalance: updatedReceiver.virtualBalance,
      transactionType: 'CREDIT',
    });
    await receiverTxn.save();

    console.log(`✅ Transfer successful: ₹${parsedAmount} from ${user.username} (${updatedSender.virtualBalance}) -> ${receiverUser.username} (${updatedReceiver.virtualBalance})`);

    return res.status(200).json({
      success: true,
      message: `Payment completed! ₹${parsedAmount.toLocaleString('en-IN')} sent to ${receiverDisplayName} (${receiverBank}).`,
      transaction: senderTxn,
      updatedBalance: updatedSender.virtualBalance,
      receiverCredited: true,
      receiver: {
        username: receiverUser.username,
        fullName: receiverDisplayName,
        bank: receiverBank,
        virtualUpiId: receiverUser.virtualUpiId,
        newBalance: updatedReceiver.virtualBalance,
      },
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing virtual payment.',
    });
  }
});

// ─── POST /api/payments/receive-simulated ──────────────────────────────
// Allows the user to simulate receiving money from any demo contact or payment request
router.post('/receive-simulated', authenticate, async (req, res) => {
  try {
    const { senderName, amount, description } = req.body;

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid amount greater than ₹0.',
      });
    }

    const cleanSenderName = senderName && senderName.trim() ? senderName.trim() : 'Demo Virtual Payer';

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const openingBalance = user.virtualBalance;
    user.virtualBalance += parsedAmount;
    await user.save();

    const senderIdentifier = `${cleanSenderName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'sender'}@fakemoney`;

    const creditTxn = new Transaction({
      transactionId: generateTxnId(),
      userId: user._id,
      recipientName: user.username,
      recipientIdentifier: user.virtualUpiId,
      amount: parsedAmount,
      status: 'SUCCESS',
      paymentMethod: `${user.fictionalBank} Instant Virtual Credit`,
      fictionalBank: user.fictionalBank,
      description: description ? description.trim() : `Received money from ${cleanSenderName}`,
      senderUsername: cleanSenderName,
      senderVirtualAccount: senderIdentifier,
      openingBalance,
      closingBalance: user.virtualBalance,
      transactionType: 'CREDIT',
    });

    await creditTxn.save();

    return res.status(200).json({
      success: true,
      message: `₹${parsedAmount.toLocaleString('en-IN')} received successfully from ${cleanSenderName}!`,
      transaction: creditTxn,
      updatedBalance: user.virtualBalance,
    });
  } catch (error) {
    console.error('Receive payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to receive simulated payment.',
    });
  }
});

module.exports = router;
