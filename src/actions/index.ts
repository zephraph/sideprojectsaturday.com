import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { auth } from "../lib/auth";

export const server = {
	sendMagicLink: defineAction({
		accept: "form",
		input: z.object({
			email: z.string().email("Please enter a valid email address"),
		}),
		handler: async (input, context) => {
			try {
				// Use Better Auth to send magic link
				await auth.api.signInMagicLink({
					body: {
						email: input.email,
						callbackURL: "/", // Redirect to home page after successful auth
					},
					headers: context.request.headers,
				});

				return {
					success: true,
					message:
						"Magic link sent! Check your email to complete registration.",
				};
			} catch (error) {
				console.error("Magic link error:", error);
				throw new Error("Failed to send magic link. Please try again.");
			}
		},
	}),

	signOut: defineAction({
		accept: "form",
		input: z.object({}),
		handler: async (_input, context) => {
			try {
				await auth.api.signOut({
					headers: context.request.headers,
				});

				return {
					success: true,
					message: "Successfully signed out.",
				};
			} catch (error) {
				console.error("Sign out error:", error);
				throw new Error("Failed to sign out. Please try again.");
			}
		},
	}),
};
