// ============================================================
// VIGIL AI — Auth Service
// Wraps backend /auth routes with token persistence
// ============================================================

import { authApi } from './api';
import { useUserStore } from '../store/useUserStore';

export const authService = {
  /**
   * Login with email + password.
   * Stores JWT + user in Zustand.
   */
  login: async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { token, refreshToken, user } = res.data.data;

    useUserStore.setState({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.toLowerCase() || 'citizen',
        stats: { totalReports: 0, verifiedReports: 0, savedLives: 0, trustScore: 80 },
        badges: [],
        isAnonymous: false,
        createdAt: new Date(),
      },
      token,
      isAuthenticated: true,
      isLoading: false,
    });

    // Store refresh token for later
    if (refreshToken) {
      try {
        const { AsyncStorage } = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.setItem('refresh_token', refreshToken);
      } catch {
        // AsyncStorage may not be available in all targets
      }
    }

    return { user, token };
  },

  /**
   * Signup a new citizen account.
   */
  signup: async (email: string, password: string, name: string, phone?: string) => {
    const res = await authApi.signup(email, password, name, phone);
    const { token, user } = res.data.data;

    useUserStore.setState({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'citizen',
        stats: { totalReports: 0, verifiedReports: 0, savedLives: 0, trustScore: 80 },
        badges: [],
        isAnonymous: false,
        createdAt: new Date(),
      },
      token,
      isAuthenticated: true,
      isLoading: false,
    });

    return { user, token };
  },

  /**
   * Standalone demo signup fallback if backend is unreachable.
   */
  signupDemo: async (email: string, name: string) => {
    const user = {
      id: `USR-${Date.now()}`,
      name: name || 'Waiz Hussain',
      email: email || 'waiz@gmail.com',
      role: 'citizen',
      stats: { totalReports: 1, verifiedReports: 1, savedLives: 4, trustScore: 95 },
      badges: ['First Responder'],
      isAnonymous: false,
      createdAt: new Date(),
    };
    const token = 'demo_token_' + Date.now();

    useUserStore.setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });

    return { user, token };
  },

  /**
   * Standalone demo login fallback if backend is unreachable.
   */
  loginDemo: async () => {
    const user = {
      id: 'USR-001',
      name: 'Waiz Hussain',
      email: 'waiz@gmail.com',
      role: 'super_admin',
      stats: { totalReports: 24, verifiedReports: 18, savedLives: 156, trustScore: 98 },
      badges: ['Crisis Commander', 'AI Pioneer'],
      isAnonymous: false,
      createdAt: new Date(),
    };
    const token = 'demo_token_admin';

    useUserStore.setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });

    return { user, token };
  },

  logout: () => {
    useUserStore.getState().logout();
  },
};
