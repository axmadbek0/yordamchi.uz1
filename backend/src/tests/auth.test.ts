import http from 'http';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const BASE_URL = 'http://localhost:5000/api/auth/login';

async function makePostRequest(body: Record<string, unknown>): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode || 500, data: parsed });
        } catch {
          resolve({ status: res.statusCode || 500, data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

async function runAuthTests() {
  console.log('=== YORDAMCHI MED AUTH INTEGRATION TESTS ===\n');
  const results: TestResult[] = [];

  // Test 1: Teacher login
  try {
    const res = await makePostRequest({
      role: 'teacher',
      schoolNumber: 71,
      login: 'umumi',
      password: '123456',
    });
    if (res.status === 200 && res.data.success && res.data.user.role === 'TEACHER') {
      results.push({ name: "1. O'qituvchi login (umumi / 123456)", passed: true });
    } else {
      results.push({
        name: "1. O'qituvchi login (umumi / 123456)",
        passed: false,
        error: `Kutilgan: 200, Olingan: ${res.status} ${JSON.stringify(res.data)}`,
      });
    }
  } catch (e: any) {
    results.push({ name: "1. O'qituvchi login", passed: false, error: e.message });
  }

  // Test 2: School Admin login
  try {
    const res = await makePostRequest({
      role: 'school_admin',
      schoolNumber: 71,
      login: 'admin71',
      password: '123456',
    });
    if (res.status === 200 && res.data.success && res.data.user.role === 'SCHOOL_ADMIN') {
      results.push({ name: '2. Maktab admini login (admin71 / 123456)', passed: true });
    } else {
      results.push({
        name: '2. Maktab admini login (admin71 / 123456)',
        passed: false,
        error: `Kutilgan: 200, Olingan: ${res.status} ${JSON.stringify(res.data)}`,
      });
    }
  } catch (e: any) {
    results.push({ name: '2. Maktab admini login', passed: false, error: e.message });
  }

  // Test 3: Parent login
  try {
    const res = await makePostRequest({
      role: 'parent',
      schoolNumber: 71,
      login: '71_001',
      password: '123456',
    });
    if (res.status === 200 && res.data.success && res.data.user.role === 'PARENT') {
      results.push({ name: '3. Ota-ona login (71_001 / 123456)', passed: true });
    } else {
      results.push({
        name: '3. Ota-ona login (71_001 / 123456)',
        passed: false,
        error: `Kutilgan: 200, Olingan: ${res.status} ${JSON.stringify(res.data)}`,
      });
    }
  } catch (e: any) {
    results.push({ name: '3. Ota-ona login', passed: false, error: e.message });
  }

  // Test 4: Super Admin login
  try {
    const res = await makePostRequest({
      login: 'admin@yordamchi.med',
      password: 'superadmin123',
    });
    if (res.status === 200 && res.data.success && res.data.user.role === 'SUPER_ADMIN') {
      results.push({ name: '4. Super Admin login (admin@yordamchi.med / superadmin123)', passed: true });
    } else {
      results.push({
        name: '4. Super Admin login (admin@yordamchi.med / superadmin123)',
        passed: false,
        error: `Kutilgan: 200, Olingan: ${res.status} ${JSON.stringify(res.data)}`,
      });
    }
  } catch (e: any) {
    results.push({ name: '4. Super Admin login', passed: false, error: e.message });
  }

  // Test 5: Invalid password check
  try {
    const res = await makePostRequest({
      role: 'teacher',
      schoolNumber: 71,
      login: 'umumi',
      password: 'wrong_password_123',
    });
    if (res.status === 401) {
      results.push({ name: "5. Noto'g'ri parol kiritilganda 401 qaytarish", passed: true });
    } else {
      results.push({
        name: "5. Noto'g'ri parol kiritilganda 401 qaytarish",
        passed: false,
        error: `Kutilgan: 401, Olingan: ${res.status}`,
      });
    }
  } catch (e: any) {
    results.push({ name: "5. Noto'g'ri parol", passed: false, error: e.message });
  }

  // Test 6: Non-existent user check
  try {
    const res = await makePostRequest({
      role: 'teacher',
      schoolNumber: 71,
      login: 'mavjud_bolmagan_foydalanuvchi',
      password: 'wrong_password_123',
    });
    if (res.status === 401) {
      results.push({ name: "6. Mavjud bo'lmagan foydalanuvchida 401 qaytarish", passed: true });
    } else {
      results.push({
        name: "6. Mavjud bo'lmagan foydalanuvchida 401 qaytarish",
        passed: false,
        error: `Kutilgan: 401, Olingan: ${res.status}`,
      });
    }
  } catch (e: any) {
    results.push({ name: "6. Mavjud bo'lmagan foydalanuvchi", passed: false, error: e.message });
  }

  console.log('TEST NATIJALARI:');
  let hasFailures = false;
  results.forEach((r) => {
    if (r.passed) {
      console.log(`  [PASS] ${r.name}`);
    } else {
      hasFailures = true;
      console.log(`  [FAIL] ${r.name} - XATO: ${r.error}`);
    }
  });

  if (hasFailures) {
    process.exit(1);
  } else {
    console.log('\nBARCHA TESTLAR MUVAFFAQIYATLI O\'TDI! (6/6)');
  }
}

runAuthTests().catch((err) => {
  console.error('Test skriptida xatolik:', err);
  process.exit(1);
});
