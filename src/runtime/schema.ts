import { z } from "zod";
import type { RuntimeContract } from "./types.js";

const MAX_TIMEOUT_MS = 30_000;
const MAX_STRING_LENGTH = 256;
const MAX_CAPABILITIES = 64;
const MAX_DEPENDENCIES = 64;
const MAX_METADATA_ENTRIES = 64;
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+)?(?:\+[0-9A-Za-z-]+)?$/;

const safeMetadataSchema = z.record(z.string(), z.union([z.string(), z.number().finite(), z.boolean()])).superRefine((value, ctx) => {
  if (Object.keys(value).length > MAX_METADATA_ENTRIES) {
    ctx.addIssue({ code: "custom", message: "metadata exceeds maximum entries" });
  }
  for (const key of Object.keys(value)) {
    if (FORBIDDEN_KEYS.has(key)) ctx.addIssue({ code: "custom", message: "forbidden metadata key" });
    if (/pass(word)?|secret|token|api[_-]?key|authorization|cookie|database[_-]?url|connection[_-]?string/i.test(key)) ctx.addIssue({ code: "custom", message: "sensitive metadata key" });
  }
});

export const runtimeDependencySchema = z.object({
  name: z.string().trim().min(1).max(MAX_STRING_LENGTH),
  type: z.enum(["required", "optional"]),
  timeoutMs: z.number().int().positive().max(MAX_TIMEOUT_MS),
  status: z.enum(["unknown", "healthy", "unhealthy", "timeout"]).optional(),
  errorCode: z.string().regex(/^[A-Z0-9_]+$/).max(64).optional()
}).strict();

export const runtimeContractSchema = z.object({
  contractVersion: z.string().trim().regex(semverPattern, "contractVersion must be semantic version"),
  service: z.string().trim().min(1).max(MAX_STRING_LENGTH),
  instanceId: z.string().trim().min(1).max(MAX_STRING_LENGTH).optional(),
  environment: z.string().trim().min(1).max(MAX_STRING_LENGTH),
  status: z.enum(["initializing", "ready", "degraded", "not_ready"]),
  capabilities: z.array(z.string().trim().min(1).max(MAX_STRING_LENGTH)).max(MAX_CAPABILITIES),
  dependencies: z.array(runtimeDependencySchema).max(MAX_DEPENDENCIES),
  startedAt: z.string().datetime({ offset: true }),
  readyAt: z.string().datetime({ offset: true }).optional(),
  metadata: safeMetadataSchema.optional()
}).strict().superRefine((value, ctx) => {
  if (new Set(value.capabilities).size !== value.capabilities.length) ctx.addIssue({ code: "custom", path: ["capabilities"], message: "capabilities must be unique" });
  if (value.status === "ready" && !value.readyAt) ctx.addIssue({ code: "custom", path: ["readyAt"], message: "readyAt is required when status is ready" });
});

export function validateRuntimeContract(input: unknown): RuntimeContract {
  return runtimeContractSchema.parse(input);
}
