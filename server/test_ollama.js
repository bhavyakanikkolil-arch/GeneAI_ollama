const { OpenAI } = require("openai");

const openai = new OpenAI({
  baseURL: 'http://127.0.0.1:11434/v1',
  apiKey: 'ollama',
});

async function main() {
  try {
    console.log("Sending request to Ollama...");
    const response = await openai.chat.completions.create({
      model: 'qwen2.5-coder:7b',
      messages: [{ role: 'user', content: 'Respond with a simple JSON object.' }],
      response_format: { type: 'json_object' }
    });
    console.log("Response:", response.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
