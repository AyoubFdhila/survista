'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore'; 
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import apiClient from '@/lib/apiClient'; 
import { AuthResponseUser } from '@/lib/type'; 
import { Button, Card, Label, Spinner, TextInput, Alert } from 'flowbite-react';
import Link from 'next/link';
import { HiInformationCircle } from 'react-icons/hi';
import { UpdateMyDetailsFormData, updateMyDetailsSchema } from '@/lib/validators/user';


export default function ProfilePage() {
  const user    = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }, // isDirty to enable/disable save button
  } = useForm<UpdateMyDetailsFormData>({
    resolver: zodResolver(updateMyDetailsSchema),
    defaultValues: { 
      name: '',
      firstName: '',
      lastName: '',
    },
  });

  // Effect to populate form when user data loads from store or changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateMyDetailsFormData) => {

    setIsSaving(true); 
    setMessage(null);   

    const payload: Partial<UpdateMyDetailsFormData> = {};
    if (data.name !== undefined) payload.name = data.name;
    payload.firstName = data.firstName === '' ? null : data.firstName;
    payload.lastName = data.lastName === '' ? null : data.lastName;


    console.log('Submitting profile update:', payload);

    try {
      // Call the PATCH /api/auth/me endpoint
      const response = await apiClient.patch<AuthResponseUser>('/auth/me', payload);
      const updatedUser = response.data; 

      // --- Update Global State ---
      setUser(updatedUser);

      // --- Reset Form ---
      reset(updatedUser); // Pass the updated user to reset default values

      // Show success message
      setMessage({ type: 'success', text: 'Profile updated successfully!' });

    } catch (error: any) {
      console.error("Profile update failed:", error);
      const errorMessage = error.response?.data?.message || 'An error occurred while updating your profile.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      // Ensure loading state is turned off
      setIsSaving(false);
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center h-64"><Spinner size="xl" /></div>;
  }

  // Render the profile page content
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto"> 
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        My Profile
      </h1>

      {/* Message Area for feedback */}
      {message && (
         <Alert
           className="mb-4"
           color={message.type === 'success' ? 'success' : 'failure'}
           icon={HiInformationCircle}
           onDismiss={() => setMessage(null)}
         >
           <span>{message.text}</span>
         </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Section 1: Profile Update Form */}
        <Card className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">Account Details</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email (Display Only) */}
            <div>
              <Label htmlFor="email" className="text-gray-500 dark:text-gray-400">Email Address</Label>
              <TextInput id="email" type="email" value={user.email} readOnly disabled className="mt-1 bg-gray-100 dark:bg-gray-700 cursor-not-allowed" />
            </div>
            {/* Name */}
            <div>
              <Label htmlFor="name">Full Name</Label>
              <TextInput
                id="name"
                type="text"
                placeholder="Your full name"
                color={errors.name ? 'failure' : 'gray'}
                {...register('name')}
                className="mt-1"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
            </div>
             {/* First Name */}
             <div>
              <Label htmlFor="firstName">First Name</Label>
              <TextInput
                id="firstName"
                type="text"
                placeholder="Your first name"
                color={errors.firstName ? 'failure' : 'gray'}
                {...register('firstName')}
                className="mt-1"
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName.message}</p>}
            </div>
             {/* Last Name */}
             <div>
              <Label htmlFor="lastName">Last Name</Label>
              <TextInput
                id="lastName"
                type="text"
                placeholder="Your last name"
                color={errors.lastName ? 'failure' : 'gray'}
                {...register('lastName')}
                className="mt-1"
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName.message}</p>}
            </div>
            {/* Role (Display Only) */}
             <div>
              <Label htmlFor="role" className="text-gray-500 dark:text-gray-400">Role</Label>
              <TextInput id="role" type="text" value={user.role} readOnly disabled className="mt-1 bg-gray-100 dark:bg-gray-700 cursor-not-allowed" />
            </div>

            <Button type="submit" disabled={isSaving || !isDirty} className="mt-4">
              {isSaving ? <Spinner size="sm" className="mr-2" /> : null}
              Save Changes
            </Button>
          </form>
        </Card>

        {/* Section 2: Password Change */}
        <Card className="h-fit"> {/* Make card fit content height */}
           <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">Security</h2>
           <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Need to change your password? Use the password reset process.
           </p>
           {/* Link to the existing forgot password page */}
           <Link href="/auth/forgot-password" passHref>
             <Button color="light" className="w-full">
                 Change Password
             </Button>
           </Link>
        </Card>

      </div>
    </div>
  );
}