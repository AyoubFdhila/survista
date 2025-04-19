import { Role, AuthResponseUser } from '@/lib/type';
import { create } from 'zustand';

import { devtools } from 'zustand/middleware';

interface AuthState {
  user: AuthResponseUser | null;
  isAuthenticated: boolean;
  /** true once the initial /auth/me check (or refresh) finishes */
  isAuthReady: boolean;
  setUser: (user: AuthResponseUser | null) => void;
  setAuthReady: (ready: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    user: null,
    isAuthenticated: false,
    isAuthReady: false,             

    setUser: (user) =>
      set(
        { user, isAuthenticated: !!user },
        false,
        'auth/setUser'
      ),

    setAuthReady: (ready) =>
      set({ isAuthReady: ready }, false, 'auth/setAuthReady'),

    logout: () =>
      set(
        { user: null, isAuthenticated: false, isAuthReady: true },
        false,
        'auth/logout'
      ),
  }))
);
