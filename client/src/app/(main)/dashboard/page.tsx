'use client';


import { LogoutButton } from '@/components/auth/LogoutButton';
import { useAuthStore } from '@/store/authStore';

const DashboardPage = () => {
  // Get user info 
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      <p>Welcome! You are logged in.</p>
      {user && <p>Email: {user.email}</p>}

      <div style={{ marginTop: '1rem' }}> 

        <LogoutButton />
      </div>
    </div>
  );
};

export default DashboardPage; // Export with PascalCase name