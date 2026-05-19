const { OpenAI } = require("openai");

const openai = new OpenAI({
  baseURL: 'http://127.0.0.1:11434/v1',
  apiKey: 'ollama', // required but unused by ollama
});

const generateExperimentContent = async (topic, difficulty = "Intermediate", customInstructions = "") => {
  const prompt = `You are an expert Virtual Lab Experiment Creator and Educational Content Developer.
The user has requested a new virtual lab experiment on the overall topic: "${topic}".
Difficulty level: "${difficulty}".
They have provided the following specific prompt and instructions: "${customInstructions || 'None'}".

CRITICAL INSTRUCTION: You must base the entire scope, depth, and content of this experiment on the user's prompt and the requested difficulty level.

Output the response strictly as a JSON object with the exact following structure:
{
  "title": "A concise, clear title for the experiment",
  "aim": "A 1-2 sentence description of the objective and outcome of the experiment.",
  "theory": "HTML formatted theory content. Use <h4> for main sections, <h5> for subsections, <p> for paragraphs, and <ul>/<li> for lists. Use <b> for emphasis. Provide comprehensive background knowledge.",
  "procedure": [
    "Step 1: Description of first step (Plain text ONLY)",
    "Step 2: Description of second step",
    "- Substep details"
  ],
  "preTest": [
    {
      "question": "Question text to test prerequisite knowledge?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 2,
      "explanation": "Brief explanation of why this is correct."
    }
  ],
  "postTest": [
    {
      "question": "Question text to test knowledge gained from the experiment?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "Brief explanation of why this is correct."
    }
  ],
  "simulation": {
    "html": "Valid HTML elements for the interactive simulation. Must include a container with a class 'sim-workspace'. Inside, provide a 'control-panel' div and a 'display-area' div. Do not include html, head, or body tags. Avoid using inline event handlers like onclick.",
    "css": "Valid CSS styling for the simulation elements. Focus on a modern, premium look (glassmorphism, soft gradients, rounded corners). Ensure all interactive elements have hover and active states.",
    "js": "Valid JavaScript logic to make the simulation fully interactive. You MUST implement the actual logic described in the procedure. Hook up inputs/buttons in the control-panel to update the display-area. Use clean, event-driven JS (e.g., use addEventListener instead of inline onclick attributes). Do not include script tags."
  },
  "references": [
    "Author(s): Title of resource. Publisher/URL, Year."
  ]
}

CRITICAL INSTRUCTIONS:
1. Provide exactly 6 questions in the preTest and 6 questions in the postTest.
2. The "theory" field must ONLY contain valid HTML string. Do not use Markdown in the theory field.
3. The "procedure" and "references" must be pure PLAIN TEXT. NO markdown formatting.
4. The "simulation" fields must generate a REAL, WORKING simulation. Do not just put placeholders. The HTML must have actual controls (inputs, buttons) and the JS must make them work.
5. Output pure valid JSON structure starting with {. Do not include any Markdown formatting blocks (e.g. \`\`\`json) in your response.`;

  const response = await openai.chat.completions.create({
    model: 'qwen2.5-coder:7b',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });

  let text = response.choices[0].message.content;

  // Robust JSON Extraction: Find the search start from the first '{' and end at the last '}'
  const startIdx = text.indexOf('{');
  const endIdx = text.lastIndexOf('}');

  if (startIdx === -1 || endIdx === -1) {
    console.error("AI Response does not contain valid JSON structure:", text);
    throw new Error("AI failed to return a valid structured response. Please try again.");
  }

  text = text.substring(startIdx, endIdx + 1);

  try {
    return JSON.parse(text);
  } catch (parseError) {
    console.error("Failed to parse AI response as JSON:", text);
    throw new Error("AI output was malformed. Please try a different topic or instructions.");
  }
};

const answerChatQuestion = async (topic, question) => {
  const prompt = `You are a helpful AI assistant helping a student understand a presentation on "${topic}". 
  The student asks: "${question}"
  Provide a clear, educational, and encouraging answer. Keep it concise.
  CRITICAL: DO NOT use markdown like **bold**, *italics*, or lists. Output pure plain text ONLY.`;

  const response = await openai.chat.completions.create({
    model: 'qwen2.5-coder:7b',
    messages: [{ role: 'user', content: prompt }]
  });

  let text = response.choices[0].message.content;
  // Strip any accidental markdown bold or italics
  return text.replace(/\*\*/g, '').replace(/\*/g, '').trim();
};

module.exports = { generateExperimentContent, answerChatQuestion };
