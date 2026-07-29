import { GoogleGenerativeAI } from '@google/generative-ai';

const PEDAGOG_SYSTEM_INSTRUCTION = `
Siz imkoniyati cheklangan (aqli zaif, Daun sindromi, autizm) bolalar bilan ishlaydigan
professional maktab-internati bolalar psixologi va oliy toifali pedagogisiz.
Ota-onalarga farzandining holatiga mos iliq, xavotirsiz va rag'batlantiruvchi yo'l-yo'riq berasiz.
Tibbiy tashxis qo'ymaysiz va ota-onani asabiylashtiradigan so'zlardan qochasiz.
`.trim();

export interface AnalyzeDailyLogInput {
  studentName: string;
  mood: string;
  health: string;
  logText: string;
}

export interface ChatWithAiInput {
  message: string;
  history?: Array<{ role: string; parts: Array<{ text: string }> }>;
  studentName?: string;
  studentClass?: string;
}

function getGeminiModel(systemInstruction?: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    ...(systemInstruction ? { systemInstruction } : {}),
  });
}

function buildDailyLogPrompt(input: AnalyzeDailyLogInput): string {
  return `
O'quvchi ismi: ${input.studentName}
Bugungi kayfiyat: ${input.mood}
Salomatlik holati: ${input.health}
O'qituvchi kunlik izohi: "${input.logText}"

Vazifa: Ushbu matnni maxsus ta'lim maktabidagi o'quvchining holati sifatida tahlil qilib,
ota-ona tushunadigan qisqa xulosa yoz.

Talablar:
1. O'zbek tilida (lotin yozuvida), yumshoq va dalda beruvchi ohangda yoz.
2. 3-4 gapdan oshmasin.
3. Bolaning kuchli tomonlarini ta'kidlang, ota-onaga bitta amaliy uy mashg'uloti tavsiya qiling.
4. "Muammo", "kasallik" kabi qo'rqinchli so'zlardan qoching.
`.trim();
}

export async function analyzeDailyLog(input: AnalyzeDailyLogInput): Promise<string | null> {
  const model = getGeminiModel(PEDAGOG_SYSTEM_INSTRUCTION);
  if (!model) {
    console.warn('[AI] GEMINI_API_KEY konfiguratsiya qilinmagan');
    return null;
  }

  try {
    const result = await model.generateContent(buildDailyLogPrompt(input));
    const text = result.response.text()?.trim();
    return text || null;
  } catch (error) {
    console.error('[AI] Kunlik hisobot tahlili muvaffaqiyatsiz:', error);
    return null;
  }
}

export async function analyzeStatusReport(input: AnalyzeDailyLogInput): Promise<string | null> {
  return analyzeDailyLog(input);
}

export async function chatWithAi(input: ChatWithAiInput): Promise<string | null> {
  const model = getGeminiModel(`
Siz "Yordamchi med" platformasining maxsus pedagogika bo'yicha AI maslahatchisiz.
Siz bilan muloqot qilayotgan shaxs — ${input.studentName || 'bola'} ota-onasi (sinf: ${input.studentClass || 'maxsus guruh'}).
O'zbek tilida (lotin), samimiy va qisqa javob bering (2-3 xatboshi).
Tibbiy tashxis qo'ymang; kerak bo'lsa shifokorga murojaat qilishni muloyimlik bilan tavsiya qiling.
`.trim());

  if (!model) {
    console.warn('[AI] GEMINI_API_KEY konfiguratsiya qilinmagan');
    return null;
  }

  try {
    const history = input.history ?? [];
    const chat = model.startChat({
      history: history.map((item) => ({
        role: item.role === 'model' ? 'model' : 'user',
        parts: [{ text: item.parts[0]?.text ?? '' }],
      })),
    });

    const result = await chat.sendMessage(input.message);
    return result.response.text()?.trim() || null;
  } catch (error) {
    console.error('[AI] Chat javobi muvaffaqiyatsiz:', error);
    return null;
  }
}

export function getFallbackAnalysis(input: AnalyzeDailyLogInput): string {
  const { studentName, mood, health } = input;

  if (mood === 'xursand') {
    return `${studentName} bugun ijobiy kayfiyatda bo'ldi. Salomatligi ${health} holatda. Uyda birgalikda qisqa o'yin o'ynab, yutuqlarini maqtab rag'batlantiring.`;
  }
  if (mood === 'tashvishli') {
    return `${studentName} bugun biroz xavotirli ko'rindi. O'qituvchi tomonidan qo'llab-quvvatlandi. Uyda tinch muhit yarating va sensor yuklanishni kamaytiring.`;
  }
  if (mood === 'charchagan') {
    return `${studentName} bugun charchagan holatda edi. Salomatligi ${health}. Uyda dam olish va barqaror uyqu rejimini ta'minlang.`;
  }
  return `${studentName} bugun barqaror qatnashdi. Salomatligi ${health} darajada. Kechqurun oilaviy sokin mashg'ulotlar bilan emotsional aloqani mustahkamlang.`;
}

export function getFallbackChatReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('motorika') || lower.includes('harakat')) {
    return 'Mayda motorikani rivojlantirish uchun uyda tugmalar yig\'ish, qog\'oz yirtish va yopishtirish kabi oddiy mashqlarni kuniga 10-15 daqiqa bajaring.';
  }
  if (lower.includes('nutq') || lower.includes('gapir')) {
    return 'Nutqni rag\'batlantirish uchun har bir harakatni aniq va sekin tushuntiring. Rasm kitoblar bilan savol-javob o\'yinlarini o\'tkazing.';
  }
  return 'Maxsus tarbiyada sabr va izchil kunlik mashqlar muhim. Farzandingizning kichik yutuqlarini maqtab, xotirjam muhitda rivojlantiruvchi o\'yinlar bilan davom eting.';
}
