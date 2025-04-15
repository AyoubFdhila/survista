import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore'; 
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
});

// --- Request Interceptor 
apiClient.interceptors.request.use(
  (config) => {
    // console.log('Starting Request', config);
    return config;
  },
  (error) => {
    // console.error('Request Error', error);
    return Promise.reject(error);
  },
);

// --- Response Interceptor 

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
// Queue to hold requests that failed while token was being refreshed
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; config: InternalAxiosRequestConfig<any>; }[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      // If refresh was successful, we might not need to explicitly set the token header
      // prom.config.headers['Authorization'] = `Bearer ${token}`;
      prom.resolve(apiClient(prom.config)); 
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  async (error: AxiosError) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Check if it's a 401 error, not a retry, and not the refresh endpoint itself
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      if (isRefreshing) {
        // If already refreshing, queue the original request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true; // Mark as retried
      isRefreshing = true;

      try {
        console.log('Attempting to refresh token...');
        await apiClient.post('/auth/refresh');
        console.log('Token refresh successful.');

        // Process the queue with null error (success)
        processQueue(null);

        // Retry the original request with the new token (cookie should be updated)
        return apiClient(originalRequest);

      } catch (refreshError) {
        console.error('Unable to refresh token:', refreshError);
        // Process the queue with the refresh error
        processQueue(refreshError as AxiosError, null);

        // Logout the user using Zustand store action
        useAuthStore.getState().logout();

        // Optional: Redirect to login page
        // Check if running in browser context before using window
        if (typeof window !== 'undefined') {
           console.log('Redirecting to login due to refresh failure.');
        }

        return Promise.reject(refreshError); // Reject the original request's promise
      } finally {
        isRefreshing = false; // Reset refreshing flag
      }
    }

    // For errors other than 401 or conditions not met, reject immediately
    return Promise.reject(error);
  },
);

export default apiClient;