import type {
	R2Bucket,
	R2Checksums,
	R2Conditional,
	R2GetOptions,
	R2HTTPMetadata,
	R2ListOptions,
	R2MultipartOptions,
	R2MultipartUpload,
	R2Object,
	R2ObjectBody,
	R2Objects,
	R2PutOptions,
	R2Range,
} from "@cloudflare/workers-types";
import { type Operation, call } from "effection";
import type { PromiseToOperation } from "../effects.ts";

type OperationR2Object = {
	[K in keyof R2Object]: PromiseToOperation<R2Object[K]>;
};

type OperationR2Bucket = {
	[K in keyof R2Bucket]: R2Bucket[K] extends (
		...args: any[]
	) => Promise<infer R>
	? (
		...args: Parameters<R2Bucket[K]>
	) => Operation<R extends R2ObjectBody ? OperationR2ObjectBody : R>
	: R2Bucket[K];
};

export class OperationR2ObjectBody implements OperationR2Object {
	constructor(private r2Body: R2ObjectBody) { }

	get key(): string {
		return this.r2Body.key;
	}

	get version(): string {
		return this.r2Body.version;
	}

	get size(): number {
		return this.r2Body.size;
	}

	get etag(): string {
		return this.r2Body.etag;
	}

	get httpEtag(): string {
		return this.r2Body.httpEtag;
	}

	get checksums(): R2Checksums {
		return this.r2Body.checksums;
	}

	get uploaded(): Date {
		return this.r2Body.uploaded;
	}

	get httpMetadata(): R2HTTPMetadata | undefined {
		return this.r2Body.httpMetadata;
	}

	get customMetadata(): Record<string, string> | undefined {
		return this.r2Body.customMetadata;
	}

	get range(): R2Range | undefined {
		return this.r2Body.range;
	}

	get storageClass(): string {
		return this.r2Body.storageClass;
	}

	get ssecKeyMd5(): string | undefined {
		return this.r2Body.ssecKeyMd5;
	}

	writeHttpMetadata(headers: Headers): void {
		this.r2Body.writeHttpMetadata(headers);
	}

	get body(): ReadableStream {
		return this.r2Body.body;
	}

	get bodyUsed(): boolean {
		return this.r2Body.bodyUsed;
	}

	arrayBuffer(): Operation<ArrayBuffer> {
		return call(() => this.r2Body.arrayBuffer());
	}

	text(): Operation<string> {
		return call(() => this.r2Body.text());
	}

	json<T>(): Operation<T> {
		return call(() => this.r2Body.json<T>());
	}

	blob(): Operation<Blob> {
		return call(() => this.r2Body.blob());
	}
}

export class R2BucketEffects implements OperationR2Bucket {
	constructor(private bucket: R2Bucket) { }

	head(key: string): Operation<R2Object | null> {
		return call(() => this.bucket.head(key));
	}

	get(
		key: string,
		options?: R2GetOptions,
	): Operation<OperationR2ObjectBody | null>;
	get(
		key: string,
		options: R2GetOptions & { onlyIf: R2Conditional | Headers },
	): Operation<OperationR2ObjectBody | R2Object | null>;
	get(
		key: string,
		options?: R2GetOptions & { onlyIf?: R2Conditional | Headers },
	): Operation<OperationR2ObjectBody | R2Object | null> {
		return call(async () => {
			const result = await this.bucket.get(key, options);
			return result && "body" in result
				? new OperationR2ObjectBody(result)
				: result;
		});
	}

	put(
		key: string,
		value:
			| ReadableStream
			| ArrayBuffer
			| ArrayBufferView
			| string
			| null
			| Blob,
		options?: R2PutOptions,
	): Operation<R2Object>;
	put(
		key: string,
		value:
			| ReadableStream
			| ArrayBuffer
			| ArrayBufferView
			| string
			| null
			| Blob,
		options?: R2PutOptions & { onlyIf?: R2Conditional | Headers },
	): Operation<R2Object | null> {
		return call(() => this.bucket.put(key, value, options));
	}

	createMultipartUpload(
		key: string,
		options?: R2MultipartOptions,
	): Operation<R2MultipartUpload> {
		return call(() => this.bucket.createMultipartUpload(key, options));
	}

	resumeMultipartUpload(key: string, uploadId: string): R2MultipartUpload {
		return this.bucket.resumeMultipartUpload(key, uploadId);
	}

	delete(keys: string | string[]): Operation<void> {
		return call(() => this.bucket.delete(keys));
	}

	list(options?: R2ListOptions): Operation<R2Objects> {
		return call(() => this.bucket.list(options));
	}
}

export class CFEnv {
	constructor(private env: Env) { }
}
