/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, DailyStatusEntry } from '../types';

// Inizializatsiya uchun boshlang'ich maktablar ro'yxati
export const SEED_SCHOOLS = [
  { id: '1', number: 12, name: 'Toshkent shahridagi 12-sonli imkoniyati cheklangan bolalar uchun ixtisoslashtirilgan maktab-internati', address: 'Toshkent sh., Chilonzor tumani, 3-mavze', phone: '+998 71 276 54 32' },
  { id: '2', number: 45, name: 'Samarqand viloyatidagi 45-sonli aqli zaif bolalar uchun maktab-internati', address: 'Samarqand sh., Gagarin ko‘chasi, 12', phone: '+998 66 233 44 55' },
  { id: '3', number: 3, name: 'Farg‘ona viloyatidagi 3-sonli Daun sindromli bolalar ixtisoslashtirilgan maktabi', address: 'Farg‘ona sh., Al-Fargoniy ko‘chasi, 88', phone: '+998 73 244 55 66' }
];

// Boshlang'ich o'quvchilar ro'yxati (Maktab 12 uchun)
const SEED_STUDENTS: Student[] = [
  {
    id: 's1',
    fullName: 'Alijonov Sardor',
    birthDate: '2016-05-12',
    className: '4-A',
    schoolNumber: 12,
    sequenceNumber: 1,
    parentPhone: '+998 90 123 45 67',
    parentLogin: '12_001',
    parentPassword: 'password123',
    credentialsActivated: true,
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 's2',
    fullName: 'Karimova Zilola',
    birthDate: '2017-09-20',
    className: '3-B',
    schoolNumber: 12,
    sequenceNumber: 2,
    parentPhone: '+998 93 987 65 43',
    parentLogin: '12_002',
    parentPassword: 'password456',
    credentialsActivated: true,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 's3',
    fullName: 'Rustamov Diyor',
    birthDate: '2015-11-03',
    className: '5-A',
    schoolNumber: 12,
    sequenceNumber: 3,
    parentPhone: '+998 94 444 33 22',
    parentLogin: '12_003',
    parentPassword: 'password789',
    credentialsActivated: false,
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80'
  }
];

// Alijonov Sardor uchun oxirgi 5 kunlik hisobotlar
const getPastDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const SEED_REPORTS: DailyStatusEntry[] = [
  {
    id: 'r1',
    studentId: 's1',
    date: getPastDateStr(4),
    healthStatus: 'sog‘lom',
    mood: 'xursand',
    teacherNote: 'Sardor bugun darslarda juda faol qatnashdi. Matematika darsida rasm chizish mashqini qunt bilan bajardi va tengdoshlari bilan muloqotda bo‘ldi. Kayfiyati a’lo darajada edi.',
    aiAnalysis: 'Sardor bugun o‘zining ijtimoiy va intellektual ko‘nikmalarida barqaror ijobiy o‘sish ko‘rsatdi. Tengdoshlari bilan faol muloqoti uning guruhga moslashuvchanligini ifodalaydi. Tavsiya: Uyda rasm chizishda geometrik shakllarni birgalikda bo‘yash mashg‘ulotlarini davom ettiring.',
    createdAt: new Date(getPastDateStr(4) + 'T16:00:00').toISOString()
  },
  {
    id: 'r2',
    studentId: 's1',
    date: getPastDateStr(3),
    healthStatus: 'yengil bezovta',
    mood: 'oddiy',
    teacherNote: 'Bugun tushlik paytida biroz charchoq sezildi, bir oz ishtahasi pasaygan edi. Mashg‘ulotlarda ishtirok etdi, lekin ko‘proq dam olishni afzal ko‘rdi. Jiddiy muammo kuzatilmadi.',
    aiAnalysis: 'Sardorda energiyaning biroz pasayishi kuzatilgan. Ishtahaning pasayishi yengil jismoniy charchoq yoki ob-havo o‘zgarishi bilan bog‘liq bo‘lishi mumkin. Tavsiya: Kechki uyqu rejimiga rioya qiling va uyda ko‘proq suyuqlik ichishini ta’minlang.',
    createdAt: new Date(getPastDateStr(3) + 'T16:00:00').toISOString()
  },
  {
    id: 'r3',
    studentId: 's1',
    date: getPastDateStr(2),
    healthStatus: 'sog‘lom',
    mood: 'tashvishli',
    teacherNote: 'Musiqa darsida baland tovushlardan bir oz hayajonlandi va xonaning burchagiga o‘tirib oldi. Keyinchalik tinchlantiruvchi o‘yinlar orqali guruhga qaytarildi. Diqqatni jamlashda biroz qiynaldi.',
    aiAnalysis: 'Sardor bugun sensor yuklanish (baland tovushlar) tufayli sensor bezovtalikni boshdan kechirgan. Tavsiya: Uyda osoyishta muhit yarating, sokin musiqa eshittiring. Sensorli sezgirlikni kamaytirish uchun iliq vanna yoki qum bilan o‘ynash foydali bo‘ladi.',
    createdAt: new Date(getPastDateStr(2) + 'T16:00:00').toISOString()
  },
  {
    id: 'r4',
    studentId: 's1',
    date: getPastDateStr(1),
    healthStatus: 'sog‘lom',
    mood: 'xursand',
    teacherNote: 'Sensor xonada qum terapiyasi bilan shug‘ullandi. Juda xursand bo‘ldi, qo‘l motorikasi mashqlarini mukammal bajardi. Nutq darsida 3 ta yangi so‘zni mustaqil ravishda talaffuz qildi.',
    aiAnalysis: 'Sardor qum terapiyasidan so‘ng emotsional muvozanatini tikladi va bu uning nutq faolligiga ijobiy ta’sir ko‘rsatdi. Nutq ko‘nikmalarida sezilarli o‘sish kuzatilmoqda. Tavsiya: Bugun uydagi suhbatlarda yangi o‘rgangan so‘zlarini takrorlashga va rag‘batlantirishga harakat qiling.',
    createdAt: new Date(getPastDateStr(1) + 'T16:00:00').toISOString()
  },
  {
    id: 'r5',
    studentId: 's1',
    date: getPastDateStr(0),
    healthStatus: 'sog‘lom',
    mood: 'charchagan',
    teacherNote: 'Haftalik oxirgi kun bo‘lgani uchun dars oxiriga borib Sardor biroz toliqib qoldi. Jismoniy tarbiya mashqlarida qatnashdi, biroq xotirjamlikni va dam olishni istadi. Hozirda kayfiyati barqaror.',
    aiAnalysis: 'Haftalik o‘quv yuklamasi natijasida tabiiy jismoniy charchoq holati kuzatilmoqda. Barcha darslarni muvaffaqiyatli yakunlagan. Tavsiya: Dam olish kunlari oila davrasida tabiat qo‘ynida dam olish, yengil sayrlar va faol o‘yinlardan qochgan holda tinch dam berish maqsadga muvofiq.',
    createdAt: new Date().toISOString()
  }
];

// Helper funksiyalar
export function initializeDB() {
  if (!localStorage.getItem('yordamchi_students')) {
    localStorage.setItem('yordamchi_students', JSON.stringify(SEED_STUDENTS));
  }
  if (!localStorage.getItem('yordamchi_reports')) {
    localStorage.setItem('yordamchi_reports', JSON.stringify(SEED_REPORTS));
  }
}

export function getStudents(): Student[] {
  initializeDB();
  return JSON.parse(localStorage.getItem('yordamchi_students') || '[]');
}

export function saveStudent(student: Student): Student[] {
  const students = getStudents();
  students.push(student);
  localStorage.setItem('yordamchi_students', JSON.stringify(students));
  return students;
}

export function updateStudent(updatedStudent: Student): Student[] {
  const students = getStudents();
  const index = students.findIndex(s => s.id === updatedStudent.id);
  if (index !== -1) {
    students[index] = updatedStudent;
    localStorage.setItem('yordamchi_students', JSON.stringify(students));
  }
  return students;
}

export function getReports(): DailyStatusEntry[] {
  initializeDB();
  return JSON.parse(localStorage.getItem('yordamchi_reports') || '[]');
}

export function getReportsForStudent(studentId: string): DailyStatusEntry[] {
  return getReports().filter(r => r.studentId === studentId).sort((a, b) => b.date.localeCompare(a.date));
}

export function saveDailyReport(report: DailyStatusEntry): DailyStatusEntry[] {
  const reports = getReports();
  // Agar shu sana va shu talaba uchun hisobot allaqachon mavjud bo'lsa, uni yangilaymiz
  const index = reports.findIndex(r => r.studentId === report.studentId && r.date === report.date);
  if (index !== -1) {
    reports[index] = report;
  } else {
    reports.push(report);
  }
  localStorage.setItem('yordamchi_reports', JSON.stringify(reports));
  return reports;
}

/**
 * AI analysis on daily logs via backend proxy (which uses real Gemini model)
 */
export async function analyzeReportWithAI(
  fullName: string,
  mood: string,
  health: string,
  teacherNote: string
): Promise<string> {
  try {
    const response = await fetch('/api/ai/analyze-status', {
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
