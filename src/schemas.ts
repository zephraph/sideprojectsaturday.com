import { z } from "zod";

export const zCheckEmail = z.object({
	email: z.string().trim().email("Please enter a valid email address"),
});

export const zSignup = z.object({
	name: z.string().trim().min(1, "Name is required"),
	email: z.string().trim().email("Invalid email address"),
});
