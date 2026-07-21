import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

console.log("Key from env:", process.env.GEMINI_API_KEY ? "Loaded" : "Not loaded");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: 'salom',
    });
    console.log("Success:", response.text);
  } catch (e) {
    console.error("Error:", e);
  }
}

run();
