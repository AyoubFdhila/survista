'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from 'flowbite-react';

import { useAuthStore } from '@/store/authStore';

export default function MainLayout({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isAuthReady     = useAuthStore(s => s.isAuthReady);  
  const router          = useRouter();

  /* redirect non‑logged users once we know the session status */
  useEffect(() => {
    if (isAuthReady && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthReady, isAuthenticated, router]);

  /* show spinner until auth check finishes */
  if (!isAuthReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </main>
  );
}
