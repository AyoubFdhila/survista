'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from 'flowbite-react';

import { useAuthStore } from '@/store/authStore';
import { Role } from '@/lib/type';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const user            = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isAuthReady     = useAuthStore(s => s.isAuthReady);  

  const router = useRouter();

  /* --- redirect logic --- */
  useEffect(() => {
    if (!isAuthReady) return;               

    if (!isAuthenticated) {                 
      router.replace('/auth/login');
      return;
    }

    if (user && user.role !== Role.PLATFORM_ADMIN) {
      router.replace('/dashboard');         
    }
  }, [isAuthReady, isAuthenticated, user, router]);

  /* --- loading UI while auth state still unknown --- */
  if (!isAuthReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  /* --- authorised but wrong role --- */
  if (isAuthenticated && user?.role !== Role.PLATFORM_ADMIN) {
    return null;
  }

  /* --- authorised admin view --- */
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </main>
  );
}
