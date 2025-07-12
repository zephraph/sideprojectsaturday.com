import { createHmac } from "node:crypto";
import type { APIRoute } from "astro";
import { db } from "@/lib/auth";
import { isWithinEventHours } from "@/lib/date-utils";

export const POST: APIRoute = async ({ locals }) => {
	try {
		const runtime = locals.runtime;

		// Initialize database
		db(runtime.env);

		// Check if it's Saturday between 9am and 12pm EST/EDT
		if (!isWithinEventHours()) {
			return new Response(
				JSON.stringify({
					success: false,
					message:
						"The door can only be opened on Saturdays from 9 AM to 12 PM EST.",
				}),
				{
					status: 403,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Make SwitchBot request to open door
		const result = await switchbotRequest(
			`v1.1/devices/${process.env.SWITCHBOT_DEVICE_ID}/commands`,
			{
				method: "POST",
				body: JSON.stringify({
					command: "press",
					parameter: "default",
					commandType: "command",
				}),
			},
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
				},
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
				},
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
			},
		);
	}
};

async function switchbotRequest(path: string, args: RequestInit) {
	const token = process.env.SWITCHBOT_TOKEN;
	const secret = process.env.SWITCHBOT_KEY;

	if (!token || !secret) {
		throw new Error("SwitchBot credentials not configured");
	}

	const t = Date.now();
	const nonce = Math.floor(Math.random() * 1000000);
	const sign = createHmac("sha256", secret)
		.update(Buffer.from(token + t + nonce, "utf-8"))
		.digest()
		.toString("base64");

	const response = await fetch(`https://api.switch-bot.com/${path}`, {
		headers: {
			Authorization: token,
			t: t.toString(),
			nonce: nonce.toString(),
			sign: sign,
			"Content-Type": "application/json",
		},
		...args,
	});

	return response.json();
}
