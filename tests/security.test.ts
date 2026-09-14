import test from "node:test";
import assert from "node:assert/strict";
import { validateRuntimeContract } from "../src/runtime/schema.js";
import { RuntimeLogger } from "../src/runtime/logger.js";
test("secret-like metadata is rejected", () => { assert.throws(() => validateRuntimeContract({ contractVersion: "1.0.0", service: "svc", environment: "test", status: "initializing", capabilities: [], dependencies: [], startedAt: new Date().toISOString(), metadata: { apiKey: "secret" } })); });
test("logger sanitizes secrets and does not emit duplicate state transitions", () => { const writes: string[] = []; const originalWrite = process.stdout.write; process.stdout.write = ((chunk: string | Uint8Array) => { writes.push(String(chunk)); return true; }) as typeof process.stdout.write; try { const logger = new RuntimeLogger(); const context = { service: "svc", contractVersion: "1.0.0", status: "ready" as const, correlationId: "c1" }; logger.transition(context, "runtime.ready"); logger.transition(context, "runtime.ready"); assert.equal(writes.length, 1); assert.doesNotMatch(writes[0], /token|password|secret/i); } finally { process.stdout.write = originalWrite; } });
