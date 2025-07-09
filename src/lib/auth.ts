import { PrismaClient } from "@generated/prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, magicLink } from "better-auth/plugins";
import MagicLinkEmail from "@/emails/MagicLinkEmail";
import VerificationEmail from "@/emails/VerificationEmail";
import WelcomeEmail from "@/emails/WelcomeEmail";
import resend from "./resend";
import { lazyInvokable } from "./utils";

export const db = lazyInvokable(
  (env: Env) =>
    new PrismaClient({
      // @ts-expect-error - Prisma adapter is added at runtime
      adapter: new PrismaD1(env.DB),
    }),
);

export const auth = betterAuth({
  basePath: "/auth",
  baseURL: process.env.BETTER_AUTH_BASE_URL ?? "http://localhost:4433",
  database: prismaAdapter(db, {
    provider: "sqlite",
  }),
  plugins: [
    admin(),
    magicLink({
      async sendMagicLink({ email, url }) {
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
        react: VerificationEmail({ verificationUrl: url, username: user.name }),
      });
    },
    sendOnSignUp: true,
    async onEmailVerification(user, request) {
      try {
        await resend.contacts.create({
          email: user.email,
          audienceId: process.env.RESEND_AUDIENCE_ID!,
          unsubscribed: false,
        });
      } catch (error) {
        // Log error but don't fail the verification process
        // TODO: Hook up to sentry
        console.error("Failed to create contact:", error);
      }
      try {
        await resend.emails.send({
          from: "noreply@sideprojectsaturday.com",
          to: user.email,
          subject: "Welcome to Side Project Saturday!",
          react: WelcomeEmail({
            username: user.name || user.email,
            userId: user.id,
          }),
        });
      } catch (error) {
        // Log error but don't fail the verification process
        // TODO: Hook up to sentry
        console.error("Failed to send welcome email:", error);
      }
    },
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 5, // 5 hours
  },
});
