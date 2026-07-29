import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import {
  createStudentFromForm,
  fetchMyChildren,
  fetchStudentById,
  fetchStudents,
  getApiErrorMessage,
} from '../studentApi';
import { queryKeys } from '../queryClient';

export function useStudents() {
  const { user } = useAuth();

  return useQuery({
    queryKey: user?.role === 'parent' ? queryKeys.students.myChildren : queryKeys.students.all,
    queryFn: user?.role === 'parent' ? fetchMyChildren : fetchStudents,
    enabled: Boolean(user),
  });
}

export function useStudent(studentId?: string) {
  return useQuery({
    queryKey: queryKeys.students.detail(studentId ?? ''),
    queryFn: () => fetchStudentById(studentId!),
    enabled: Boolean(studentId),
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStudentFromForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });
}

export function useCreateStudentErrorMessage(error: unknown): string {
  return getApiErrorMessage(error, 'O\'quvchi qo\'shib bo\'lmadi');
}
