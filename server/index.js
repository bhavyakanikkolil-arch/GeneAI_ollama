require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const Experiment = require("./models/Experiment");
const ChatInteraction = require("./models/ChatInteraction");
const { generateExperimentContent, answerChatQuestion } = require("./services/aiService");

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// API Routes
app.post("/api/generate-experiment", async (req, res) => {
  try {
    const { topic, difficulty = "Intermediate", customInstructions = "" } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, message: "Topic is required" });
    }
    
    // Generate content using OpenAI
    const experimentData = await generateExperimentContent(topic, difficulty, customInstructions);
    
    // Save to database
    const experiment = new Experiment({ 
      title: experimentData.title || topic, 
      description: experimentData.aim || "Generated Experiment", 
      data: experimentData 
    });
    await experiment.save();
    
    res.status(201).json({
      success: true,
      message: "Experiment generated and saved successfully",
      experiment
    });
  } catch (error) {
    console.error("Error generating experiment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Chat AI Route
app.post("/api/chat", async (req, res) => {
  try {
    const { topic, question } = req.body;
    if (!topic || !question) {
      return res.status(400).json({ success: false, message: "Topic and question are required" });
    }
    
    // Generate chat response
    const answer = await answerChatQuestion(topic, question);
    
    // Save to DB for analytics tracking
    const interaction = new ChatInteraction({ topic, userMessage: question, aiResponse: answer });
    await interaction.save();
    
    res.status(200).json({ success: true, answer });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Analytics Route for Teacher Dashboard
app.get("/api/analytics", async (req, res) => {
  try {
    const experimentsList = await Experiment.find().sort({ createdAt: -1 }).limit(10);
    const chatsList = await ChatInteraction.find().sort({ createdAt: -1 }).limit(10);
    
    res.status(200).json({
      success: true,
      stats: {
        experiments: experimentsList,
        chats: chatsList
      }
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
