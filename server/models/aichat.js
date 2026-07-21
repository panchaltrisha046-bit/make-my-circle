const mongoose = require('mongoose');

const AIChatSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  title: {
    type: String,
    default: 'New Conversation'
  }
}, { timestamps: true });

// Index for faster queries by user
AIChatSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('AIChat', AIChatSchema);
