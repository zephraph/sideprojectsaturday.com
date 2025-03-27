import { z } from "zod";
import { action, call, sleep, spawn, type Operation } from "effection";
import { TimeoutError } from "./errors";

// Operations

type FetchParams = Parameters<typeof globalThis.fetch>;
export function fetch(...[input, init]: FetchParams): Operation<Response> {
	return action((resolve, reject) => {
		const internalController = new AbortController();
		const signal = internalController.signal;

		if (init?.signal) {
			init.signal.addEventListener("abort", () => internalController.abort());
		}

		try {
			globalThis.fetch(input, { ...init, signal }).then(resolve, reject);
		} catch (error) {
			reject(error instanceof Error ? error : new Error(String(error)));
		}
		return () => internalController.abort();
	});
}

export function* parseJson<J extends object, T>(
	maybeJson: J | string,
	schema: z.ZodType<T>,
): Operation<T> {
	let data: T;
	try {
		data = typeof maybeJson === "string" ? JSON.parse(maybeJson) : maybeJson;
	} catch (error) {
		throw error instanceof Error ? error : new Error(String(error));
	}
	const parseResult = schema.safeParse(data);
	if (!parseResult.success) {
		throw new Error(parseResult.error.message);
	}
	return parseResult.data;
}

export function* jsonFromRes<
	R extends object,
	Res extends { json: () => Promise<string | R> },
	T,
>(response: Res, schema: z.ZodType<T>): Operation<T> {
	const data = yield* call(() => response.json());
	return yield* parseJson<R, T>(data, schema);
}

export function* textFromRes(response: Response): Operation<string> {
	return yield* call(() => response.text());
}

/**
 * Add to the start of your operation to ensure it doesn't take too long.
 * Throws a TimeoutError if the operation takes longer than the specified number of milliseconds.
 *
 * @param ms - The number of milliseconds to wait before throwing a TimeoutError.
 * @param msg - The message to include in the TimeoutError.
 *
 */
export function* timeout(ms: number, msg?: string): Operation<void> {
	yield* spawn(function* () {
		yield* sleep(ms);
		throw new TimeoutError(msg ?? `This operation timed out after ${ms}ms`);
	});
}

export function* retryWithBackoff<T>(
	op: Operation<T>,
	options: { retries: number; timeout: number },
): Operation<T> {
	yield* timeout(options.timeout);

	for (let i = 0; i < options.retries; i++) {
		try {
			return yield* op;
		} catch (error) {
			if (i === options.retries - 1) {
				throw error;
			}
			const backoff = Math.pow(2, i - 1) * 1000;
			const delayMs = Math.round((backoff * (1 + Math.random())) / 2);
			yield* sleep(delayMs);
		}
	}
	// This should never happen; just to make the type checker happy
	throw new Error("unreachable");
}

export type PromiseToOperation<T> = T extends (
	...args: any[]
) => Promise<infer R>
	? (...args: Parameters<T>) => Operation<R>
	: T;
