'use client';

import apiClient from "@/lib/apiClient";
import { LoginFormData, loginSchema } from "@/lib/validators/auth";
import { useAuthStore } from "@/store/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// Import Flowbite components
import { Role } from "@/lib/type";
import { Alert, Button, Checkbox, Label, Spinner, TextInput } from "flowbite-react";
import { HiCheckCircle, HiInformationCircle } from 'react-icons/hi';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { setUser, isAuthenticated } = useAuthStore();


useEffect(() => {
  // If the user becomes authenticated while on this page, redirect based on role
  if (isAuthenticated && user) { 
    console.log(`Login Page: User authenticated with role ${user.role}. Redirecting...`);
    if (user.role === Role.PLATFORM_ADMIN) {
      router.replace('/admin/users'); 
    } else {
      router.replace('/dashboard'); 
    }
  }
  // Dependency array: run when isAuthenticated or user object changes
}, [isAuthenticated, user, router]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Updated onSubmit function:
async function onSubmit(values: LoginFormData) {
  setIsLoading(true);
  setAlertMessage(null);
  try {
    const response = await apiClient.post('/auth/login', values);
    const userData = response.data; // Contains user data including role

    // 1. Update the Zustand store
    setUser(userData);

    // 2. Show the success message
    setAlertMessage({ type: 'success', message: 'Login Successful! Redirecting...' });

    // 3. Wait briefly, then redirect based on role
    setTimeout(() => {
      if (userData.role === Role.PLATFORM_ADMIN) {
        router.push('/admin/users'); // Redirect admin
      } else {
        router.push('/dashboard'); // Redirect other authenticated users
      }
      // No need to setIsLoading(false) here as the component will unmount
    }, 1500); // Wait 1.5 seconds (1500ms) before redirecting

  } catch (error: any) {
    // Only set loading to false if there's an error
    setIsLoading(false);
    console.error("Login failed:", error);
    const errorMessage = error.response?.data?.message || "Invalid credentials";
    setAlertMessage({ type: 'error', message: errorMessage });
  }
}

  // Helper function to display validation errors below input
  const renderError = (fieldName: keyof LoginFormData) => {
    return form.formState.errors[fieldName] ? (
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.formState.errors[fieldName]?.message}</p>
    ) : null;
  };


  return (
    <section>
       {/* Main grid container for two-column layout */}
      <div className="mx-auto grid min-h-screen max-w-screen-xl px-4 py-8 lg:grid-cols-12 lg:gap-20 lg:py-16 items-center">

        {/* Form container  */}
        <div className="w-full place-self-center lg:col-span-6">
          <div className="mx-auto rounded-lg bg-white p-6 shadow dark:bg-gray-800 sm:max-w-xl sm:p-8">
            {/* Logo and App Name */}
            <Link href="/" className="mb-4 inline-flex items-center text-xl font-semibold text-gray-900 dark:text-white">
              {/* <img
                alt="logo"
                src=""
                className="mr-2 h-8 w-8"
              /> */}
              Survista {/* Your App Name */}
            </Link>
            {/* Title */}
            <h1 className="mb-2 text-2xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
              Welcome back 
            </h1>
            {/* Subtitle with Signup Link */}
            <p className="text-sm font-light text-gray-500 dark:text-gray-300">
              Ready to continue? Don’t have an account?&nbsp; 
              <Link
                href="/auth/signup" 
                className="font-medium text-primary-600 hover:underline dark:text-primary-500"
              >
                Sign up
              </Link>
              .
            </p>

            {/* Alert Message Area */}
            {alertMessage && (
              <Alert
                className="mt-4 mb-4" 
                color={alertMessage.type === 'success' ? 'success' : 'failure'}
                icon={alertMessage.type === 'success' ? HiCheckCircle : HiInformationCircle}
                onDismiss={() => setAlertMessage(null)}
              >
                <span>
                  <span className="font-medium">
                    {alertMessage.type === 'success' ? 'Success!' : 'Error!'}
                  </span>{' '}
                  {alertMessage.message}
                </span>
              </Alert>
            )}

            {/* Form */}
            <form className="mt-4 space-y-6 sm:mt-6" onSubmit={form.handleSubmit(onSubmit)}>
              {/* Input Fields Grid */}
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Email Field */}
                <div>
                  <Label htmlFor="email" className="mb-2 block dark:text-white">Email</Label>
                  <TextInput
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    required
                    color={form.formState.errors.email ? 'failure' : 'gray'}
                    {...form.register("email")}
                  />
                   {renderError('email')} 
                </div>
                {/* Password Field */}
                 <div>
                  <Label htmlFor="password" className="mb-2 block dark:text-white">Password</Label>
                  <TextInput
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    color={form.formState.errors.password ? 'failure' : 'gray'}
                    {...form.register("password")}
                  />
                  {renderError('password')} {/* Keep error display */}
                </div>
              </div>

              {/* "Or" Divider */}
              <div className="flex items-center pt-4"> 
                <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="px-5 text-center text-gray-500 dark:text-gray-400">
                  or
                </div>
                <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700"></div>
              </div>

                {/* Google Login Button */}
            <a
              href={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api'}/auth/google`} 
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Google SVG code... */}
                <g clipPath="url(#clip0_13183_10121)">
                  <path d="M20.3081 10.2303C20.3081 9.55056 20.253 8.86711 20.1354 8.19836H10.7031V12.0492H16.1046C15.8804 13.2911 15.1602 14.3898 14.1057 15.0879V17.5866H17.3282C19.2205 15.8449 20.3081 13.2728 20.3081 10.2303Z" fill="#3F83F8"/>
                  <path d="M10.7019 20.0006C13.3989 20.0006 15.6734 19.1151 17.3306 17.5865L14.1081 15.0879C13.2115 15.6979 12.0541 16.0433 10.7056 16.0433C8.09669 16.0433 5.88468 14.2832 5.091 11.9169H1.76562V14.4927C3.46322 17.8695 6.92087 20.0006 10.7019 20.0006V20.0006Z" fill="#34A853"/>
                  <path d="M5.08857 11.9169C4.66969 10.6749 4.66969 9.33008 5.08857 8.08811V5.51233H1.76688C0.348541 8.33798 0.348541 11.667 1.76688 14.4927L5.08857 11.9169V11.9169Z" fill="#FBBC04"/>
                  <path d="M10.7019 3.95805C12.1276 3.936 13.5055 4.47247 14.538 5.45722L17.393 2.60218C15.5852 0.904587 13.1858 -0.0287217 10.7019 0.000673888C6.92087 0.000673888 3.46322 2.13185 1.76562 5.51234L5.08732 8.08813C5.87733 5.71811 8.09302 3.95805 10.7019 3.95805V3.95805Z" fill="#EA4335"/>
                </g>
                <defs><clipPath id="clip0_13183_10121"><rect width="20" height="20" fill="white" transform="translate(0.5)"/></clipPath></defs>
              </svg>
              Sign in with Google
            </a>

              {/* Remember Me / Forgot Password Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <Checkbox id="remember-login" />
                  </div>
                  <div className="ml-3 text-sm">
                    <Label htmlFor="remember-login" className="text-gray-500 dark:text-gray-300">Remember me</Label>
                  </div>
                </div>
                <Link href="/auth/forgot-password" 
                  className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner size="sm" light className="mr-3" />
                    Logging in...
                  </>
                ) : (
                  'Sign in to your account'
                )}
              </Button>

            </form>
          </div>
        </div> {/* End Form container wrapper */}

        {/* Illustration */}
        <div className="mr-auto place-self-center lg:col-span-6">
          <img
            alt="Illustration"
            src="/login-illustration.png"
            className="mx-auto hidden lg:flex" 
          />
        </div> {/* End Illustration container */}

      </div> {/* End Main grid container */}
    </section>
  );
}