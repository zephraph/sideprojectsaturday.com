import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		const body = await request.json();
		const { action } = body;

		if (!action || (action !== "unlock" && action !== "lock")) {
			return new Response(
				JSON.stringify({ error: "Invalid action. Must be 'unlock' or 'lock'" }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		// Update KV with door status
		const doorStatus = action === "unlock" ? "unlocked" : "locked";
		await locals.runtime.env.KV.put("sps:door", doorStatus);

		return new Response(
			JSON.stringify({ 
				success: true, 
				action: action,
				doorStatus: doorStatus 
			}),
			{ status: 200, headers: { "Content-Type": "application/json" } }
		);
	} catch (error) {
		console.error("Door control error:", error);
		return new Response(
			JSON.stringify({ error: "Failed to control door" }),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
};