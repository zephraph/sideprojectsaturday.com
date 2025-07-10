import type { APIRoute } from "astro";
import { z } from "zod";
import { db } from "@/lib/auth";

const UpdateUserFieldSchema = z.object({
	userId: z.string(),
	field: z.enum(["rsvped", "subscribed"]),
	value: z.boolean(),
});

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		const body = await request.json();
		const parseResult = UpdateUserFieldSchema.safeParse(body);

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

		const { userId, field, value } = parseResult.data;

		// Update user field
		db(locals.runtime.env);
		await db.user.update({
			where: { id: userId },
			data: { [field]: value },
		});

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error updating user field:", error);
		return new Response(
			JSON.stringify({ error: "Failed to update user field" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
};
