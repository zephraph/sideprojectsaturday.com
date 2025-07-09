import type { APIRoute } from "astro";
import { db } from "@/lib/auth";
import { createHmac } from "node:crypto";

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		const runtime = locals.runtime;
		if (!runtime?.env) {
			return new Response("Environment not available", { status: 500 });
		}

		// Initialize database
		db(runtime.env);

		// Check if there's an active event
		const today = new Date();
		const todayStr = today.toISOString().split('T')[0];
		
		const activeEvent = await db.event.findFirst({
			where: {
				eventDate: {
					gte: new Date(todayStr),
					lt: new Date(new Date(todayStr).getTime() + 24 * 60 * 60 * 1000),
				},
				status: "inprogress",
			},
		});

		if (!activeEvent) {
			return new Response(
				JSON.stringify({
					success: false,
					message: "No active event found. The door can only be opened during events.",
				}),
				{
					status: 403,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		// Make SwitchBot request to open door
		const result = await switchbotRequest(
			runtime.env,
			`v1.1/devices/${runtime.env.SWITCHBOT_DEVICE_ID}/commands`,
			{
				method: "POST",
				body: JSON.stringify({
					command: "press",
					parameter: "default",
					commandType: "command",
				}),
			}
		);

		if (result.statusCode === 100) {
			return new Response(
				JSON.stringify({
					success: true,
					message: "Door opened successfully! Come on up to the 5th floor.",
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				}
			);
		} else {
			return new Response(
				JSON.stringify({
					success: false,
					message: "Failed to open door. Please try again or contact support.",
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				}
			);
		}
	} catch (error) {
		console.error("Buzz error:", error);
		return new Response(
			JSON.stringify({
				success: false,
				message: "An error occurred while trying to open the door.",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
};

async function switchbotRequest(env: any, path: string, args: RequestInit) {
	const token = env.SWITCHBOT_TOKEN;
	const secret = env.SWITCHBOT_KEY;

	const t = Date.now();
	const nonce = Math.floor(Math.random() * 1000000);
	const sign = createHmac("sha256", secret)
		.update(Buffer.from(token + t + nonce, "utf-8"))
		.digest()
		.toString("base64");

	const response = await fetch(`https://api.switch-bot.com/${path}`, {
		headers: {
			"Authorization": token,
			"t": t.toString(),
			"nonce": nonce.toString(),
			"sign": sign,
			"Content-Type": "application/json",
		},
		...args,
	});
	
	return response.json();
}