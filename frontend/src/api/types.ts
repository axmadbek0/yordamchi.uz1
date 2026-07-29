export interface ApiErrorBody {
  status: 'error';
  statusCode: number;
  message: string;
  code?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface BackendUser {
  id: string;
  login: string;
  full_name: string | null;
  role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'PARENT';
  school_id: string | null;
  phone: string | null;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  token: string;
  user: BackendUser;
}

export interface BackendStudent {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  diagnosis?: string | null;
  dob?: string | null;
  school_id: string;
  parent_id?: string | null;
  parent?: {
    id?: string;
    login: string;
    full_name?: string | null;
    phone?: string | null;
  } | null;
  school?: {
    id: string;
    number: number;
    name: string;
  } | null;
  logs?: BackendDailyLog[];
}

export interface BackendDailyLog {
  id: string;
  student_id: string;
  mood: string;
  health: string;
  teacher_note: string;
  ai_analysis?: string | null;
  date: string;
}

export interface CreateStudentResponse {
  message: string;
  student: BackendStudent;
  parentCredentials: { login: string; password: string } | null;
}

export interface CreateDailyLogResponse {
  message: string;
  log: BackendDailyLog;
  aiGenerated: boolean;
}
