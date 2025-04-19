/* lib/apiClient.ts */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

declare module 'axios' {
  // allow custom flag in config object
  export interface InternalAxiosRequestConfig<D = any> {
    skipAuthRefresh?: boolean;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/* ---------- Request interceptor (unchanged) ------------ */
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

/* ---------- Response interceptor ----------------------- */
let isRefreshing = false;
let failedQueue: {
  resolve: (val: unknown) => void;
  reject: (reason?: any) => void;
  config: InternalAxiosRequestConfig;
}[] = [];

const processQueue = (err: AxiosError | null) => {
  failedQueue.forEach(({ resolve, reject, config }) =>
    err ? reject(err) : resolve(apiClient(config))
  );
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    /* ---------------------------------------------------- */
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    /* 1 ▸ Ignore 401 when caller asked to skip refresh */
    if (original.skipAuthRefresh) {
      return Promise.reject(error);
    }

    /* 2 ▸ Standard refresh logic */
    if (
      error.response?.status === 401 &&
      !original._retry &&
      original.url !== '/auth/refresh'
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          failedQueue.push({ resolve, reject, config: original })
        );
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post('/auth/refresh');
        processQueue(null);
        return apiClient(original);
      } catch (refreshErr) {
        processQueue(refreshErr as AxiosError);
        useAuthStore.getState().logout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
