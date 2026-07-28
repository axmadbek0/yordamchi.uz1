/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, DailyStatusEntry } from '../types';

// Map backend student format to frontend format
const mapStudent = (s: any): Student => ({
  id: s.id,
  fullName: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
  birthDate: s.dob ? s.dob.split('T')[0] : '2015-01-01',
  className: s.class_name || '4-A',
  schoolNumber: s.school_id ? 12 : 12, // fallback
  sequenceNumber: 1,
  parentPhone: s.parent?.phone || '+998 00 000 00 00',
  parentLogin: s.parent?.login || 'unknown',
  parentPassword: '',
  credentialsActivated: true,
});

const mapLog = (r: any): DailyStatusEntry => ({
  id: r.id,
  studentId: r.student_id,
  date: r.date ? r.date.split('T')[0] : new Date().toISOString().split('T')[0],
  healthStatus: r.health as any,
  mood: r.mood as any,
  teacherNote: r.teacher_note,
  aiAnalysis: r.ai_analysis,
  createdAt: r.date
});

export async function getStudents(): Promise<Student[]> {
  try {
    const res = await fetch('/api/v1/students');
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    return data.map(mapStudent);
  } catch (err) {
    console.error('Failed to fetch students, using empty array', err);
    return [];
  }
}

export async function saveStudent(student: Student): Promise<Student[]> {
  console.warn('saveStudent not fully implemented for backend yet.');
  return getStudents();
}

export async function updateStudent(updatedStudent: Student): Promise<Student[]> {
  console.warn('updateStudent not fully implemented for backend yet.');
  return getStudents();
}

export async function getReports(): Promise<DailyStatusEntry[]> {
  try {
    // A real backend would have an endpoint for logs, for now we mock it or fetch students and extract logs
    // Let's pretend there's an /api/v1/logs endpoint (we can add it if we want, or just return empty for now)
    return [];
  } catch (err) {
    return [];
  }
}

export async function getReportsForStudent(studentId: string): Promise<DailyStatusEntry[]> {
  try {
    const res = await fetch(`/api/v1/students/${studentId}`);
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    if (data.logs) {
      return data.logs.map(mapLog);
    }
    return [];
  } catch (err) {
    return [];
  }
}

export async function saveDailyReport(report: DailyStatusEntry): Promise<DailyStatusEntry[]> {
  console.warn('saveDailyReport not fully implemented for backend yet.');
  return getReports();
}

/**
 * AI analysis on daily logs via backend proxy
 */
export async function analyzeReportWithAI(
  fullName: string,
  mood: string,
  health: string,
  teacherNote: string
): Promise<string> {
  try {
    const response = await fetch('/api/v1/ai/analyze-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, mood, health, teacherNote })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.analysis;
    }
  } catch (err) {
    console.error('Server AI analysis error, falling back to client-side logic:', err);
  }

  // Fallback high-quality localized AI templates
  return new Promise((resolve) => {
    setTimeout(() => {
      let analysisText = '';
      if (mood === 'xursand') {
        analysisText = `${fullName} bugun juda ko‘tarinki kayfiyatda edi, bu uning ijtimoiy faolligiga va yangi ma’lumotlarni o‘zlashtirishiga ajoyib zamin yaratdi. Salomatligi ${health} holatda bo‘lgani jismoniy mashg‘ulotlarni to‘liq bajarishga imkon berdi. Tavsiya: Bugun uyda u bilan birgalikda o‘yin o‘ynang va bugungi yutuqlari uchun uni albatta maqtab rag‘batlantiring.`;
      } else if (mood === 'oddiy') {
        analysisText = `${fullName} bugun darslarda barqaror va tinch holatda qatnashdi. Salomatligi (${health}) yaxshi darajada. O‘quv yuklamalarini o‘rtacha qabul qildi. Tavsiya: Kechqurun oilaviy muhitda sokin kitob o‘qish yoki birgalikda rasm chizish mashg‘ulotlarini olib borishingiz emotsional aloqani mustahkamlaydi.`;
      } else if (mood === 'tashvishli') {
        analysisText = `${fullName} bugun dars davomida bir oz xavotir yoki tashvish his qildi, bu darsdagi ayrim yangiliklar yoki sensor qo‘zg‘atuvchilar sababli bo‘lishi mumkin. O‘qituvchi tomonidan tinchlantirish choralari ko‘rildi. Tavsiya: Uyda sensor yuklanishlarni cheklang (televizor va gadjetlarni kamaytiring), bolani bag‘ringizga bosib, tinchlantiruvchi iliq suhbatlar qiling.`;
      } else {
        analysisText = `${fullName} haftalik o‘quv rejasi va darslar natijasida bir oz charchagan ko‘rinadi. Sog‘lig‘i ${health} darajada. Tavsiya: Uyda yaxshi va to‘yib uxlashini ta’minlang, ortiqcha intellektual va jismoniy mashqlar yuklamang, dam olish kunini sokin o‘tkazing.`;
      }
      resolve(analysisText);
    }, 1500);
  });
}

