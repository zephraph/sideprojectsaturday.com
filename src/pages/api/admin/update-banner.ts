import type { APIRoute } from "astro";
import { db } from "@/lib/auth";

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		const { content, enabled } = (await request.json()) as {
			content: string;
			enabled: boolean | string;
		};

		// Convert string "true"/"false" to boolean if needed
		const enabledBool =
			typeof enabled === "string" ? enabled === "true" : enabled;

		if (typeof content !== "string" || typeof enabledBool !== "boolean") {
			return new Response(JSON.stringify({ error: "Invalid request data" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Initialize db with runtime env
		db(locals.runtime.env);

		// Check if banner config exists
		const existingConfig = await db.bannerConfig.findFirst({
			orderBy: {
				updatedAt: "desc",
			},
		});

		if (existingConfig) {
			// Update existing config
			await db.bannerConfig.update({
				where: { id: existingConfig.id },
				data: {
					content,
					enabled: enabledBool,
					updatedAt: new Date(),
				},
			});
		} else {
			// Create new config
			await db.bannerConfig.create({
				data: {
					content,
					enabled: enabledBool,
				},
			});
		}

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Failed to update banner:", error);
		return new Response(JSON.stringify({ error: "Failed to update banner" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
