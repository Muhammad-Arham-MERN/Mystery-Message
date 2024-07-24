import { z } from "zod";

export const usernameValdiation = z
    .string()
    .min(2, "Must be atleast 2 characters")
    .max(20, "Must be atmost 20 characters")
    .regex(/^[a-zA-Z0-9]+$/, "The special characters and spaces make us sad")

export const signUpSchema = z.object({
    username : usernameValdiation,
    email: z
    .string()
    .email({message: "invalid Email Address"})
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  "Invalid email address")
    ,

    password: z
        .string()
        .min(6, {message:"Password must be atleast 6 characters"}),
})