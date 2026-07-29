import { DailyStatusEntry, Student } from '../types';
import { apiClient, getApiErrorMessage } from './axios';
import { mapDailyLogFromApi, mapStudentFromApi, splitFullName } from './mappers';
import {
  BackendStudent,
  CreateDailyLogResponse,
  CreateStudentResponse,
} from './types';

export interface CreateStudentPayload {
  firstName: string;
  lastName: string;
  dob: string;
  schoolId: string;
  className?: string;
  parentPhone?: string;
  diagnosis?: string;
}

export interface SubmitDailyLogPayload {
  studentId: string;
  logText: string;
  mood: DailyStatusEntry['mood'];
  health: string;
}

export async function fetchStudents(): Promise<Student[]> {
  const { data } = await apiClient.get<BackendStudent[]>('/v1/students');
  return data.map((student, index) => mapStudentFromApi(student, index));
}

export async function fetchMyChildren(): Promise<Student[]> {
  const { data } = await apiClient.get<BackendStudent[]>('/v1/students/me/children');
  return data.map((student, index) => mapStudentFromApi(student, index));
}

export async function fetchStudentById(studentId: string): Promise<{
  student: Student;
  reports: DailyStatusEntry[];
}> {
  const { data } = await apiClient.get<BackendStudent>(`/v1/students/${studentId}`);
  const student = mapStudentFromApi(data);
  const reports = (data.logs ?? []).map(mapDailyLogFromApi);
  return { student, reports };
}

export async function createStudent(payload: CreateStudentPayload): Promise<{
  student: Student;
  parentCredentials: { login: string; password: string } | null;
}> {
  const { data } = await apiClient.post<CreateStudentResponse>('/v1/students', payload);
  return {
    student: mapStudentFromApi(data.student),
    parentCredentials: data.parentCredentials,
  };
}

export async function createStudentFromForm(input: {
  fullName: string;
  birthDate: string;
  className: string;
  schoolId: string;
  parentPhone: string;
}): Promise<{
  student: Student;
  parentCredentials: { login: string; password: string } | null;
}> {
  const { firstName, lastName } = splitFullName(input.fullName);
  return createStudent({
    firstName,
    lastName,
    dob: input.birthDate || '2015-01-01',
    schoolId: input.schoolId,
    className: input.className,
    parentPhone: input.parentPhone,
  });
}

export async function submitDailyLog(payload: SubmitDailyLogPayload): Promise<DailyStatusEntry> {
  const health = payload.health === 'sog‘lom' ? "sog'lom" : payload.health;

  const { data } = await apiClient.post<CreateDailyLogResponse>('/v1/daily-logs', {
    studentId: payload.studentId,
    logText: payload.logText,
    mood: payload.mood,
    health,
  });

  return mapDailyLogFromApi(data.log);
}

export { getApiErrorMessage };
