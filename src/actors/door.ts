/// <reference types="../../worker-configuration.d.ts" />
import { actor, UserError } from "actor-core";
import { z } from "zod";
import { fetch, jsonFromRes } from "../effects";
import { run, type Operation, call } from "effection";

type OpenResponse =
	| { success: true; openedAt: Date }
	| { success: false; error: string };

export const doorActor = actor({
	createVars: (c, ctx) => {
		const { env } = ctx as { env: Env };
		return {
			deviceId: env.SWITCHBOT_DEVICE_ID,
			sbToken: env.SWITCHBOT_TOKEN,
			sbKey: env.SWITCHBOT_KEY,
			secret: env.BUZZER_SECRET,
		};
	},

	state: {
		isLocked: true,
	},

	onBeforeConnect(c, opts) {
		const params = opts.params as { secret: string };
		if (params.secret !== c.vars.secret) {
			throw new Error("Unauthorized");
		}
	},

	actions: {
		unlockDoor(c) {
			c.state.isLocked = false;
			c.broadcast("doorUnlocked");
		},
		lockDoor(c) {
			c.state.isLocked = true;
			c.broadcast("doorLocked");
		},
		openDoor: (c) =>
			run(function* (): Operation<OpenResponse> {
				if (c.state.isLocked) {
					return { success: false, error: "Door is locked" };
				}
				const { deviceId, sbToken, sbKey } = c.vars;

				if (!deviceId || !sbToken || !sbKey) {
					return { success: false, error: "Switchbot not configured" };
				}

				try {
					yield* switchbotRequest(
						`v1.1/devices/${deviceId}/commands`,
						{
							method: "POST",
							body: JSON.stringify({
								command: "press",
								parameter: "default",
								commandType: "command",
							}),
						},
						{ token: sbToken, secret: sbKey },
					);

					return { success: true, openedAt: new Date() };
				} catch (error) {
					return {
						success: false,
						error: `Failed to open door: ${error instanceof Error ? error.message : String(error)}`,
					};
				}
			}),

		scheduleUnlockPeriod(c, unlockAt: Date, lockAt: Date) {
			const now = new Date();
			if (now > lockAt) {
				throw new UserError("Unlock period has already passed");
			}

			if (unlockAt > lockAt) {
				throw new UserError("Unlock period is after lock period");
			}

			c.schedule.at(+unlockAt, "unlockDoor");
			c.schedule.at(+lockAt, "lockDoor");
		},
	},
});

const zSwitchbotResponse = z.object({
	context: z.object({
		deviceType: z.string(),
		battery: z.number(),
	}),
});
type SwitchbotResponse = z.infer<typeof zSwitchbotResponse>;

function* switchbotRequest(
	path: string,
	args: Partial<RequestInit>,
	opts: { token: string; secret: string },
): Operation<SwitchbotResponse> {
	const { token, secret } = opts;

	const t = Date.now();
	const nonce = Math.floor(Math.random() * 1000000);

	// Convert the message and secret to Uint8Arrays
	const encoder = new TextEncoder();
	const message = encoder.encode(token + t + nonce);
	const keyData = encoder.encode(secret);

	// Import the secret key and create signature
	const key = yield* call(() =>
		crypto.subtle.importKey(
			"raw",
			keyData,
			{ name: "HMAC", hash: "SHA-256" },
			false,
			["sign"],
		),
	);

	const signature = yield* call(() => crypto.subtle.sign("HMAC", key, message));

	// Convert to base64
	const sign = btoa(String.fromCharCode(...new Uint8Array(signature)));

	const response = yield* fetch(`https://api.switch-bot.com/${path}`, {
		headers: {
			Authorization: token,
			t: t.toString(),
			nonce: nonce.toString(),
			sign: sign,
			"Content-Type": "application/json",
		},
		...args,
	});

	return yield* jsonFromRes(response, zSwitchbotResponse);
}
