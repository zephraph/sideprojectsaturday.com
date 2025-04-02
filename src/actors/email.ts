import { actor, UserError } from "actor-core";
import { Resend } from "resend";
import { z } from "zod";

const zEmailAddress = z.string().email();
type EmailAddress = z.infer<typeof zEmailAddress>;

const zEmailEntry =
  z.object({
    id: z.string().uuid(),
    address: zEmailAddress,
    verified: z.boolean(),
    createdAt: z.date(),
    unsubscribed: z.boolean(),
  });

type EmailEntry = z.infer<typeof zEmailEntry>;

export const emailActor = actor({
  createVars(c, ctx) {
    const { env } = ctx as { env: Env };
    return {
      resend: new Resend(env.RESEND_API_KEY),
    };
  },
  createState() {
    return {
      emails: [] as EmailEntry[],
      emailIndex: {} as Record<string, number>,
    };
  },
  actions: {
    isVerified(c, emailAddress: EmailAddress) {
      zEmailAddress.parse(emailAddress);
      const { emails, emailIndex } = c.state;
      const email = emails[emailIndex[emailAddress]];
      return email?.verified ?? false;
    },
    verify(c, emailId: string) {
      const { emails, emailIndex } = c.state;
      const email = emails[emailIndex[emailId]];
      if (!email) {
        throw new UserError("Email not found");
      }

      email.verified = true;
    },
    unsubscribe(c, emailId: string) {
      const { emails, emailIndex } = c.state;
      const email = emails[emailIndex[emailId]];
      if (!email) {
        throw new UserError("Email not found");
      }
      email.unsubscribed = true;
    },
    async sendVerificationEmail(c, emailAddress: EmailAddress) {
      zEmailAddress.parse(emailAddress);
      const { emails, emailIndex } = c.state;

      const email = emails[emailIndex[emailAddress]];

      if (!email) {
        const id = crypto.randomUUID();
        const idx = emails.push({
          id,
          address: emailAddress,
          verified: false,
          createdAt: new Date(),
          unsubscribed: false,
        });
        emailIndex[id] = idx;
        emailIndex[emailAddress] = idx;
      }

      if (email.verified) {
        return;
      }

      const { resend } = c.vars;

      const response = await resend.emails.send({
        from: "noreply@sideprojectsaturday.com",
        to: emailAddress,
        subject: "Verify your email",
        text: "Verify your email",
      });

      if (response.error) {
        throw new Error(response.error.message);
      }
    },
    async sendEmail(c, emailAddress: EmailAddress, subject: string, text: string) {
      zEmailAddress.parse(emailAddress);
      const { emails, emailIndex } = c.state;

      const email = emails[emailIndex[emailAddress]];

      if (email.unsubscribed) {
        throw new UserError("You're unsubscribed from our email list");
      }

      const { resend } = c.vars;

      const response = await resend.emails.send({
        from: "info@sideprojectsaturday.com",
        to: emailAddress,
        subject: subject,
        text: text,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }
    },
  },
});
