import type { RuntimeStatus } from "./types.js";

export interface LogContext { service: string; contractVersion: string; status: RuntimeStatus; durationMs?: number; correlationId?: string; }
const sensitiveKey = /authorization|cookie|password|secret|token|api[_-]?key|connection[_-]?string|database[_-]?url/i;

function sanitize(value: unknown): unknown {
  if (value instanceof Error) return { name: value.name, message: value.message };
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
    for (const [key, child] of Object.entries(value)) if (!sensitiveKey.test(key) && key !== "__proto__" && key !== "constructor" && key !== "prototype") result[key] = sanitize(child);
    return result;
  }
  return value;
}

export class RuntimeLogger {
  private readonly lastStatusByService = new Map<string, RuntimeStatus>();
  public transition(context: LogContext, event: `runtime.${RuntimeStatus}`): void {
    if (this.lastStatusByService.get(context.service) === context.status) return;
    this.lastStatusByService.set(context.service, context.status);
    process.stdout.write(`${JSON.stringify(sanitize({ timestamp: new Date().toISOString(), level: "info", event, ...context }))}\n`);
  }
}
