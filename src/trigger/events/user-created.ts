import { task } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";
import WelcomeEmail from "@/emails/WelcomeEmail";

interface UserCreatedPayload {
	email: string;
	name?: string;
	sendWelcomeEmail?: boolean;
}

export const userCreatedJob = task({
	id: "user-created",
	run: async (payload: UserCreatedPayload, { ctx }) => {
		const { email, name, sendWelcomeEmail } = payload;

		// Get environment variables
		const RESEND_API_KEY = process.env.RESEND_API_KEY;
		const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

		if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) {
			throw new Error("Missing required environment variables for Resend");
		}

		const resend = new Resend(RESEND_API_KEY);

		try {
			// Add user to Resend audience
			await resend.contacts.create({
				email,
				audienceId: RESEND_AUDIENCE_ID,
				unsubscribed: false,
			});

			console.log(`User ${email} added to Resend audience`);

			// Send welcome email if requested
			if (sendWelcomeEmail) {
				await resend.emails.send({
					from: "noreply@sideprojectsaturday.com",
					to: email,
					subject: "Welcome to Side Project Saturday!",
					react: WelcomeEmail({
						username: name || email,
						userId: "", // We don't have userId for user_create events
					}),
				});

				console.log(`Welcome email sent to ${email}`);
			}

			return {
				success: true,
				email,
				addedToAudience: true,
				welcomeEmailSent: sendWelcomeEmail || false,
			};
		} catch (error) {
			console.error("Failed to process user creation:", error);
			throw error;
		}
	},
});
