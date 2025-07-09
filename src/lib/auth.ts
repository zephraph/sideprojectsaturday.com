import { PrismaClient } from "@generated/prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, magicLink } from "better-auth/plugins";
import MagicLinkEmail from "@/emails/MagicLinkEmail";
import VerificationEmail from "@/emails/VerificationEmail";
import resend from "./resend";
import { lazyInvokable } from "./utils";
import type { UserEventMessage } from "@/services/user-event-consumer";

export const db = lazyInvokable(
  (env: Env) =>
    new PrismaClient({
      // @ts-expect-error - Prisma adapter is added at runtime
      adapter: new PrismaD1(env.DB),
    }),
);

// Helper function to queue user events
export const queueUserEvent = (env: Env, message: UserEventMessage) => {
  return env.USER_EVENT_QUEUE.send(message);
};

// Function to create auth with environment context
export const createAuth = (env?: Env) =>
  betterAuth({
    basePath: "/auth",
    baseURL: process.env.BETTER_AUTH_BASE_URL ?? "http://localhost:4433",
    database: prismaAdapter(db, {
      provider: "sqlite",
    }),
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
      async onEmailVerification(user, request) {
        // Queue the contact creation and welcome email instead of doing it directly
        if (env) {
          try {
            await queueUserEvent(env, {
              type: "user_create",
              email: user.email,
              name: user.name || undefined,
              sendWelcomeEmail: true,
            });
          } catch (error) {
            // Log error but don't fail the verification process
            console.error("Failed to queue user event:", error);
          }
        }
      },
      autoSignInAfterVerification: true,
      expiresIn: 60 * 60 * 5, // 5 hours
    },
  });

// Default auth instance for compatibility
export const auth = createAuth();
