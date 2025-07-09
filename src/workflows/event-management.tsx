import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from "cloudflare:workers";
import { Resend } from "resend";
import EventInviteEmail from "@/emails/EventInviteEmail";
import EventTodayEmail from "@/emails/EventTodayEmail";

interface EventWorkflowEnv {
  DB: D1Database;
  KV: KVNamespace;
  RESEND_API_KEY: string;
  RESEND_AUDIENCE_ID: string;
  BETTER_AUTH_BASE_URL: string;
}

interface EventWorkflowParams {
  scheduledDate: string; // ISO date string for the event date
}

export class EventManagementWorkflow extends WorkflowEntrypoint<EventWorkflowEnv> {
  async run(
    event: WorkflowEvent<EventWorkflowParams>,
    step: WorkflowStep,
  ): Promise<void> {
    const eventDate = new Date(event.payload.scheduledDate);

    // Monday: Create event in database
    await step.do("create-event", async () => {
      const eventExists = await this.env.DB.prepare(
        "SELECT id FROM event WHERE eventDate = ? AND status IN ('scheduled', 'inprogress')",
      )
        .bind(eventDate.toISOString())
        .first();

      if (!eventExists) {
        await this.env.DB.prepare(
          "INSERT INTO event (id, eventDate, status) VALUES (?, ?, ?)",
        )
          .bind(crypto.randomUUID(), eventDate.toISOString(), "scheduled")
          .run();
      }
    });

    // Wednesday: Send event invite broadcast
    await step.sleep("wait-for-wednesday", this.getWednesdayDelay(eventDate));
    await step.do("send-event-invite", async () => {
      const event = await this.env.DB.prepare(
        "SELECT * FROM event WHERE eventDate = ? AND status = 'scheduled'",
      )
        .bind(eventDate.toISOString())
        .first();

      if (event) {
        await this.sendEventInviteBroadcast(eventDate);
      }
    });

    // Saturday 7AM: Send event today emails to RSVPd users
    await step.sleep(
      "wait-for-saturday-morning",
      this.getSaturdayMorningDelay(eventDate),
    );
    await step.do("send-event-today-emails", async () => {
      const event = await this.env.DB.prepare(
        "SELECT * FROM event WHERE eventDate = ? AND status = 'scheduled'",
      )
        .bind(eventDate.toISOString())
        .first();

      if (event) {
        await this.sendEventTodayEmails();
      }
    });

    // Saturday 9AM: Mark event as in progress and unlock door
    await step.sleep("wait-for-event-start", 2 * 60 * 60 * 1000); // 2 hours
    await step.do("start-event", async () => {
      const event = await this.env.DB.prepare(
        "SELECT * FROM event WHERE eventDate = ? AND status = 'scheduled'",
      )
        .bind(eventDate.toISOString())
        .first();

      if (event) {
        // Update event status to inprogress
        await this.env.DB.prepare(
          "UPDATE event SET status = 'inprogress' WHERE id = ?",
        )
          .bind(event.id)
          .run();

        // Unlock door
        await this.env.KV.put("sps:door", "unlocked");
      }
    });

    // Saturday 12PM: Lock door and mark event as completed
    await step.sleep("wait-for-event-end", 3 * 60 * 60 * 1000); // 3 hours
    await step.do("end-event", async () => {
      const event = await this.env.DB.prepare(
        "SELECT * FROM event WHERE eventDate = ? AND status = 'inprogress'",
      )
        .bind(eventDate.toISOString())
        .first();

      if (event) {
        // Lock door
        await this.env.KV.put("sps:door", "locked");

        // Mark event as completed
        await this.env.DB.prepare(
          "UPDATE event SET status = 'completed' WHERE id = ?",
        )
          .bind(event.id)
          .run();

        // Reset all users' RSVP status
        await this.env.DB.prepare("UPDATE user SET rsvped = false").run();
      }
    });
  }

  private getWednesdayDelay(eventDate: Date): number {
    const now = new Date();
    // Get the Wednesday before the event (3 days before Saturday)
    const wednesday = new Date(eventDate);
    wednesday.setDate(wednesday.getDate() - 3);
    wednesday.setHours(12, 0, 0, 0); // 12 PM Wednesday
    return Math.max(0, wednesday.getTime() - now.getTime());
  }

  private getSaturdayMorningDelay(eventDate: Date): number {
    const now = new Date();
    const saturdayMorning = new Date(eventDate);
    saturdayMorning.setHours(7, 0, 0, 0); // 7 AM Saturday
    return Math.max(0, saturdayMorning.getTime() - now.getTime());
  }

  private async sendEventInviteBroadcast(eventDate: Date): Promise<void> {
    const resend = new Resend(this.env.RESEND_API_KEY);

    const eventDateStr = eventDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    await resend.broadcasts.create({
      audienceId: this.env.RESEND_AUDIENCE_ID,
      from: "Side Project Saturday <events@sideprojectsaturday.com>",
      subject: `🎉 Side Project Saturday - ${eventDateStr}`,
      react: (
        <EventInviteEmail
          eventDate={eventDateStr}
          eventTime="9:00 AM - 12:00 PM"
          rsvpLink={`${this.env.BETTER_AUTH_BASE_URL}/rsvp`}
        />
      ),
    });
  }

  private async sendEventTodayEmails(): Promise<void> {
    const resend = new Resend(this.env.RESEND_API_KEY);

    // Get all RSVPd users
    const rsvpdUsers = await this.env.DB.prepare(
      "SELECT email, name, id FROM user WHERE rsvped = true",
    ).all();

    const emails = rsvpdUsers.results.map((user: any) => ({
      to: user.email,
      from: "Side Project Saturday <events@sideprojectsaturday.com>",
      subject: "🚀 Side Project Saturday is TODAY!",
      react: (
        <EventTodayEmail
          recipientName={user.name}
          eventTime="9:00 AM - 12:00 PM"
          eventLocation="325 Gold Street, Brooklyn, NY (5th Floor)"
          buzzInLink={`${this.env.BETTER_AUTH_BASE_URL}/buzz-in`}
          cancelLink={`${this.env.BETTER_AUTH_BASE_URL}/cancel-rsvp`}
          userId={user.id}
        />
      ),
    }));

    // Send batch emails
    await resend.batch.send(emails);
  }
}

export default {
  scheduled(_: ScheduledController, env: Env, _ctx: ExecutionContext) {
    // Get current UTC time
    const now = new Date();

    // Calculate offset for NYC timezone (this handles DST automatically)
    const nyOffset = new Date()
      .toLocaleString("en-US", {
        timeZone: "America/New_York",
        timeZoneName: "short",
      })
      .includes("EST")
      ? 5
      : 4; // EST is UTC-5, EDT is UTC-4

    // Adjust to NYC time
    const nyTime = new Date(now.getTime() - nyOffset * 60 * 60 * 1000);
    const dayOfWeek = nyTime.getDay();

    // Calculate days until Saturday (if today is Saturday, get next Saturday)
    const daysUntilSaturday = dayOfWeek === 6 ? 7 : 6 - dayOfWeek;

    // Create the event date at 9 AM EST/EDT on Saturday
    const nextSaturday = new Date(now);
    nextSaturday.setUTCDate(now.getUTCDate() + daysUntilSaturday);
    nextSaturday.setUTCHours(9 + nyOffset, 0, 0, 0); // 9 AM NYC = (9 + offset) UTC

    const workflowInstance = env.EVENT_WORKFLOW.create({
      params: {
        scheduledDate: nextSaturday.toISOString(),
      },
    });
    console.log("starting workflow: ", workflowInstance.id);
  },
};
