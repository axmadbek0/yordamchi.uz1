/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Legacy facade — yangi kod uchun to'g'ridan-to'g'ri `src/api` dan foydalaning.
 */

import { DailyStatusEntry, Student } from '../types';
import {
  fetchStudents,
  fetchStudentById,
  createStudentFromForm,
  submitDailyLog,
} from '../api/studentApi';
import { analyzeStatusReport } from '../api/aiApi';

export async function getStudents(): Promise<Student[]> {
  return fetchStudents();
}

export async function saveStudent(student: Student, schoolId: string): Promise<Student[]> {
  await createStudentFromForm({
    fullName: student.fullName,
    birthDate: student.birthDate,
    className: student.className,
    schoolId,
    parentPhone: student.parentPhone,
  });
  return fetchStudents();
}

export async function updateStudent(_updatedStudent: Student): Promise<Student[]> {
  return fetchStudents();
}

export async function getReports(): Promise<DailyStatusEntry[]> {
  return [];
}

export async function getReportsForStudent(studentId: string): Promise<DailyStatusEntry[]> {
  const { reports } = await fetchStudentById(studentId);
  return reports;
}

export async function saveDailyReport(report: DailyStatusEntry): Promise<DailyStatusEntry[]> {
  const health = report.healthStatus === 'sog‘lom' ? "sog'lom" : report.healthStatus;
  await submitDailyLog({
    studentId: report.studentId,
    logText: report.teacherNote,
    mood: report.mood,
    health,
  });
  return getReportsForStudent(report.studentId);
}

export async function analyzeReportWithAI(
  fullName: string,
  mood: string,
  health: string,
  teacherNote: string
): Promise<string> {
  return analyzeStatusReport({ fullName, mood, health, teacherNote });
}
