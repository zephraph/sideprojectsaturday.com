import { task } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";

interface UserUpdatedPayload {
	email: string;
	name?: string;
	newEmail?: string;
	subscribed?: boolean;
}

export const userUpdatedJob = task({
	id: "user-updated",
	run: async (payload: UserUpdatedPayload, { ctx }) => {
		const { email, newEmail, subscribed } = payload;
		
		// Get environment variables
		const RESEND_API_KEY = process.env.RESEND_API_KEY;
		const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

		if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) {
			throw new Error("Missing required environment variables for Resend");
		}

		const resend = new Resend(RESEND_API_KEY);

		try {
			if (newEmail) {
				// Email is changing - fetch existing contact, create new one, delete old one
				try {
					// Fetch existing contact details
					const existingContact = await resend.contacts.get({
						email,
						audienceId: RESEND_AUDIENCE_ID,
					});

					// Create new contact with merged details
					await resend.contacts.create({
						email: newEmail,
						audienceId: RESEND_AUDIENCE_ID,
						unsubscribed: subscribed !== undefined ? !subscribed : existingContact.unsubscribed,
					});

					// Delete old contact
					await resend.contacts.remove({
						email,
						audienceId: RESEND_AUDIENCE_ID,
					});

					console.log(`Successfully updated contact from ${email} to ${newEmail}`);
					return { 
						success: true, 
						oldEmail: email, 
						newEmail,
						action: "email_changed" 
					};
				} catch (error) {
					console.error(`Failed to update contact email from ${email} to ${newEmail}:`, error);
					throw error;
				}
			} else if (subscribed !== undefined) {
				// Only update subscription status
				const updateData = {
					email,
					audienceId: RESEND_AUDIENCE_ID,
					unsubscribed: !subscribed,
				};

				await resend.contacts.update(updateData);
				console.log(`Successfully updated subscription status for ${email} to ${subscribed ? "subscribed" : "unsubscribed"}`);
				
				return { 
					success: true, 
					email, 
					subscribed,
					action: "subscription_updated" 
				};
			} else {
				// Nothing to update
				console.log(`No updates needed for contact ${email}`);
				return { 
					success: true, 
					email, 
					action: "no_changes" 
				};
			}
		} catch (error) {
			console.error("Failed to update contact in Resend:", error);
			throw error;
		}
	},
});