import { z } from 'zod';

// UK mobile: 07XXX XXXXXX or +447XXX XXXXXX
const ukPhoneRegex = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/;

export const signupSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().regex(ukPhoneRegex, 'Please enter a valid UK mobile number (e.g. 07700 900000)'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
    agreeToTerms: z.boolean().refine((v) => v === true, 'You must agree to the Terms & Conditions'),
    newsletterOptIn: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

export const contactSchema = z.object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    subject: z.string().min(2, 'Subject is required'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const checkoutSchema = z.object({
    name: z.string().min(2, 'Full name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().regex(ukPhoneRegex, 'Please enter a valid UK mobile number'),
    deliveryType: z.enum(['delivery', 'collection']),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    postcode: z.string().optional(),
    specialInstructions: z.string().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
