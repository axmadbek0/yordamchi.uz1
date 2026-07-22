/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Generates credentials for a teacher.
 */
export function generateTeacherCredentials(schoolNumber: number, teacherIndex: number) {
  const login = teacherIndex === 1 ? 'umumi' : `umumi${teacherIndex}`;
  const password = `${schoolNumber}maktab${login}`;
  return { login, password };
}

/**
 * Generates credentials for a parent when a student is added.
 */
export function generateParentCredentials(schoolNumber: number, studentSequenceNumber: number) {
  const login = `${schoolNumber}_${String(studentSequenceNumber).padStart(3, '0')}`;
  const password = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit random password
  return { login, password };
}
export function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
