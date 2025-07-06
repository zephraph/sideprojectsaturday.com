import resend from "@/lib/resend";
import RsvpConfirmationEmail from "@/emails/RsvpConfirmationEmail";
import { generateCalendarEvent } from "@/lib/calendar";
import { createHash } from "node:crypto";

interface SendRsvpConfirmationParams {
  userEmail: string;
  userName?: string;
  userId: string;
  eventDate: Date;
  baseUrl: string;
}

export async function sendRsvpConfirmation({
  userEmail,
  userName,
  userId,
  eventDate,
  baseUrl,
}: SendRsvpConfirmationParams) {
  const calendar = generateCalendarEvent(eventDate);

  // Create idempotency key based on user, event date, and action
  const idempotencyKey = createHash("sha256")
    .update(
      `rsvp-confirmation-${userId}-${eventDate.toISOString().split("T")[0]}`,
    )
    .digest("hex")
    .substring(0, 32);

  const eventDateStr = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  try {
    const result = await resend.emails.send({
      from: "Side Project Saturday <events@sideprojectsaturday.com>",
      to: userEmail,
      subject: `✅ You're confirmed for Side Project Saturday - ${eventDateStr}`,
      react: RsvpConfirmationEmail({
        recipientName: userName,
        eventDate: eventDateStr,
        eventTime: "9:00 AM - 12:00 PM",
        cancelLink: `${baseUrl}/cancel-rsvp`,
        calendarLink: calendar.googleCalendarUrl,
        userId: userId,
      }),
      attachments: [
        {
          filename: "side-project-saturday.ics",
          content: Buffer.from(calendar.icsContent).toString("base64"),
          contentType: "text/calendar",
        },
      ],
      headers: {
        "X-Idempotency-Key": idempotencyKey,
      },
    });

    return { success: true, emailId: result.data?.id };
  } catch (error) {
    console.error("Failed to send RSVP confirmation:", error);
    return { success: false, error };
  }
}
