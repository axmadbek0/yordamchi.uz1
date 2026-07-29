import { DailyStatusEntry, Student } from '../types';
import { BackendDailyLog, BackendStudent } from './types';

function normalizeHealth(value: string): DailyStatusEntry['healthStatus'] {
  const map: Record<string, DailyStatusEntry['healthStatus']> = {
    "sog'lom": 'sog‘lom',
    'sog‘lom': 'sog‘lom',
    'yengil bezovta': 'yengil bezovta',
    betob: 'betob',
  };
  return map[value] ?? 'sog‘lom';
}

export function mapStudentFromApi(s: BackendStudent, index = 0): Student {
  const [firstName, ...rest] = `${s.first_name} ${s.last_name}`.trim().split(' ');
  return {
    id: s.id,
    fullName: `${s.first_name || ''} ${s.last_name || ''}`.trim() || firstName,
    birthDate: s.dob ? s.dob.split('T')[0] : '2015-01-01',
    className: s.class_name || '4-A',
    schoolNumber: s.school?.number ?? 0,
    sequenceNumber: index + 1,
    parentPhone: s.parent?.phone || '+998 00 000 00 00',
    parentLogin: s.parent?.login || 'unknown',
    parentPassword: '',
    credentialsActivated: Boolean(s.parent_id),
  };
}

export function mapDailyLogFromApi(log: BackendDailyLog): DailyStatusEntry {
  return {
    id: log.id,
    studentId: log.student_id,
    date: log.date ? log.date.split('T')[0] : new Date().toISOString().split('T')[0],
    healthStatus: normalizeHealth(log.health),
    mood: log.mood as DailyStatusEntry['mood'],
    teacherNote: log.teacher_note,
    aiAnalysis: log.ai_analysis ?? undefined,
    createdAt: log.date,
  };
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '-' };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}
