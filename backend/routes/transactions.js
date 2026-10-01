const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// ─── GET /api/transactions ────────────────────────────────────────────
// Fetch user's transactions only, sorted by newest first
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, search } = req.query;

    const query = { userId: req.user._id };

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { recipientName: searchRegex },
        { recipientIdentifier: searchRegex },
        { transactionId: searchRegex },
        { description: searchRegex },
      ];
    }

    const transactions = await Transaction.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions.',
    });
  }
});

// ─── DELETE /api/transactions/clear ───────────────────────────────────
// Clear all transactions for the authenticated user
router.delete('/clear', authenticate, async (req, res) => {
  try {
    const result = await Transaction.deleteMany({ userId: req.user._id });
    return res.status(200).json({
      success: true,
      message: 'Transaction history cleared successfully.',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Clear transactions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear transactions.',
    });
  }
});

// ─── GET /api/transactions/:transactionId ─────────────────────────────
// Fetch detailed info for a single transaction (scoped to current user)
router.get('/:transactionId', authenticate, async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({
      transactionId,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or you do not have permission to view it.',
      });
    }

    return res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error('Fetch transaction detail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction details.',
    });
  }
});

module.exports = router;
