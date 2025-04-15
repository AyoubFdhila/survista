'use client'; 

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore'; 
import apiClient from '@/lib/apiClient'; 
import { AuthResponseUser } from '@/lib/type';

export default function InitializeAuth() {
  const setUser = useAuthStore((state) => state.setUser);
  // Add loading state to prevent layout shifts or brief flashes of wrong content
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      setIsLoading(true);
      try {
        
        const response = await apiClient.get<AuthResponseUser>('/auth/me'); 

        if (response.status === 200 && response.data) {
          // User is authenticated, update the store
          setUser(response.data);
          console.log('User session verified:', response.data); 
        } else {
          // Unexpected response status, treat as unauthenticated
          setUser(null);
        }
      } catch (error: any) {
        // If apiClient throws an error (e.g., 401 Unauthorized), user is not authenticated
        if (error.response && error.response.status === 401) {
          // console.log('No active session found.'); 
        } else {
          // Log other errors (e.g., network issues)
          // console.error('Error checking user session:', error);
        }
        setUser(null); // Ensure state is logged out on any error
      } finally {
        setIsLoading(false); // Finished loading
      }
    };

    checkUserSession();
    // Run this effect only once on component mount
  }, [setUser]); // Dependency array includes setUser from Zustand store

  // Render nothing or a loading indicator while checking
  if (isLoading) {
    // return <div>Loading session...</div>; 
    return null;
  }

  // This component doesn't render anything itself after loading,
  // it just runs the effect. Return null.
  return null;
}