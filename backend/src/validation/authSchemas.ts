import { z } from "zod";

const passwordSchema = z.string()
    .min(12, 'Min 12 characters')
    .regex(/[A-Z]/, 'Must have uppercase')
    .regex(/[a-z]/, 'Must have lowercase')
    .regex(/[0-9]/, 'Must have number')
    .regex(/[^A-Za-z0-9]/, 'Must have special char');

export const signupSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: passwordSchema,
        phone: z.string()
            .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number')
            .optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(1),
    }),
});

export const googleLoginSchema = z.object({
    body: z.object({
        idToken: z.string().min(1, "Google idToken is required"),
    }),
});

export const refreshSchema = z.object({
    cookies: z.object({
        refreshToken: z.string().min(1, 'Refresh token is required'),
    }),
});

export const updatePasswordSchema = z.object({
    body: z.object({
        passwordCurrent: z.string().min(1),
        newPassword: passwordSchema,
    }),
});
