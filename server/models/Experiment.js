const mongoose = require('mongoose');

const experimentSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    data: { type: Object }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Experiment', experimentSchema);
