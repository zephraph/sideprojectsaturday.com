import { PrismaClient } from "@generated/prisma/client";
import { schedules } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";
import EventInviteEmail from "@/emails/EventInviteEmail";
import EventTodayEmail from "@/emails/EventTodayEmail";
import {
	formatEventDate,
	getEventEndTime,
	getEventStartTime,
	getNextSaturdayAtNYCTime,
	getSaturdayMorning,
	getWednesdayBeforeEvent,
} from "@/lib/date-utils";

interface EventManagementPayload {
	eventDate: string;
}

// Function to create Prisma client for Trigger.dev context
function createPrismaClient() {
	return new PrismaClient({
		datasources: {
			db: {
				url: process.env.DATABASE_URL,
			},
		},
	});
}

// Main scheduled job that runs every Monday to create events and schedule tasks
export const eventManagementJob = schedules.task({
	id: "event-management",
	// Run every Monday at 2 PM UTC (9 AM EST / 10 AM EDT)
	cron: "0 14 * * 1",
	run: async (_payload, { ctx }) => {
		const nextSaturday = getNextSaturdayAtNYCTime(9, 0);
		const eventDate = nextSaturday.toISOString();

		// Get environment variables
		const RESEND_API_KEY = process.env.RESEND_API_KEY;
		const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;
		const BETTER_AUTH_BASE_URL = process.env.BETTER_AUTH_BASE_URL;

		if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID || !BETTER_AUTH_BASE_URL) {
			throw new Error("Missing required environment variables");
		}

		const prisma = createPrismaClient();

		try {
			// Create event in database
			await createEvent(prisma, eventDate);
			console.log("Event created for:", eventDate);

			// Schedule invitation broadcast for Wednesday
			const wednesdayDelay = getWednesdayBeforeEvent(nextSaturday);
			const wednesdayDelayMs = wednesdayDelay.getTime() - Date.now();
			if (wednesdayDelayMs > 0) {
				await eventInviteJob.trigger(
					{ eventDate },
					{ delay: wednesdayDelayMs },
				);
			}

			// Schedule event today emails for Saturday morning
			const saturdayMorning = getSaturdayMorning(nextSaturday);
			const saturdayMorningDelayMs = saturdayMorning.getTime() - Date.now();
			if (saturdayMorningDelayMs > 0) {
				await eventTodayJob.trigger(
					{ eventDate },
					{ delay: saturdayMorningDelayMs },
				);
			}

			// Schedule event start for 9 AM Saturday
			const eventStart = getEventStartTime(nextSaturday);
			const eventStartDelayMs = eventStart.getTime() - Date.now();
			if (eventStartDelayMs > 0) {
				await eventStartJob.trigger(
					{ eventDate },
					{ delay: eventStartDelayMs },
				);
			}

			// Schedule event end for 12 PM Saturday
			const eventEnd = getEventEndTime(nextSaturday);
			const eventEndDelayMs = eventEnd.getTime() - Date.now();
			if (eventEndDelayMs > 0) {
				await eventEndJob.trigger({ eventDate }, { delay: eventEndDelayMs });
			}

			return { success: true, eventDate };
		} finally {
			await prisma.$disconnect();
		}
	},
});

// Job to send event invitation broadcast
export const eventInviteJob = schedules.task({
	id: "event-invite",
	run: async (payload: EventManagementPayload, { ctx }) => {
		const { eventDate } = payload;
		const resend = new Resend(process.env.RESEND_API_KEY);
		const prisma = createPrismaClient();

		try {
			const event = await prisma.event.findFirst({
				where: {
					eventDate: new Date(eventDate),
					status: "scheduled",
				},
			});

			if (!event) {
				console.log("Event not found or not scheduled:", eventDate);
				return { success: false, reason: "Event not found or not scheduled" };
			}

			// Send invitation broadcast
			const eventDateStr = formatEventDate(new Date(eventDate));
			await resend.broadcasts.create({
				audienceId: process.env.RESEND_AUDIENCE_ID!,
				from: "Side Project Saturday <events@sideprojectsaturday.com>",
				subject: `🎉 Side Project Saturday - ${eventDateStr}`,
				react: EventInviteEmail({
					eventDate: eventDateStr,
					eventTime: "9:00 AM - 12:00 PM",
					rsvpLink: `${process.env.BETTER_AUTH_BASE_URL}/rsvp`,
				}),
			});

			console.log("Event invitation sent for:", eventDate);
			return { success: true, eventDate };
		} finally {
			await prisma.$disconnect();
		}
	},
});

// Job to send event today emails
export const eventTodayJob = schedules.task({
	id: "event-today",
	run: async (payload: EventManagementPayload, { ctx }) => {
		const { eventDate } = payload;
		const resend = new Resend(process.env.RESEND_API_KEY);
		const prisma = createPrismaClient();

		try {
			const event = await prisma.event.findFirst({
				where: {
					eventDate: new Date(eventDate),
					status: "scheduled",
				},
			});

			if (!event) {
				console.log("Event not found or not scheduled:", eventDate);
				return { success: false, reason: "Event not found or not scheduled" };
			}

			// Get all RSVPd users
			const rsvpdUsers = await prisma.user.findMany({
				where: { rsvped: true },
				select: { email: true, name: true, id: true },
			});

			// Send batch emails
			const emails = rsvpdUsers.map((user) => ({
				to: user.email,
				from: "Side Project Saturday <events@sideprojectsaturday.com>",
				subject: "🚀 Side Project Saturday is TODAY!",
				react: EventTodayEmail({
					recipientName: user.name || user.email,
					eventTime: "9:00 AM - 12:00 PM",
					eventLocation: "325 Gold Street, Brooklyn, NY (5th Floor)",
					buzzInLink: `${process.env.BETTER_AUTH_BASE_URL}/buzz`,
					cancelLink: `${process.env.BETTER_AUTH_BASE_URL}/rsvp/cancel`,
					userId: user.id,
				}),
			}));

			if (emails.length > 0) {
				await resend.batch.send(emails);
				console.log(`Event today emails sent to ${emails.length} users`);
			}

			return { success: true, eventDate, emailsSent: emails.length };
		} finally {
			await prisma.$disconnect();
		}
	},
});

// Job to start event (mark as in progress and unlock door)
export const eventStartJob = schedules.task({
	id: "event-start",
	run: async (payload: EventManagementPayload, { ctx }) => {
		const { eventDate } = payload;
		const prisma = createPrismaClient();

		try {
			const event = await prisma.event.findFirst({
				where: {
					eventDate: new Date(eventDate),
					status: "scheduled",
				},
			});

			if (!event) {
				console.log("Event not found or not scheduled:", eventDate);
				return { success: false, reason: "Event not found or not scheduled" };
			}

			// Update event status to in progress
			await prisma.event.update({
				where: { id: event.id },
				data: { status: "inprogress" },
			});

			// Call door control API to unlock
			await fetch(`${process.env.BETTER_AUTH_BASE_URL}/api/door-control`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "unlock" }),
			});

			console.log("Event started and door unlocked:", eventDate);
			return { success: true, eventDate };
		} finally {
			await prisma.$disconnect();
		}
	},
});

// Job to end event (mark as completed, lock door, reset RSVPs)
export const eventEndJob = schedules.task({
	id: "event-end",
	run: async (payload: EventManagementPayload, { ctx }) => {
		const { eventDate } = payload;
		const prisma = createPrismaClient();

		try {
			const event = await prisma.event.findFirst({
				where: {
					eventDate: new Date(eventDate),
					status: "inprogress",
				},
			});

			if (!event) {
				console.log("Event not found or not in progress:", eventDate);
				return { success: false, reason: "Event not found or not in progress" };
			}

			// Call door control API to lock
			await fetch(`${process.env.BETTER_AUTH_BASE_URL}/api/door-control`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "lock" }),
			});

			// Mark event as completed
			await prisma.event.update({
				where: { id: event.id },
				data: { status: "completed" },
			});

			// Reset all users' RSVP status
			await prisma.user.updateMany({
				data: { rsvped: false },
			});

			console.log("Event completed, door locked, RSVPs reset:", eventDate);
			return { success: true, eventDate };
		} finally {
			await prisma.$disconnect();
		}
	},
});

async function createEvent(prisma: PrismaClient, eventDate: string) {
	const eventExists = await prisma.event.findFirst({
		where: {
			eventDate: new Date(eventDate),
			status: { in: ["scheduled", "inprogress"] },
		},
	});

	if (!eventExists) {
		await prisma.event.create({
			data: {
				id: crypto.randomUUID(),
				eventDate: new Date(eventDate),
				status: "scheduled",
			},
		});
	}
}
