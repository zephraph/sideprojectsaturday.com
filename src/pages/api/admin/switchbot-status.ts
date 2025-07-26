import { createHmac } from "node:crypto";
import type { APIRoute } from "astro";
import type { SwitchBotStatusResponse, SwitchBotApiResponse } from "@/lib/switchbot-types";

export const GET: APIRoute = async () => {
	try {
		// Make SwitchBot request to get device status
		const result: SwitchBotStatusResponse = await switchbotRequest(
			`v1.1/devices/${process.env.SWITCHBOT_DEVICE_ID}/status`,
			{
				method: "GET",
			},
		);

		if (result.statusCode === 100) {
			return new Response(
				JSON.stringify({
					success: true,
					data: result.body,
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
					error: "Failed to fetch device status",
					statusCode: result.statusCode,
					message: result.message,
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}
	} catch (error) {
		console.error("SwitchBot status error:", error);
		return new Response(
			JSON.stringify({
				success: false,
				error: "An error occurred while fetching device status",
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