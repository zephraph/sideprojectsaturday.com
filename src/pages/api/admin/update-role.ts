import type { APIRoute } from "astro";
import { db } from "@/lib/auth";
import { z } from "zod";

const UpdateRoleSchema = z.object({
	userId: z.string(),
	role: z.enum(["user", "admin"]),
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
		const parseResult = UpdateRoleSchema.safeParse(body);

		if (!parseResult.success) {
			return new Response(
				JSON.stringify({ error: "Invalid request", details: parseResult.error.flatten() }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const { userId, role } = parseResult.data;

		// Prevent admin from removing their own admin role
		if (userId === locals.user.id && role !== "admin") {
			return new Response(
				JSON.stringify({ error: "Cannot remove your own admin role" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Update user role
		db(locals.runtime.env);
		await db.user.update({
			where: { id: userId },
			data: { role },
		});

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error updating role:", error);
		return new Response(JSON.stringify({ error: "Failed to update role" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};