import type { APIRoute } from "astro";
import { z } from "zod";
import { db } from "@/lib/auth";

const ScheduleBreakSchema = z.object({
	startDate: z.string().transform((str) => new Date(str)),
	endDate: z.string().transform((str) => new Date(str)),
	reason: z.string().optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		const body = await request.json();
		const parseResult = ScheduleBreakSchema.safeParse(body);

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

		const { startDate, endDate, reason } = parseResult.data;

		// Validate date range
		if (startDate >= endDate) {
			return new Response(
				JSON.stringify({ error: "Start date must be before end date" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		db(locals.runtime.env);

		// Check for overlapping breaks
		const overlappingBreaks = await db.break.findMany({
			where: {
				OR: [
					{
						startDate: { lte: endDate },
						endDate: { gte: startDate },
					},
				],
			},
		});

		if (overlappingBreaks.length > 0) {
			return new Response(
				JSON.stringify({ error: "Break period overlaps with existing break" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Cancel any events within the break period
		await db.event.updateMany({
			where: {
				eventDate: {
					gte: startDate,
					lte: endDate,
				},
				status: "scheduled",
			},
			data: {
				status: "canceled",
			},
		});

		// Create the break
		const breakPeriod = await db.break.create({
			data: {
				startDate,
				endDate,
				reason,
			},
		});

		return new Response(JSON.stringify({ success: true, break: breakPeriod }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error scheduling break:", error);
		return new Response(JSON.stringify({ error: "Failed to schedule break" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
