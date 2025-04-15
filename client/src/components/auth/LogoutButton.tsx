'use client'; 

import { useRouter } from 'next/navigation'; 
import { useAuthStore } from '@/store/authStore'; 
import apiClient from '@/lib/apiClient'; 
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast'; 
import { LogOut } from 'lucide-react'; 

export function LogoutButton() {
  const router = useRouter();
  const zustandLogout = useAuthStore((state) => state.logout); // Get the logout action
  const { toast } = useToast(); // Get toast function

  const handleLogout = async () => {
    try {
      // Call the backend logout endpoint
      await apiClient.post('/auth/logout');
      toast({ title: 'Logout Successful', description: 'You have been logged out.' });
    } catch (error: any) {
      console.error('Logout failed:', error);
      // Still attempt to log out on the client even if backend call fails
      toast({
        title: 'Logout Error',
        description: error.response?.data?.message || 'Could not log out properly. Please try again.',
        variant: 'destructive',
      });
    } finally {
      // Always clear client-side state and redirect
      zustandLogout(); 
      // Redirect to the login page
      router.replace('/auth/login');
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" /> 
      Logout
    </Button>
  );
}