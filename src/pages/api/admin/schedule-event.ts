import type { APIRoute } from "astro";
import { db } from "@/lib/auth";
import { z } from "zod";

const ScheduleEventSchema = z.object({
	eventDate: z.string().transform((str) => new Date(str)),
});

export const POST: APIRoute = async ({ request, locals }) => {
	// Check if user is admin
	if (!locals.user || locals.user.role !== "admin") {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const body = await request.json();
		const parseResult = ScheduleEventSchema.safeParse(body);

		if (!parseResult.success) {
			return new Response(
				JSON.stringify({ error: "Invalid request", details: parseResult.error.flatten() }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const { eventDate } = parseResult.data;

		db(locals.runtime.env);

		// Check if event already exists for this date
		const existingEvent = await db.event.findFirst({
			where: { eventDate },
		});

		if (existingEvent) {
			return new Response(
				JSON.stringify({ error: "Event already scheduled for this date" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Check if date falls within a break period
		const breaks = await db.break.findMany({
			where: {
				startDate: { lte: eventDate },
				endDate: { gte: eventDate },
			},
		});

		if (breaks.length > 0) {
			return new Response(
				JSON.stringify({ error: "Cannot schedule event during a break period" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Create the event
		const event = await db.event.create({
			data: {
				eventDate,
				status: "scheduled",
			},
		});

		return new Response(JSON.stringify({ success: true, event }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error scheduling event:", error);
		return new Response(JSON.stringify({ error: "Failed to schedule event" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};