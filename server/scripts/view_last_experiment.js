const mongoose = require('mongoose');
require('dotenv').config();
const Experiment = require('./models/Experiment');

async function checkLast() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/geneai');
  const last = await Experiment.findOne().sort({ createdAt: -1 });
  if (last) {
    console.log("TITLE:", last.title);
    console.log("SIMULATION HTML:", last.data.simulation.html);
    console.log("SIMULATION JS:", last.data.simulation.js);
  } else {
    console.log("No experiments found.");
  }
  await mongoose.disconnect();
}

checkLast();
