import { PrismaClient } from "@generated/prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, magicLink } from "better-auth/plugins";
import MagicLinkEmail from "@/emails/MagicLinkEmail";
import VerificationEmail from "@/emails/VerificationEmail";
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
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    disableSignUp: true,
  },
  plugins: [
    admin(),
    magicLink({
      async sendMagicLink({ email, url }) {
        await resend.emails.send({
          from: "hello@sideprojectsaturday.com",
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
        from: "hello@sideprojectsaturday.com",
        to: user.email,
        subject: "Verify your email address",
        react: VerificationEmail({ verificationUrl: url, username: user.name }),
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 5, // 5 hours
  },
});
