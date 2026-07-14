import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { ApiConfig, ApiResponse } from '../types';
import { tokenManager } from '../auth/tokenManager';
import { logger } from '../logging';

export interface ApiClient {
  instance: AxiosInstance;
  get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
}

export function createApiClient(config: ApiConfig): ApiClient {
  const instance = axios.create({
    baseURL: config.baseUrl,
    timeout: config.timeout,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  });

  // Request interceptor - add auth token
  instance.interceptors.request.use(
    async (requestConfig: InternalAxiosRequestConfig) => {
      const token = await tokenManager.getAccessToken();
      if (token && requestConfig.headers) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }

      // Add request ID for tracing
      const requestId = crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      if (requestConfig.headers) {
        requestConfig.headers['X-Request-Id'] = requestId;
      }

      logger.debug(`API Request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`, {
        requestId,
        url: requestConfig.url,
        method: requestConfig.method,
      });

      return requestConfig;
    },
    (error) => {
      logger.error('API Request interceptor error', error);
      return Promise.reject(error);
    },
  );

  // Response interceptor - transform responses
  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      logger.debug(`API Response: ${response.status} ${response.config.url}`, {
        status: response.status,
        url: response.config.url,
        requestId: response.config.headers['X-Request-Id'],
      });
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 - try token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newToken = await tokenManager.refreshToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          logger.error('Token refresh failed on 401', refreshError as Error);
          // Dispatch session expired event
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
        }
      }

      logger.error(`API Error: ${error.response?.status} ${error.config?.url}`, error, {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
      });

      return Promise.reject(error);
    },
  );

  const apiClient: ApiClient = {
    instance,

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
      const response = await instance.get<ApiResponse<T>>(url, config);
      return response.data;
    },

    async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
      const response = await instance.post<ApiResponse<T>>(url, data, config);
      return response.data;
    },

    async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
      const response = await instance.put<ApiResponse<T>>(url, data, config);
      return response.data;
    },

    async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
      const response = await instance.patch<ApiResponse<T>>(url, data, config);
      return response.data;
    },

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
      const response = await instance.delete<ApiResponse<T>>(url, config);
      return response.data;
    },
  };

  return apiClient;
}