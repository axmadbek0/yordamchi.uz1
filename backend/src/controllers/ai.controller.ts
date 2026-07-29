import { Request, Response } from 'express';
import {
  analyzeStatusReport,
  chatWithAi,
  getFallbackAnalysis,
  getFallbackChatReply,
  AnalyzeDailyLogInput,
} from '../services/aiService';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';

function parseAnalyzeBody(body: Record<string, unknown>): AnalyzeDailyLogInput {
  const { fullName, mood, health, teacherNote } = body;

  if (
    typeof fullName !== 'string' ||
    typeof mood !== 'string' ||
    typeof health !== 'string' ||
    typeof teacherNote !== 'string' ||
    !teacherNote.trim()
  ) {
    throw new AppError('Noto\'g\'ri so\'rov', 400);
  }

  return {
    studentName: fullName.trim(),
    mood: mood.trim(),
    health: health.trim(),
    logText: teacherNote.trim(),
  };
}

export const analyzeStatus = asyncHandler(async (req: Request, res: Response) => {
  const input = parseAnalyzeBody(req.body);

  const analysis = await analyzeStatusReport(input);
  if (analysis) {
    res.json({ analysis });
    return;
  }

  res.json({ analysis: getFallbackAnalysis(input), fallback: true });
});

export const chatWithAiHandler = asyncHandler(async (req: Request, res: Response) => {
  const { message, history, studentName, studentClass } = req.body;

  if (typeof message !== 'string' || !message.trim()) {
    throw new AppError('Noto\'g\'ri so\'rov', 400);
  }

  const reply = await chatWithAi({
    message: message.trim(),
    history,
    studentName,
    studentClass,
  });

  if (reply) {
    res.json({ reply });
    return;
  }

  res.json({ reply: getFallbackChatReply(message), fallback: true });
});
