import { createHmac } from "node:crypto";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { createAuth, db } from "../lib/auth";
import { isWithinEventHours } from "../lib/date-utils";

export const server = {
	sendMagicLink: defineAction({
		accept: "form",
		input: z.object({
			email: z.string().email("Please enter a valid email address"),
		}),
		handler: async (input, context) => {
			try {
				const auth = createAuth(context.locals.runtime.env);
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
				const auth = createAuth(context.locals.runtime.env);
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
				const auth = createAuth(context.locals.runtime.env);
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
				const auth = createAuth(context.locals.runtime.env);
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

	openDoor: defineAction({
		accept: "form",
		input: z.object({}),
		handler: async (_input, context) => {
			try {
				const runtime = context.locals.runtime;
				if (!runtime?.env) {
					throw new Error("Runtime environment not available.");
				}

				// Initialize database
				db(runtime.env);

				// Check if it's within event hours
				if (!isWithinEventHours()) {
					throw new Error(
						"The door can only be opened on Saturdays from 9 AM to 12 PM EST.",
					);
				}

				// Check if there's an active event
				const activeEvent = await db.event.findFirst({
					where: {
						status: "inprogress",
					},
				});

				if (!activeEvent) {
					throw new Error(
						"The door can only be opened during an active event.",
					);
				}

				// Get SwitchBot credentials from environment
				const token = runtime.env.SWITCHBOT_TOKEN;
				const secret = runtime.env.SWITCHBOT_KEY;
				const deviceId = runtime.env.SWITCHBOT_DEVICE_ID;

				if (!token || !secret || !deviceId) {
					console.error("SwitchBot credentials not configured");
					throw new Error("Door control is not properly configured.");
				}

				// Prepare SwitchBot API request
				const t = Date.now();
				const nonce = Math.floor(Math.random() * 1000000);
				const sign = createHmac("sha256", secret)
					.update(Buffer.from(token + t + nonce, "utf-8"))
					.digest()
					.toString("base64");

				// Make request to SwitchBot API
				const response = await fetch(
					`https://api.switch-bot.com/v1.1/devices/${deviceId}/commands`,
					{
						method: "POST",
						headers: {
							Authorization: token,
							t: t.toString(),
							nonce: nonce.toString(),
							sign: sign,
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							command: "press",
							parameter: "default",
							commandType: "command",
						}),
					},
				);

				const result = await response.json() as { statusCode: number };

				if (result.statusCode === 100) {
					return {
						success: true,
						message: "Door opened successfully! Come on up to the 5th floor.",
					};
				} else {
					console.error("SwitchBot API error:", result);
					throw new Error(
						"Failed to open door. Please try again or contact support.",
					);
				}
			} catch (error) {
				console.error("Open door error:", error);
				// Re-throw specific error messages
				if (error instanceof Error) {
					throw error;
				}
				throw new Error("An error occurred while trying to open the door.");
			}
		},
	}),
};
