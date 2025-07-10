import type { APIRoute } from "astro";
import { z } from "zod";
import { db } from "@/lib/auth";

const CancelEventSchema = z.object({
	eventId: z.string(),
});

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		const body = await request.json();
		const parseResult = CancelEventSchema.safeParse(body);

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

		const { eventId } = parseResult.data;

		db(locals.runtime.env);

		// Update event status to canceled
		const event = await db.event.update({
			where: { id: eventId },
			data: { status: "canceled" },
		});

		return new Response(JSON.stringify({ success: true, event }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error canceling event:", error);
		return new Response(JSON.stringify({ error: "Failed to cancel event" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
