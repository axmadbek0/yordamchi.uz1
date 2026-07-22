/**
 * Yordamchi.uz - Backend API Server
 * Express + Google Gemini AI Service
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Gemini API Client safely (Lazy Initialization)
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARN: GEMINI_API_KEY environment variable is not set. Using mock fallbacks.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: apiKey || 'MOCK_KEY',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClient;
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Yordamchi.uz Backend API' });
});

// ==========================================
// API Endpoints for AI Integrations
// ==========================================

/**
 * Endpoint to analyze student daily report and generate parent feedback
 */
app.post('/api/ai/analyze-status', async (req, res) => {
  const { fullName, mood, health, teacherNote } = req.body;

  if (!fullName || !mood || !health || !teacherNote) {
    return res.status(400).json({ error: "Missing required fields in status logs." });
  }

  try {
    const ai = getGeminiClient();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      throw new Error("Missing API Key");
    }

    const prompt = `
      O'quvchining ismi: ${fullName}
      Bugungi umumiy kayfiyati: ${mood}
      Salomatlik holati: ${health}
      O'qituvchining yozgan kunlik izohi: "${teacherNote}"

      Vazifa: Ushbu ma'lumotlar asosida, bolaning ota-onasi uchun maxsus, samimiy va tushunarli tahliliy hisobot yarating.
      
      Talablar:
      1. Hisobot mutlaqo o'zbek tilida (lotin yozuvida), juda yumshoq, dalda beruvchi va tushunarli tilda bo'lishi lozim.
      2. Ota-onani asabiylashtiradigan yoki xavotirga soladigan "muammo", "klinik kasallik" kabi so'zlardan qoching. Buning o'rniga bolaning kuchli tomonlarini rag'batlantiring.
      3. Bugungi kayfiyat va o'qituvchi izohini sharhlang.
      4. Uy sharoitida ota-ona bajarishi mumkin bo'lgan sodda, amaliy va qisqa rivojlantiruvchi o'yin yoki psixologik mashg'ulot tavsiya qiling.
      5. Hisobot hajmi 3-4 gapdan oshmasin.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        systemInstruction: { parts: [{ text: "Siz imkoniyati cheklangan (aqli zaif, Daun sindromi, autizm, daun) bolalar bilan ishlaydigan professional maktab-internati bolalar psixologi va oliy toifali pedagogisiz. Ota-onalarga farzandining holatiga mos iliq va xavotirsiz yo'l-yo'riq berasiz." }] }
      }
    });

    const analysisText = response.text;
    res.json({ analysis: analysisText });

  } catch (error) {
    console.error("AI Status analysis error, using fallback template:", error);
    let fallbackText = '';
    if (mood === 'xursand') {
      fallbackText = `${fullName} bugun juda ko‘tarinki kayfiyatda edi, bu uning ijtimoiy faolligiga va yangi ko‘nikmalarni o‘zlashtirishiga ajoyib zamin yaratdi. Salomatligi (${health}) holatda bo‘lgani barcha mashg‘ulotlarni mukammal bajarishga imkon berdi. Tavsiya: Bugun uyda u bilan birgalikda o‘yin o‘ynang va bugungi yutuqlari uchun uni albatta maqtab daldalang.`;
    } else if (mood === 'oddiy') {
      fallbackText = `${fullName} bugun darslarda xotirjam va barqaror qatnashdi. Salomatligi (${health}) yaxshi darajada bo‘lib, darslarni o‘zlashtirishda jiddiy to‘siqlar kuzatilmadi. Tavsiya: Kechqurun oilaviy muhitda sokin ertak o‘qish yoki birgalikda rangli qalamlarda rasm chizish emotsional bog‘liqlikni yanada kuchaytiradi.`;
    } else if (mood === 'tashvishli') {
      fallbackText = `${fullName} bugun dars davomida bir oz xavotir yoki sensor bezovtalik his qildi, bu sinfdagi yangi vaziyatlar yoki tashqi tovushlar sababli bo‘lishi mumkin. O‘qituvchi tomonidan tinchlantirildi. Tavsiya: Uyda sensor yuklanishlarni kamaytiring (tinch musiqa eshittiring, gadjetlarni cheklang), bolani bag‘ringizga bosib u bilan samimiy suhbatlashing.`;
    } else {
      fallbackText = `${fullName} bugun haftalik o‘quv rejasi va darslar natijasida bir oz charchagan ko‘rinadi. Sog‘lig‘i (${health}) joyida. Tavsiya: Uyda bolaning to‘yib uxlashini ta’minlang, ortiqcha intellektual yuklamalar bermay, dam olish kunini sokin oila davrasida o‘tkazishga harakat qiling.`;
    }
    res.json({ analysis: fallbackText });
  }
});

/**
 * Special education AI chatbot assistant for parents
 */
app.post('/api/ai/chat', async (req, res) => {
  const { message, history, studentName, studentClass } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message input is required." });
  }

  try {
    const ai = getGeminiClient();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      throw new Error("Missing API Key");
    }

    const systemInstruction = `
      Siz "Yordamchi.uz" platformasining maxsus pedagogika, Daun sindromi, aqli zaiflik va bolalar psixologiyasi bo'yicha professional sun'iy intellekt maslahatchisiz.
      Siz bilan muloqot qilayotgan shaxs - ${studentName || 'bola'} ismli bolaning ota-onasi (sinfi: ${studentClass || 'maxsus guruh'}).
      
      Talablar:
      1. Doimo o'ta samimiy, tushunarli, dalda beruvchi va sabr-toqatli ohangda o'zbek tilida (lotin yozuvida) javob bering.
      2. Savollarga ham ilmiy-pedagogik, ham amaliy jihatdan uydagi mashqlar bilan javob bering (plastilin, rasm chizish, qum terapiyasi, sensor o'yinlar, nafas olish mashqlari).
      3. Ota-onani doimo qo'llab-quvvatlang.
      4. Tibbiy tashxis qo'ymang.
      5. Javobingiz juda uzoq bo'lmasin (2-3 ta ixcham xatboshi).
    `;

    let formattedContents: any[] = [];
    if (history && history.length > 0) {
      formattedContents = history.map((item: any) => ({
        role: item.role === 'user' ? 'user' : 'model',
        parts: [{ text: item.parts[0].text }]
      }));
    }

    formattedContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction: { parts: [{text: systemInstruction}] },
        temperature: 0.7
      }
    });

    res.json({ reply: response.text });

  } catch (error) {
    console.error("AI Chat error, using fallback template:", error);
    let reply = "Tushunaman, maxsus parvarish va tarbiya jarayonida bunday holatlar uchrashi tabiiy. Bolaning mayda motorika ko‘nikmalarini va nutq faolligini oshirish uchun uyda plastilin bilan shakllar yasash, donli mahsulotlarni saralash kabi sensor mashqlarni birgalikda bajaring. Eng muhimi, farzandingiz har bir kichik yutug‘ida ham uni quchoqlab, shirin so‘zlar bilan rag‘batlantiring. Yana qanday savollaringiz bor?";
    
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('motorika') || lowerMessage.includes('harakat') || lowerMessage.includes('muskul')) {
      reply = "Mayda motorikani oshirish uchun uydagi oddiy elementlardan foydalanish juda samarali. Masalan, ipga yirik rangli tugmalarni o‘tkazish, qog‘ozlarni mayda qilib yirtish va yopishtirish, uqalash o‘yinlari bolaning qo‘l mushaklarini mustahkamlaydi.";
    } else if (lowerMessage.includes('nutq') || lowerMessage.includes('gapir') || lowerMessage.includes('so\'z')) {
      reply = "Nutq ko‘nikmalarini rag‘batlantirish uchun bola bilan har bir harakatni baland ovozda, bo‘g‘inma-bo‘g‘in va yuz ifodalari bilan aniq gapirib tushuntiring. Ertaklarni birgalikda rasmiga qarab sharhlang.";
    } else if (lowerMessage.includes('tashvish') || lowerMessage.includes('qo\'rq') || lowerMessage.includes('baqir') || lowerMessage.includes('sensor')) {
      reply = "Sensor yuklanish maxsus bolajonlarda bezovtalik keltirib chiqarishi mumkin. Bunday paytda uydagi sokin va tinch bo‘g‘inni 'shinam burchak' qilib bering. Uni quchoqlab, u bilan sokin nafas olish mashqini bajaring.";
    }

    res.json({ reply: reply });
  }
});

app.listen(PORT, () => {
  console.log(`[Yordamchi Backend] Server running on http://localhost:${PORT}`);
});
