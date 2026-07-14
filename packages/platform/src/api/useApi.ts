import { useQuery, useMutation, type UseQueryOptions, type UseMutationOptions, type QueryKey } from '@tanstack/react-query';
import type { ApiClient } from './apiClient';
import type { ApiResponse } from '../types';

export function useApiQuery<TData, TError = Error>(
  api: ApiClient,
  queryKey: QueryKey,
  url: string,
  options?: Omit<UseQueryOptions<ApiResponse<TData>, TError, TData>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<ApiResponse<TData>, TError, TData>({
    queryKey,
    queryFn: () => api.get<TData>(url),
    select: (response) => response.data,
    ...options,
  });
}

export function useApiMutation<TData, TVariables = void, TError = Error>(
  api: ApiClient,
  method: 'post' | 'put' | 'patch' | 'delete',
  url: string,
  options?: Omit<UseMutationOptions<ApiResponse<TData>, TError, TVariables>, 'mutationFn'>,
) {
  return useMutation<ApiResponse<TData>, TError, TVariables>({
    mutationFn: async (variables) => {
      switch (method) {
        case 'post':
          return api.post<TData>(url, variables);
        case 'put':
          return api.put<TData>(url, variables);
        case 'patch':
          return api.patch<TData>(url, variables);
        case 'delete':
          return api.delete<TData>(url);
      }
    },
    ...options,
  });
}