'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import apiClient from '@/lib/apiClient'; // Ensure path is correct
import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { HiLockClosed, HiInformationCircle } from 'react-icons/hi';
import { ResetPasswordFormData, resetPasswordSchema } from '@/lib/validators/auth';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token'); 
    const selector = searchParams.get('selector');

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isTokenChecked, setIsTokenChecked] = useState(false); // Track if initial token check is done
    const [isTokenPresent, setIsTokenPresent] = useState(false); // Track if token exists in URL

    // Check for token presence on mount
    useEffect(() => {
        if (token && selector) {
            setIsTokenPresent(true);
            console.log("Reset selector & token found:", selector, token);
        } else {
            setIsTokenPresent(false);
            setMessage({ type: 'error', text: 'Invalid or missing password reset link.' });
            console.error("Reset token missing from URL.");
        }
        setIsTokenChecked(true); // Mark check as done
    }, [token, selector]); // Dependency array

    // Form setup
    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
          password: '',
          confirmPassword: '',
        },
    });

    // Form submission handler
    const onSubmit = async (values: ResetPasswordFormData) => {
        if (!token || !selector) { // Check for both
            setMessage({ type: 'error', text: 'Cannot reset password without a valid link (missing info).' });
            return;
        }
        setIsLoading(true);
        setMessage(null);

        try {
            // Call the backend API
            await apiClient.post('/auth/reset-password', {
              selector: selector, 
              token: token,
              password: values.password,
            });

            setMessage({ type: 'success', text: 'Password has been reset successfully! Redirecting to login...' });

            // Redirect to login after a delay
            setTimeout(() => {
              router.push('/auth/login');
            }, 2500);

        } catch (error: any) {
            console.error("Reset password failed:", error);
            const errorMessage = error.response?.data?.message || 'An error occurred. The token might be invalid/expired, or the server encountered an issue.';
            setMessage({ type: 'error', text: errorMessage });
            setIsLoading(false); // Stop loading on error
        }
    };

    // Show loading state while checking for token
    if (!isTokenChecked) {
        return <div className="flex h-screen items-center justify-center"><Spinner size="xl"/></div>;
    }

    // Show error view if token was missing from URL
    if (!isTokenPresent) {
         return (
             <section>
                  <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                      <div className="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
                          <h1 className="text-xl font-bold text-red-600 dark:text-red-400">Invalid Link</h1>
                          {message && <p className="text-gray-600 dark:text-gray-400 mt-2">{message.text}</p>}
                          <Link href="/auth/login" className="mt-4 inline-block text-primary-600 hover:underline dark:text-primary-500">
                              Return to Login
                          </Link>
                      </div>
                  </div>
              </section>
         );
    }

    // Render the main form if token was present
    return (
       <section>
         <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
           <div className="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
             <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
               Set New Password
             </h1>
             <p className="font-light text-gray-500 dark:text-gray-400 mb-4">
                 Please enter and confirm your new password below.
             </p>

             {/* Message Alert Area */}
             {message && (
               <Alert
                 className="mt-4"
                 color={message.type === 'success' ? 'success' : 'failure'}
                 icon={HiInformationCircle}
                 onDismiss={() => setMessage(null)}
               >
                 <span>{message.text}</span>
               </Alert>
             )}

             {/* Reset Password Form */}
             <form className="mt-4 space-y-4 lg:mt-5 md:space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
                {/* New Password Field */}
                <div>
                    <Label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">New Password</Label>
                    <TextInput
                    id="password"
                    type="password"
                    icon={HiLockClosed}
                    placeholder="••••••••"
                    required
                    color={form.formState.errors.password ? 'failure' : 'gray'}
                    {...form.register('password')}
                    />
                    {/* Display validation error message */}
                    {form.formState.errors.password && (
                       <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                         {form.formState.errors.password.message}
                       </p>
                    )}
                </div>
                {/* Confirm Password Field */}
                <div>
                    <Label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm New Password</Label>
                    <TextInput
                    id="confirmPassword"
                    type="password"
                    icon={HiLockClosed}
                    placeholder="••••••••"
                    required
                    color={form.formState.errors.confirmPassword ? 'failure' : 'gray'}
                    {...form.register('confirmPassword')}
                    />
                     {/* Display validation error message */}
                    {form.formState.errors.confirmPassword && (
                       <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                         {form.formState.errors.confirmPassword.message}
                       </p>
                    )}
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                    <>
                        <Spinner size="sm" light className="mr-3" />
                        Resetting Password...
                    </>
                    ) : (
                    'Reset Password'
                    )}
                </Button>
             </form>
           </div>
         </div>
       </section>
    );
}

// --- Main Page Component using Suspense ---
// This wraps the form component to allow useSearchParams hook
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner size="xl" /></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}