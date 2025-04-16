import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  name: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Please confirm your password." }) 
})

.refine((data) => data.password === data.confirmPassword, { 
  message: "Passwords don't match",
  path: ["confirmPassword"], // Show error message on the confirm password field
});

export type RegisterFormData = z.infer<typeof registerSchema>;


export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Zod schema with password confirmation validation
export const resetPasswordSchema = z.object({
    password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], // Apply error to confirmPassword field
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Schema for validation
export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
