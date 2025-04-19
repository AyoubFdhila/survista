'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from 'flowbite-react';

import { useAuthStore } from '@/store/authStore';
import { Role } from '@/lib/type';   

/**
 * Protects everything under /admin.
 * – Shows a full‑page spinner while the session is still resolving.
 * – Lets through only users whose role === PLATFORM_ADMIN.
 * – Redirects others (or unauthenticated visitors) inside a useEffect.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  /* --- read store state --- */
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const router = useRouter();

  /* --- redirect logic --- */
  useEffect(() => {
    // still loading (no info yet) → do nothing, just keep spinner
    if (user === null && !isAuthenticated) return;

    // unauthenticated → login
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    // authenticated but not an admin → dashboard
    if (user && user.role !== Role.PLATFORM_ADMIN) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  /* --- loading UI while session check runs --- */
  if (user === null && !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  /* --- authorised but wrong role: effect will redirect; render nothing --- */
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
