/**
 * Schools API — reads from localStorage (same store as admin panel)
 */

import type { SchoolWithLocation, SchoolDetail } from '../types';

const SCHOOLS_KEY = 'yordamchi_schools';

// Admin panel'dagi SEED_SCHOOLS bilan bir xil initial seed
// (localStorage bo'sh bo'lsa fallback sifatida ishlatiladi)
const FALLBACK_SCHOOLS: SchoolWithLocation[] = [
  {
    id: 'sch-1',
    number: 12,
    name: '12-sonli imkoniyati cheklangan bolalar uchun ixtisoslashtirilgan maktab-internati',
    region: 'Toshkent shahri',
    district: 'Chilonzor tumani',
    address: 'Toshkent sh., Chilonzor tumani, 3-mavze',
    phone: '+998 71 276 54 32',
    classCount: 8,
    status: 'active',
    teacherCount: 3,
    studentCount: 45,
    createdAt: '2025-09-01',
    lat: 41.2995,
    lng: 69.2401,
    description: "Bizning maktab-internatimiz imkoniyati cheklangan bolalarga individual yondashuv asosida sifatli ta'lim va tarbiya beradi. Tajribali pedagoglar va zamonaviy o'quv usullari yordamida har bir o'quvchi o'z salohiyatini to'liq namoyon qilishi uchun sharoit yaratilgan.",
    workingHours: 'Dushanba–Juma: 08:00–17:00',
    foundedYear: 1995,
    isVerified: true,
    licenseNumber: 'LIC-2023-TT-0012',
    ageRangeMin: 6,
    ageRangeMax: 18,
    faqItems: [
      { question: 'Qabul uchun qanday hujjatlar kerak?', answer: "Tug'ilganlik guvohnomasi, tibbiy ma'lumotnoma (VKEK xulosasi), ota-ona pasporti nusxasi va 4 ta 3x4 fotosurat talab qilinadi." },
      { question: "Maktabda o'qish pullikmi?", answer: "Davlat tomonidan moliyalashtirilgan o'rinlar mavjud. Qo'shimcha to'garak va individual darslar alohida narxda." },
      { question: 'Bola maktabda kechasi qolishi mumkinmi?', answer: "Ha, maktabimizda yotoqxona bo'lib, bolalar hafta davomida qolishlari mumkin. Dam olish kunlari ota-onalarga beriladi." },
    ],
  },
  {
    id: 'sch-2',
    number: 45,
    name: '45-sonli aqli zaif bolalar uchun maktab-internati',
    region: 'Samarqand viloyati',
    district: 'Samarqand tumani',
    address: "Samarqand sh., Gagarin ko'chasi, 12",
    phone: '+998 66 233 44 55',
    classCount: 6,
    status: 'active',
    teacherCount: 2,
    studentCount: 32,
    createdAt: '2025-10-15',
    lat: 39.6542,
    lng: 66.9597,
    description: "Samarqand viloyatining yetakchi maxsus ta'lim muassasasi. Aqliy rivojlanishida qiyinchiliklari bor bolalarga moslashtirilgan ta'lim dasturlari, nutq terapiyasi va mehnat ta'limi mashg'ulotlari olib boriladi.",
    workingHours: 'Dushanba–Shanba: 08:30–17:30',
    foundedYear: 2001,
    isVerified: true,
    licenseNumber: 'LIC-2022-SM-0045',
    ageRangeMin: 7,
    ageRangeMax: 17,
    faqItems: [
      { question: "Maktabga qanday murojaat qilsa bo'ladi?", answer: "To'g'ridan-to'g'ri maktab ma'muriyatiga tashrif buyuring yoki telefon orqali dastlabki ko'rikka yoziling." },
      { question: 'Qanday mutaxassislar ishlaydi?', answer: "Defektolog, logoped, psixolog, maxsus pedagog va jismoniy tarbiya mutaxassislari xizmat ko'rsatadi." },
    ],
  },
  {
    id: 'sch-3',
    number: 3,
    name: '3-sonli Daun sindromli bolalar ixtisoslashtirilgan maktabi',
    region: "Farg'ona viloyati",
    district: "Farg'ona tumani",
    address: "Farg'ona sh., Al-Fargoniy ko'chasi, 88",
    phone: '+998 73 244 55 66',
    classCount: 5,
    status: 'active',
    teacherCount: 2,
    studentCount: 28,
    createdAt: '2025-11-20',
    lat: 40.3864,
    lng: 71.7864,
    description: "Daun sindromi va boshqa xromosoma kasalliklari bo'lgan bolalarga ixtisoslashgan respublika miqyosidagi yetakchi maktab. Har bir bola uchun yakka tartibdagi ta'lim rejasi tuziladi.",
    workingHours: 'Dushanba–Juma: 09:00–16:00',
    foundedYear: 2008,
    isVerified: true,
    ageRangeMin: 5,
    ageRangeMax: 18,
    faqItems: [
      { question: 'Maktabga nechinchi yoshdan qabul qilinadi?', answer: "5 yoshdan boshlab erta intervensiya dasturlari, 7 yoshdan esa to'liq ta'lim dasturi mavjud." },
      { question: 'Transport xizmati bormi?', answer: "Shahar ichida maxsus avtobus xizmati yo'lga qo'yilgan. Tafsilotlar uchun maktab bilan bog'laning." },
    ],
  },
  {
    id: 'sch-4',
    number: 71,
    name: "71-sonli maxsus ta'lim maktab-internati",
    region: 'Buxoro viloyati',
    district: 'Buxoro tumani',
    address: "Buxoro sh., Navoiy ko'chasi, 5",
    phone: '+998 65 221 33 44',
    classCount: 4,
    status: 'pending',
    teacherCount: 0,
    studentCount: 0,
    createdAt: '2026-06-10',
    lat: 39.7747,
    lng: 64.4286,
    description: "Buxoro viloyatida yangi ochilayotgan maxsus ta'lim muassasasi. Yaqin orada to'liq faoliyat boshlaydi.",
    workingHours: "Ma'lumot mavjud emas",
    foundedYear: 2026,
    isVerified: false,
    ageRangeMin: 6,
    ageRangeMax: 18,
  },
  {
    id: 'sch-5',
    number: 18,
    name: "18-sonli maxsus ta'lim maktab-internati",
    region: 'Andijon viloyati',
    district: 'Andijon tumani',
    address: "Andijon sh., Bobur ko'chasi, 22",
    phone: '+998 74 223 11 22',
    classCount: 7,
    status: 'active',
    teacherCount: 3,
    studentCount: 38,
    createdAt: '2026-01-15',
    lat: 40.7821,
    lng: 72.3441,
    description: "Andijon viloyatining eng yirik maxsus ta'lim maktab-internati. Kognitiv va jismoniy rivojlanish qiyinchiliklari bo'lgan bolalarga kompleks yordam ko'rsatiladi.",
    workingHours: 'Dushanba–Juma: 08:00–18:00',
    foundedYear: 2004,
    isVerified: true,
    licenseNumber: 'LIC-2021-AND-0018',
    ageRangeMin: 6,
    ageRangeMax: 18,
    faqItems: [
      { question: 'Qanday dasturlar mavjud?', answer: "Erta intervensiya, maktabgacha ta'lim, umumiy o'rta ta'lim va mehnat ta'limi dasturlari amalga oshiriladi." },
    ],
  },
  {
    id: 'sch-6',
    number: 9,
    name: '9-sonli bolalar rivojlanish markazi',
    region: 'Namangan viloyati',
    district: 'Namangan tumani',
    address: "Namangan sh., Mustaqillik ko'chasi, 15",
    phone: '+998 69 227 88 99',
    classCount: 3,
    status: 'suspended',
    teacherCount: 1,
    studentCount: 12,
    createdAt: '2025-12-05',
    lat: 41.0011,
    lng: 71.6725,
    description: "Namangan shahrida joylashgan rivojlanish markazi. Hozirda texnik sabablarga ko'ra faoliyati vaqtincha to'xtatilgan.",
    workingHours: "Vaqtincha to'xtatilgan",
    foundedYear: 2010,
    isVerified: false,
  },
];

function loadFromStorage(): SchoolWithLocation[] {
  try {
    const raw = localStorage.getItem(SCHOOLS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SchoolWithLocation[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore parse errors
  }
  return FALLBACK_SCHOOLS;
}

export async function getSchoolsWithLocation(): Promise<SchoolWithLocation[]> {
  // Simulate a small network delay for realistic UX
  await new Promise((r) => setTimeout(r, 600));
  return loadFromStorage().filter((s) => s.status === 'active' || s.status === 'pending');
}

export async function getSchoolById(id: string): Promise<SchoolDetail | null> {
  await new Promise((r) => setTimeout(r, 400));
  const schools = loadFromStorage();
  return schools.find((s) => s.id === id) ?? null;
}
