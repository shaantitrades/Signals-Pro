import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ============================================================================
// Auth Store
// ============================================================================

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  subscription?: any;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
  hasActiveSubscription: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  login: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  initAuth: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    // Helper: try /me with a given token
    const fetchMe = async (accessToken: string) => {
      const { data } = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return data;
    };
    // Helper: refresh tokens
    const tryRefresh = async (): Promise<string | null> => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return null;
      try {
        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
        const { accessToken: newAccess, refreshToken: newRefresh } = data.data.tokens;
        localStorage.setItem('accessToken', newAccess);
        localStorage.setItem('refreshToken', newRefresh);
        return newAccess;
      } catch {
        return null;
      }
    };
    try {
      const data = await fetchMe(token);
      if (data.success && data.data) {
        set({ user: data.data, isAuthenticated: true, isLoading: false });
        return;
      }
    } catch (err: any) {
      // Access token expired → try refresh
      if (err?.response?.status === 401) {
        const newToken = await tryRefresh();
        if (newToken) {
          try {
            const data = await fetchMe(newToken);
            if (data.success && data.data) {
              set({ user: data.data, isAuthenticated: true, isLoading: false });
              return;
            }
          } catch {
            // refresh token also invalid
          }
        }
      }
    }
    // Could not authenticate at all
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  hasActiveSubscription: () => {
    const user = get().user;
    if (!user?.subscription) return false;
    const sub = user.subscription;
    const isActive = sub.status === 'ACTIVE' || sub.status === 'TRIAL';
    const notExpired = new Date(sub.currentPeriodEnd) > new Date();
    return isActive && notExpired;
  },
}));

// ============================================================================
// Signal Store
// ============================================================================

interface Signal {
  id: string;
  asset: string;
  category: string;
  action: 'BUY' | 'SELL';
  entryPrice: number;
  takeProfit1: number;
  takeProfit2?: number;
  takeProfit3?: number;
  stopLoss: number;
  timeframe: string;
  confidenceScore: number;
  riskLevel: string;
  status: string;
  validationStatus: string;
  pnlPips?: number;
  result?: string;
  createdAt: string;
}

interface SignalState {
  activeSignals: Signal[];
  selectedSignal: Signal | null;
  filters: {
    category: string | null;
    timeframe: string | null;
    riskLevel: string | null;
    minConfidence: number;
  };
  setActiveSignals: (signals: Signal[]) => void;
  addSignal: (signal: Signal) => void;
  updateSignal: (signal: Signal) => void;
  removeSignal: (id: string) => void;
  setSelectedSignal: (signal: Signal | null) => void;
  setFilters: (filters: Partial<SignalState['filters']>) => void;
}

export const useSignalStore = create<SignalState>((set) => ({
  activeSignals: [],
  selectedSignal: null,
  filters: {
    category: null,
    timeframe: null,
    riskLevel: null,
    minConfidence: 0,
  },
  setActiveSignals: (signals) => set({ activeSignals: signals }),
  addSignal: (signal) =>
    set((state) => ({
      activeSignals: [signal, ...state.activeSignals],
    })),
  updateSignal: (signal) =>
    set((state) => ({
      activeSignals: state.activeSignals.map((s) =>
        s.id === signal.id ? { ...s, ...signal } : s
      ),
    })),
  removeSignal: (id) =>
    set((state) => ({
      activeSignals: state.activeSignals.filter((s) => s.id !== id),
    })),
  setSelectedSignal: (signal) => set({ selectedSignal: signal }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
}));

// ============================================================================
// Bot Store
// ============================================================================

interface BotConfig {
  id: string;
  category: string;
  assets: string[];
  timeframes: string[];
  isActive: boolean;
  minConfidence: number;
  maxConcurrent: number;
  riskPerTrade: number;
}

interface BotState {
  activeBots: BotConfig[];
  isStarting: boolean;
  setActiveBots: (bots: BotConfig[]) => void;
  addBot: (bot: BotConfig) => void;
  removeBot: (id: string) => void;
  setIsStarting: (v: boolean) => void;
}

export const useBotStore = create<BotState>((set) => ({
  activeBots: [],
  isStarting: false,
  setActiveBots: (bots) => set({ activeBots: bots }),
  addBot: (bot) =>
    set((state) => ({ activeBots: [...state.activeBots, bot] })),
  removeBot: (id) =>
    set((state) => ({
      activeBots: state.activeBots.filter((b) => b.id !== id),
    })),
  setIsStarting: (v) => set({ isStarting: v }),
}));

// ============================================================================
// WebSocket Store
// ============================================================================

interface WSState {
  socket: Socket | null;
  isConnected: boolean;
  latency: number;
  connect: (token: string) => void;
  disconnect: () => void;
}

export const useWSStore = create<WSState>((set, get) => ({
  socket: null,
  isConnected: false,
  latency: 0,
  connect: (token: string) => {
    const existing = get().socket;
    if (existing?.connected) return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
      set({ isConnected: true });
      socket.emit('signals:subscribe');
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
      set({ isConnected: false });
    });

    // Signal events
    socket.on('signal:new', (signal: Signal) => {
      useSignalStore.getState().addSignal(signal);
    });

    socket.on('signal:updated', (signal: Signal) => {
      useSignalStore.getState().updateSignal(signal);
    });

    socket.on('signal:cancelled', ({ id }: { id: string }) => {
      useSignalStore.getState().removeSignal(id);
    });

    socket.on('signal:expired', ({ id }: { id: string }) => {
      useSignalStore.getState().removeSignal(id);
    });

    // Latency measurement
    setInterval(() => {
      const start = Date.now();
      socket.emit('ping:measure');
      socket.once('pong:measure', () => {
        set({ latency: Date.now() - start });
      });
    }, 5000);

    set({ socket });
  },
  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },
}));
