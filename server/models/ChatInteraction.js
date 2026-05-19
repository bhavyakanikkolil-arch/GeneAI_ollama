const mongoose = require('mongoose');

const chatInteractionSchema = mongoose.Schema(
  {
    topic: { type: String, required: true },
    userMessage: { type: String, required: true },
    aiResponse: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatInteraction', chatInteractionSchema);
