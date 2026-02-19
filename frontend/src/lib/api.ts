import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = data.data.tokens;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// API Functions
// ============================================================================

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) =>
    api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/password', data),
};

// Signals
export const signalsApi = {
  list: (params?: Record<string, any>) =>
    api.get('/signals', { params }),
  active: () =>
    api.get('/signals/active'),
  get: (id: string) =>
    api.get(`/signals/${id}`),
  create: (data: any) =>
    api.post('/signals', data),
  update: (id: string, data: any) =>
    api.patch(`/signals/${id}`, data),
  delete: (id: string) =>
    api.delete(`/signals/${id}`),
  // Fast signal generation — "Start Signals" feature
  generate: (category: string, asset: string, timeframe: string) =>
    api.get(`/signals/generate/${category}/${asset}/${timeframe}`, { timeout: 35000 }),
};

// Bot
export const botApi = {
  start: (config: any) =>
    api.post('/bot/start', config),
  stop: (data?: { botId?: string; category?: string }) =>
    api.post('/bot/stop', data),
  status: () =>
    api.get('/bot/status'),
  config: () =>
    api.get('/bot/config'),
  updateConfig: (id: string, data: any) =>
    api.put(`/bot/config/${id}`, data),
};

// Trades
export const tradesApi = {
  list: (params?: Record<string, any>) =>
    api.get('/trades', { params }),
  stats: () =>
    api.get('/trades/stats'),
  create: (data: any) =>
    api.post('/trades', data),
};

// Subscriptions
export const subscriptionsApi = {
  plans: () =>
    api.get('/subscriptions/plans'),
  create: (planSlug: string) =>
    api.post('/subscriptions/create', { planSlug }),
  status: () =>
    api.get('/subscriptions/status'),
  cancel: () =>
    api.post('/subscriptions/cancel'),
};

// Performance
export const performanceApi = {
  global: () =>
    api.get('/performance/global'),
  byAsset: () =>
    api.get('/performance/by-asset'),
  byTimeframe: () =>
    api.get('/performance/by-timeframe'),
  leaderboard: () =>
    api.get('/performance/leaderboard'),
};

// Assets
export const assetsApi = {
  list: (category?: string) =>
    api.get('/assets', { params: category ? { category } : {} }),
  get: (symbol: string) =>
    api.get(`/assets/${symbol}`),
};

// Validation
export const validationApi = {
  pending: () =>
    api.get('/validation/pending'),
  validate: (signalId: string, data: any) =>
    api.post(`/validation/${signalId}`, data),
  stats: () =>
    api.get('/validation/stats'),
};
