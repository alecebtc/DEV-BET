import { z } from "zod";

export const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  phone: z
    .string()
    .trim()
    .min(6, "Phone is too short")
    .max(20)
    .regex(/^[+0-9 ()-]+$/, "Invalid phone number"),
  email: z.string().trim().email("Invalid email").max(255),
  username: z
    .string()
    .trim()
    .regex(usernameRegex, "3–20 chars: letters, numbers, underscore"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .max(72, "Too long"),
});

export type RegisterValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export type LoginValues = z.infer<typeof loginSchema>;
