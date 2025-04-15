import { Role, AuthResponseUser } from '@/lib/type';
import { create } from 'zustand';

import { devtools } from 'zustand/middleware';

interface AuthState {
  user: AuthResponseUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthResponseUser | null) => void;
  logout: () => void;
}

// Wrap your store definition with devtools()
export const useAuthStore = create<AuthState>()(
  devtools( 
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => {
        set({ user: user, isAuthenticated: !!user }, false, 'auth/setUser');
      },
      logout: () => {
        set({ user: null, isAuthenticated: false }, false, 'auth/logout');
      },
    }),
    {
      name: 'AuthStore', //  Name for the store instance in DevTools
      
    }
  ) 
);



