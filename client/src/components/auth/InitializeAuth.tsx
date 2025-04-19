'use client'; 

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore'; 
import apiClient from '@/lib/apiClient'; 
import { AuthResponseUser } from '@/lib/type';
export default function InitializeAuth() {
  const setUser = useAuthStore(s => s.setUser);
  const setAuthReady = useAuthStore(s => s.setAuthReady);

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await apiClient.get<AuthResponseUser>('/auth/me');
        setUser(data);
      } catch {
        setUser(null);            
      } finally {
        setAuthReady(true);       
      }
    };
    run();
  }, [setUser, setAuthReady]);

  return null;                    
}
