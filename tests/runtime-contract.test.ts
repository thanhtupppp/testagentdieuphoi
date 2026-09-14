import test from "node:test";
import assert from "node:assert/strict";
import { createRuntimeContract } from "../src/runtime/contract.js";
import { validateRuntimeContract } from "../src/runtime/schema.js";
import { assertCompatible } from "../src/runtime/compatibility.js";
test("validates a runtime contract", () => { const contract = createRuntimeContract({ service: "demo", environment: "test", status: "initializing", capabilities: ["health"], dependencies: [], startedAt: new Date().toISOString() }); assert.equal(contract.contractVersion, "1.0.0"); });
test("rejects missing required fields and dangerous metadata", () => { assert.throws(() => validateRuntimeContract({ service: "demo" })); assert.throws(() => validateRuntimeContract({ contractVersion: "1.0.0", service: "demo", environment: "test", status: "initializing", capabilities: [], dependencies: [], startedAt: new Date().toISOString(), metadata: { constructor: "x" } })); });
test("rejects incompatible major versions", () => { assert.throws(() => assertCompatible("1.0.0", "2.0.0")); assert.doesNotThrow(() => assertCompatible("1.2.0", "1.3.0")); assert.doesNotThrow(() => assertCompatible("1.2.0", "1.2.4")); });
