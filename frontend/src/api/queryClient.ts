import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const queryKeys = {
  students: {
    all: ['students'] as const,
    detail: (id: string) => ['students', id] as const,
    myChildren: ['students', 'me', 'children'] as const,
  },
  reports: {
    byStudent: (studentId: string) => ['reports', studentId] as const,
  },
} as const;
