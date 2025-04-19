// client/src/components/admin/users/CreateUserModal.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  Spinner,
  TextInput,
} from 'flowbite-react';
import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
  CreateUserInput,
  createUserSchema,
} from '@/lib/validators/user'; // Import schema and type
import { Role } from '@/lib/type'; // Import Role enum

interface CreateUserModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: SubmitHandler<CreateUserInput>; // Function to handle form submission
  isLoading: boolean; // Loading state for submission
}

export function CreateUserModal({
  show,
  onClose,
  onSubmit,
  isLoading,
}: CreateUserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful }, // Reset form on successful submission
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { // Set default values
      name: '',
      email: '',
      password: '',
      role: Role.SURVEY_MANAGER, // Default role, change if needed
    },
  });

  // Reset form when modal closes or after successful submission
  useEffect(() => {
    if (!show || isSubmitSuccessful) {
      reset(); // Reset form fields and errors
    }
  }, [show, isSubmitSuccessful, reset]);

  const handleFormSubmit: SubmitHandler<CreateUserInput> = (data) => {
     onSubmit(data); // Pass validated data to the parent component's handler
  };


  return (
    <Modal show={show} onClose={onClose} size="lg">
      {/* Use form element to wrap modal content for react-hook-form */}
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <ModalHeader>Create New User</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="create-name">Name *</Label>
              </div>
              <TextInput
                id="create-name"
                placeholder="Full name or username"
                color={errors.name ? 'failure' : 'gray'}
                {...register('name')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="create-email">Email *</Label>
              </div>
              <TextInput
                id="create-email"
                type="email"
                placeholder="name@example.com"
                color={errors.email ? 'failure' : 'gray'}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="create-password">Password *</Label>
              </div>
              <TextInput
                id="create-password"
                type="password"
                placeholder="Min. 8 characters"
                color={errors.password ? 'failure' : 'gray'}
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Role Select */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="create-role">Role *</Label>
              </div>
              <Select
                id="create-role"
                color={errors.role ? 'failure' : 'gray'}
                {...register('role')}
              >
                {/* Map over Role enum values */}
                {Object.values(Role).map((roleValue) => (
                  <option key={roleValue} value={roleValue}>
                    {roleValue}
                  </option>
                ))}
              </Select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.role.message}
                </p>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
            Create User
          </Button>
          <Button color="gray" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}