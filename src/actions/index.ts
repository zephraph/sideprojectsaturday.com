import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { auth, db } from "../lib/auth";

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

	toggleFutureEventInterest: defineAction({
		accept: "form",
		input: z.object({
			subscribed: z.boolean(),
		}),
		handler: async (input, context) => {
			try {
				// Get current user session
				const session = await auth.api.getSession({
					headers: context.request.headers,
				});

				if (!session?.user?.id) {
					throw new Error("You must be logged in to update preferences.");
				}

				// Get the database instance with proper env
				const runtime = context.locals.runtime;

				// Initialize the database with runtime env
				db(runtime.env);

				// Update user preference in database
				await db.user.update({
					where: { id: session.user.id },
					data: { subscribed: input.subscribed },
				});

				return {
					success: true,
					message: input.subscribed
						? "You'll receive future event invites!"
						: "You've unsubscribed from future event invites.",
				};
			} catch (error) {
				console.error("Toggle subscription error:", error);
				throw new Error("Failed to update preference. Please try again.");
			}
		},
	}),

	toggleNextEventRsvp: defineAction({
		accept: "form",
		input: z.object({
			rsvped: z.boolean(),
		}),
		handler: async (input, context) => {
			try {
				// Get current user session
				const session = await auth.api.getSession({
					headers: context.request.headers,
				});

				if (!session?.user?.id) {
					throw new Error("You must be logged in to update RSVP status.");
				}

				// Get the database instance with proper env
				const runtime = context.locals.runtime;
				if (!runtime?.env) {
					throw new Error("Database environment not available.");
				}

				// Initialize the database with runtime env
				db(runtime.env);

				// Update user RSVP status in database
				await db.user.update({
					where: { id: session.user.id },
					data: { rsvped: input.rsvped },
				});

				return {
					success: true,
					message: input.rsvped
						? "You're RSVP'd for the next event!"
						: "You've cancelled your RSVP for the next event.",
				};
			} catch (error) {
				console.error("Toggle RSVP error:", error);
				throw new Error("Failed to update RSVP status. Please try again.");
			}
		},
	}),
};
