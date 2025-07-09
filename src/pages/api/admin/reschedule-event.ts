import type { APIRoute } from "astro";
import { db } from "@/lib/auth";
import { z } from "zod";

const RescheduleEventSchema = z.object({
	eventId: z.string(),
});

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		const body = await request.json();
		const parseResult = RescheduleEventSchema.safeParse(body);

		if (!parseResult.success) {
			return new Response(
				JSON.stringify({ error: "Invalid request", details: parseResult.error.flatten() }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const { eventId } = parseResult.data;

		db(locals.runtime.env);

		// Get the event to check it exists and is canceled
		const event = await db.event.findUnique({
			where: { id: eventId },
		});

		if (!event) {
			return new Response(
				JSON.stringify({ error: "Event not found" }),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		if (event.status !== "canceled") {
			return new Response(
				JSON.stringify({ error: "Event is not canceled" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Check if date falls within a break period
		const breaks = await db.break.findMany({
			where: {
				startDate: { lte: event.eventDate },
				endDate: { gte: event.eventDate },
			},
		});

		if (breaks.length > 0) {
			return new Response(
				JSON.stringify({ error: "Cannot reschedule event during a break period" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Update event status back to scheduled
		const updatedEvent = await db.event.update({
			where: { id: eventId },
			data: { status: "scheduled" },
		});

		return new Response(JSON.stringify({ success: true, event: updatedEvent }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error rescheduling event:", error);
		return new Response(JSON.stringify({ error: "Failed to reschedule event" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};