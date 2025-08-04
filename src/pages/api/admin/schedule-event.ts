import type { APIRoute } from "astro";
import { z } from "zod";
import { db } from "@/lib/auth";

const ScheduleEventSchema = z.object({
	eventDate: z.string().transform((str) => new Date(str)),
});

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		const contentType = request.headers.get("content-type");
		let body: unknown;

		if (contentType?.includes("application/json")) {
			body = await request.json();
		} else {
			const formData = await request.formData();
			body = Object.fromEntries(formData);
		}

		const parseResult = ScheduleEventSchema.safeParse(body);

		if (!parseResult.success) {
			return new Response(
				JSON.stringify({
					error: "Invalid request",
					details: parseResult.error.flatten(),
				}),
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
				JSON.stringify({
					error: "Cannot schedule event during a break period",
				}),
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
