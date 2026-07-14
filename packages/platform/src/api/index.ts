// =================================================================
// API SDK Module
// =================================================================
// Responsibilities:
// - Axios instance creation with interceptors
// - Automatic token injection
// - Request/response transformation
// - Error handling
// - Retry logic
// - Request cancellation
// - API endpoint factory
// =================================================================

export { createApiClient } from './apiClient';
export { createApiService } from './apiService';
export { useApiQuery, useApiMutation } from './useApi';
export type { ApiClient } from './apiClient';