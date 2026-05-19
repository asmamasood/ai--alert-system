const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent("Hello! Tell me in one word who you are.");
    console.log("Gemini 2.5 flash direct success:", result.response.text().trim());
  } catch (e) {
    console.error("Gemini 2.5 flash direct failed:", e);
  }
}

run();
