/**
 * Automated test suite for School Admin endpoints and security rules
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { httpServer } from '../server';

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function postJson(endpoint: string, data: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  const json = await res.json();
  return { status: res.status, data: json };
}

async function getJson(endpoint: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers,
  });
  const json = await res.json();
  return { status: res.status, data: json };
}

async function patchJson(endpoint: string, data: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
  const json = await res.json();
  return { status: res.status, data: json };
}

describe('School Admin — Full End-to-End Suite', async () => {
  let adminToken71 = '';
  let adminToken12 = '';
  let createdTeacherId = '';

  before(async () => {
    // Ensure server is listening
    if (!httpServer.listening) {
      await new Promise<void>((resolve) => {
        httpServer.listen(PORT, () => resolve());
      });
    }
  });

  it('1. Login: 71-Maktab admini tizimga muvaffaqiyatli kiradi va token oladi', async () => {
    const res = await postJson('/auth/login', {
      login: 'admin71',
      password: '123456',
      role: 'school_admin',
      schoolNumber: 71,
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.user.role, 'SCHOOL_ADMIN');
    assert.equal(res.data.user.schoolNumber, 71);
    assert.ok(res.data.accessToken);

    adminToken71 = res.data.accessToken;
  });

  it('2. Login: 12-Maktab admini ham muvaffaqiyatli kiradi', async () => {
    const res = await postJson('/auth/login', {
      login: 'admin12',
      password: '123456',
      role: 'school_admin',
      schoolNumber: 12,
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    adminToken12 = res.data.accessToken;
  });

  it('3. Xavfsizlik: Noto\'g\'ri maktab raqami yoki parol bilan kirish 401 beradi', async () => {
    const res = await postJson('/auth/login', {
      login: 'admin71',
      password: '123456',
      role: 'school_admin',
      schoolNumber: 999,
    });

    assert.equal(res.status, 401);
    assert.equal(res.data.message, 'Login yoki parol noto\'g\'ri');
  });

  it('4. O\'qituvchilar: 71-Maktab admini faqat o\'z maktabi o\'qituvchilarini ko\'radi', async () => {
    const res = await getJson('/school-admin/teachers', adminToken71);
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(Array.isArray(res.data.data));
    assert.ok(res.data.data.length >= 2);
  });

  it('5. O\'qituvchi qo\'shish: Yangi o\'qituvchi qo\'shilganda parol formulasi to\'g\'ri bo\'ladi (71maktabumumi...)', async () => {
    const res = await postJson(
      '/school-admin/teachers',
      {
        displayName: 'Olim Karimov',
        className: '3-A sinf',
        phone: '+998903334455',
      },
      adminToken71
    );

    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data.generatedCredentials);

    const creds = res.data.data.generatedCredentials;
    assert.match(creds.login, /^umumi\d*$/);
    assert.equal(creds.password, `71maktab${creds.login}`);

    createdTeacherId = res.data.data.teacher.id;

    // Yangi yaratilgan o'qituvchi shu login va parol bilan tizimga kira oladi
    const loginRes = await postJson('/auth/login', {
      login: creds.login,
      password: creds.password,
    });
    assert.equal(loginRes.status, 200);
    assert.equal(loginRes.data.user.role, 'TEACHER');
  });

  it('6. Parolni yangilash (Reset): O\'qituvchi paroli qayta generatsiya qilinadi', async () => {
    assert.ok(createdTeacherId);
    const res = await postJson(
      `/school-admin/teachers/${createdTeacherId}/reset-credentials`,
      {},
      adminToken71
    );

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data.generatedCredentials.password.startsWith('71maktab'));
  });

  it('7. Izolyatsiya: 12-Maktab admini 71-maktab o\'qituvchisi parolini o\'zgartira olmaydi (404)', async () => {
    const res = await postJson(
      `/school-admin/teachers/${createdTeacherId}/reset-credentials`,
      {},
      adminToken12
    );

    assert.equal(res.status, 404);
  });

  it('8. O\'quvchilar: Sinf filtri bo\'yicha o\'quvchilar ro\'yxati olinadi', async () => {
    const res = await getJson('/school-admin/students?classFilter=4-A sinf', adminToken71);
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(Array.isArray(res.data.data));
    for (const student of res.data.data) {
      assert.equal(student.className, '4-A sinf');
    }
  });

  it('9. Hisobotlar: Haftalik maktab hisoboti to\'liq ma\'lumotlar bilan qaytadi', async () => {
    const res = await getJson('/school-admin/reports?period=week', adminToken71);
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data.kpis);
    assert.ok(Array.isArray(res.data.data.moodDistribution));
    assert.ok(Array.isArray(res.data.data.classesBreakdown));
  });

  it('10. Maktab profili: Profilni olish va tahrirlash ishlaydi', async () => {
    const getRes = await getJson('/school-admin/profile', adminToken71);
    assert.equal(getRes.status, 200);
    assert.equal(getRes.data.data.schoolNumber, 71);

    const patchRes = await patchJson(
      '/school-admin/profile',
      { phone: '+998 71 277-71-72' },
      adminToken71
    );
    assert.equal(patchRes.status, 200);
    assert.equal(patchRes.data.data.phone, '+998 71 277-71-72');
  });

  it('11. Kameralar: Kamera qo\'shish va faolligini o\'zgartirish ishlaydi', async () => {
    const addCamRes = await postJson(
      '/school-admin/cameras',
      {
        type: 'DORMITORY',
        sectorLabel: '3-Bino yangi kamera',
      },
      adminToken71
    );
    assert.equal(addCamRes.status, 201);
    const camId = addCamRes.data.data.id;

    const toggleRes = await patchJson(
      `/school-admin/cameras/${camId}`,
      { isActive: false },
      adminToken71
    );
    assert.equal(toggleRes.status, 200);
    assert.equal(toggleRes.data.data.isActive, false);
  });

  it('12. Bildirishnoma: Maktabga xabar yuborilganda deliveredCount qaytadi', async () => {
    const res = await postJson(
      '/school-admin/announcements',
      {
        title: 'Shoshilinch tibbiy ko\'rik',
        body: 'Ertaga barcha sinflar uchun umumiy dispanserizatsiya o\'tkaziladi.',
        type: 'urgent',
      },
      adminToken71
    );

    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.ok(typeof res.data.data.deliveredCount === 'number');
  });
});
