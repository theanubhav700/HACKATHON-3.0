const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// Helper to format date
const formatReviewDate = (dateInput) => {
  try {
    const date = dateInput ? new Date(dateInput) : new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');

    return `${day} ${month} ${year} • ${strHours}:${minutes} ${ampm}`;
  } catch {
    return 'Recently';
  }
};

// ─── POST /api/feedback ────────────────────────────────────────────────
// Public submission endpoint for Judges Feedback (accepts requests from any external site)
router.post('/', async (req, res) => {
  try {
    const { judgeName, rating, review, category } = req.body;

    if (!judgeName || !judgeName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Judge Name is required.',
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5.',
      });
    }

    if (!review || !review.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Feedback review text is required.',
      });
    }

    const now = new Date();
    const newFeedback = new Feedback({
      judgeName: judgeName.trim(),
      rating: numRating,
      review: review.trim(),
      category: category ? category.trim() : 'IDC Hackathon 3.0',
      formattedDate: formatReviewDate(now),
    });

    await newFeedback.save();

    console.log(`⭐ New Judge Feedback received: ${newFeedback.judgeName} (${newFeedback.rating}★)`);

    return res.status(201).json({
      success: true,
      message: 'Judge feedback saved successfully to MongoDB!',
      feedback: newFeedback,
    });
  } catch (error) {
    console.error('Error saving judge feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save feedback to database.',
      error: error.message,
    });
  }
});

// ─── GET /api/feedback ─────────────────────────────────────────────────
// Fetch all judge feedbacks, sorted by newest first
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });

    const total = feedbacks.length;
    const sum = feedbacks.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0);
    const average = total > 0 ? (sum / total).toFixed(1) : '0.0';
    const fiveStarCount = feedbacks.filter((r) => Number(r.rating) === 5).length;

    return res.status(200).json({
      success: true,
      count: total,
      average,
      fiveStarCount,
      feedbacks,
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch feedbacks.',
      error: error.message,
    });
  }
});

// ─── DELETE /api/feedback/:id ──────────────────────────────────────────
// Delete a specific feedback by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Feedback not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete feedback.',
    });
  }
});

// ─── DELETE /api/feedback ──────────────────────────────────────────────
// Clear all feedbacks
router.delete('/', async (req, res) => {
  try {
    await Feedback.deleteMany({});
    return res.status(200).json({
      success: true,
      message: 'All judge feedbacks cleared.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to clear feedbacks.',
    });
  }
});

module.exports = router;
