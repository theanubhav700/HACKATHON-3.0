const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    judgeName: {
      type: String,
      required: [true, 'Judge name is required'],
      trim: true,
      default: 'Anonymous Judge',
    },
    judgeEmail: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
      default: 5,
    },
    review: {
      type: String,
      required: [true, 'Review feedback is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'IDC Hackathon 3.0',
    },
    formattedDate: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
