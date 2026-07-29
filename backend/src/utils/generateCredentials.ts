export function generateParentCredentials(schoolNumber: number, studentSequenceNumber: number) {
  const login = `${schoolNumber}_${String(studentSequenceNumber).padStart(3, '0')}`;
  const password = Math.floor(100000 + Math.random() * 900000).toString();
  return { login, password };
}
