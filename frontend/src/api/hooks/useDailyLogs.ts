import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DailyStatusEntry } from '../../types';
import { submitDailyLog, getApiErrorMessage } from '../studentApi';
import { queryKeys } from '../queryClient';

export function useSubmitDailyLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitDailyLog,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reports.byStudent(variables.studentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.students.detail(variables.studentId),
      });
    },
  });
}

export function useDailyLogErrorMessage(error: unknown): string {
  return getApiErrorMessage(error, 'Kunlik hisobot saqlanmadi');
}

export type SubmitDailyLogInput = {
  studentId: string;
  logText: string;
  mood: DailyStatusEntry['mood'];
  health: DailyStatusEntry['healthStatus'];
};
