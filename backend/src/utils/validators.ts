import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number').max(15).optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Please enter your password'),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().max(15).optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pinCode: z.string().optional(),
    })
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'New passwords do not match',
  path: ['confirmPassword'],
});

export const deviceSubmissionSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  purchaseYear: z.union([z.number(), z.string()]).optional(),
  condition: z.enum(['Like new', 'Good', 'Fair', 'Damaged', 'Not working', 'Unknown']),
  powersOn: z.boolean().default(true),
  storageType: z.string().optional().default('Unknown'),
  storageCapacity: z.string().optional().default('Unknown'),
  description: z.string().optional().default(''),
  images: z.array(z.string()).optional().default([]),
  pickup: z.object({
    pickupAddress: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pinCode: z.string().min(4, 'PIN code is required'),
    contactNumber: z.string().min(10, 'Contact number is required'),
    preferredDate: z.string().min(1, 'Preferred date is required'),
    preferredTimeSlot: z.string().min(1, 'Preferred time slot is required'),
    instructions: z.string().optional().default(''),
  }),
});

export const inspectionSchema = z.object({
  physicalCondition: z.string().optional(),
  powersOn: z.boolean().optional(),
  storageType: z.string().optional(),
  storageCapacity: z.string().optional(),
  inspectionNotes: z.string().optional(),
  reusePotential: z.string().optional(),
  classification: z.enum(['A', 'B', 'C', 'D']),
  status: z.enum([
    'INSPECTED',
    'SANITIZATION_PENDING',
    'SANITIZED',
    'READY_FOR_RESALE',
    'RECYCLED',
  ]).optional(),
});

export const pickupStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'APPROVED',
    'REJECTED',
    'SCHEDULED',
    'COLLECTION_CONFIRMED',
    'RECEIVED',
    'CANCELLED',
  ]),
  adminRemarks: z.string().optional().default(''),
  scheduledDate: z.string().optional(),
});

export const formatZodError = (error: any): string => {
  if (error && Array.isArray(error.issues)) {
    return error.issues.map((i: any) => i.message).join(', ');
  }
  if (error && Array.isArray(error.errors)) {
    return error.errors.map((i: any) => i.message).join(', ');
  }
  return error?.message || 'Validation error';
};
