import { apiClient } from './axios';

export async function analyzeStatusReport(params: {
  fullName: string;
  mood: string;
  health: string;
  teacherNote: string;
}): Promise<string> {
  const health = params.health === 'sog‘lom' ? "sog'lom" : params.health;

  const { data } = await apiClient.post<{ analysis: string; fallback?: boolean }>(
    '/v1/ai/analyze-status',
    {
      fullName: params.fullName,
      mood: params.mood,
      health,
      teacherNote: params.teacherNote,
    }
  );

  return data.analysis;
}

export async function sendChatMessage(params: {
  message: string;
  history?: Array<{ role: string; parts: Array<{ text: string }> }>;
  studentName?: string;
  studentClass?: string;
}): Promise<string> {
  const { data } = await apiClient.post<{ reply: string; fallback?: boolean }>(
    '/v1/ai/chat',
    params
  );
  return data.reply;
}
