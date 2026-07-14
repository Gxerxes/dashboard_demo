import type { ApiClient } from './apiClient';
import type { PaginatedResponse } from '../types';

export class ApiService {
  constructor(protected api: ApiClient) {}

  protected async get<T>(url: string): Promise<T> {
    const response = await this.api.get<T>(url);
    return response.data;
  }

  protected async getPaginated<T>(url: string, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<T>> {
    const response = await this.api.get<PaginatedResponse<T>>(url, {
      params: { page, pageSize },
    });
    return response.data;
  }

  protected async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.api.post<T>(url, data);
    return response.data;
  }

  protected async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.api.put<T>(url, data);
    return response.data;
  }

  protected async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.api.patch<T>(url, data);
    return response.data;
  }

  protected async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete<T>(url);
    return response.data;
  }
}

export function createApiService(api: ApiClient): ApiService {
  return new ApiService(api);
}