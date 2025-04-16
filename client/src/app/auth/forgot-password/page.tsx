'use client';

import apiClient from '@/lib/apiClient'; 
import { ForgotPasswordFormData, forgotPasswordSchema } from '@/lib/validators/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiInformationCircle, HiMail } from 'react-icons/hi'; 
import * as z from 'zod';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  // single message state, could be success or error
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordFormData) => {
    setIsLoading(true);
    setMessage(null);
    try {
      // Call the backend API endpoint
      await apiClient.post('/auth/forgot-password', { email: values.email }); 

      setMessage({
        type: 'success',
        text: 'If an account exists for this email, a password reset link has been sent.',
      });

    } catch (error: any) {
      // Log the actual error for debugging
      console.error("Forgot password request failed:", error);

      // Show a generic error message to the user
      setMessage({
        type: 'error',
        text: 'An error occurred while attempting to send the reset link. Please try again later.',
      });
    } finally {
      // Ensure loading state is turned off regardless of success or error
      setIsLoading(false);
    }
  };

  return (
    // Using AuthLayout background automatically
    <section>
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        {/* Logo could be added here if desired */}
        <div className="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
          <h1 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Forgot your password?
          </h1>
          <p className="font-light text-gray-500 dark:text-gray-400">
            Don't fret! Just type in your email and we will send you a code to reset your password!
          </p>

          {/* Message Area */}
          {message && (
            <Alert
              className="mt-4"
              color={message.type === 'success' ? 'success' : 'failure'}
              icon={HiInformationCircle} // Using info icon for both
              onDismiss={() => setMessage(null)} // Allow dismissing messages
            >
              <span>{message.text}</span>
            </Alert>
          )}

          <form className="mt-4 space-y-4 lg:mt-5 md:space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</Label>
              <TextInput
                id="email"
                type="email"
                icon={HiMail}
                placeholder="name@company.com"
                required
                color={form.formState.errors.email ? 'failure' : 'gray'}
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.formState.errors.email.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner size="sm" light className="mr-3" />
                  Sending...
                </>
              ) : (
                'Request password reset'
              )}
            </Button>
             <div className="text-sm font-light text-gray-500 dark:text-gray-400">
                 Remember your password?{' '}
                 <Link href="/auth/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                     Sign in
                 </Link>
             </div>
          </form>
        </div>
      </div>
    </section>
  );
}