import { PrismaClient } from "@generated/prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, magicLink } from "better-auth/plugins";
import MagicLinkEmail from "@/emails/MagicLinkEmail";
import VerificationEmail from "@/emails/VerificationEmail";
import { userCreatedJob } from "@/trigger/events/user-created";
import { userUpdatedJob } from "@/trigger/events/user-updated";
import resend from "./resend";
import { lazyInvokable } from "./utils";

export const db = lazyInvokable(
	(env: Env) =>
		new PrismaClient({
			// @ts-expect-error - Prisma adapter is added at runtime
			adapter: new PrismaD1(env.DB),
		}),
);

// Helper function to trigger user events
export const triggerUserEvent = async (payload: { type: "user_create" | "user_update"; email: string; name?: string; sendWelcomeEmail?: boolean; newEmail?: string; subscribed?: boolean }) => {
	if (payload.type === "user_create") {
		return await userCreatedJob.trigger({
			email: payload.email,
			name: payload.name,
			sendWelcomeEmail: payload.sendWelcomeEmail,
		});
	} else if (payload.type === "user_update") {
		return await userUpdatedJob.trigger({
			email: payload.email,
			name: payload.name,
			newEmail: payload.newEmail,
			subscribed: payload.subscribed,
		});
	}
};

// KV adapter for better-auth secondary storage
const createKVAdapter = (kv: KVNamespace) => ({
	async get(key: string): Promise<string | null> {
		return await kv.get(key);
	},
	async set(key: string, value: string, ttl?: number): Promise<void> {
		const options = ttl ? { expirationTtl: ttl } : undefined;
		await kv.put(key, value, options);
	},
	async delete(key: string): Promise<void> {
		await kv.delete(key);
	},
});

// Function to create auth with environment context
export const createAuth = (env?: Env) =>
	betterAuth({
		basePath: "/auth",
		baseURL: process.env.BETTER_AUTH_BASE_URL ?? "http://localhost:4433",
		database: prismaAdapter(db, {
			provider: "sqlite",
		}),
		secondaryStorage: env?.KV ? createKVAdapter(env.KV) : undefined,
		plugins: [
			admin(),
			magicLink({
				async sendMagicLink({ email, url }) {
					if (process.env.NODE_ENV === "development") {
						console.log("magic link:", url);
					}
					await resend.emails.send({
						from: "noreply@sideprojectsaturday.com",
						to: email,
						subject: "Sign in to Side Project Saturday",
						react: MagicLinkEmail({ magicLink: url }),
					});
				},
			}),
		],
		emailVerification: {
			async sendVerificationEmail({ user, url }) {
				await resend.emails.send({
					from: "noreply@sideprojectsaturday.com",
					to: user.email,
					subject: "Verify your email address",
					react: VerificationEmail({
						verificationUrl: url,
						username: user.name,
					}),
				});
			},
			sendOnSignUp: true,
			async onEmailVerification(user, _request) {
				// Trigger user creation event instead of using queue
				try {
					await triggerUserEvent({
						type: "user_create",
						email: user.email,
						name: user.name || undefined,
						sendWelcomeEmail: true,
					});
				} catch (error) {
					// Log error but don't fail the verification process
					console.error("Failed to trigger user event:", error);
				}
			},
			autoSignInAfterVerification: true,
			expiresIn: 60 * 60 * 5, // 5 hours
		},
	});

// Default auth instance for compatibility
export const auth = createAuth();
