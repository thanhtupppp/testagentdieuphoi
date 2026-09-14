import type { IncomingMessage, ServerResponse } from "node:http";
import type { RuntimeContract } from "../runtime/types.js";
import { liveProbe } from "../health/live.js";
import { readyProbe } from "../health/ready.js";
import { startupProbe } from "../health/startup.js";
import type { DependencyDefinition } from "../runtime/dependencies.js";
function send(res: ServerResponse, statusCode: number, payload: unknown): void { res.statusCode = statusCode; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.setHeader("Cache-Control", "no-store"); res.end(JSON.stringify(payload)); }
export interface HealthRouteOptions { contract: RuntimeContract; dependencies: DependencyDefinition[]; readinessDeadlineMs: number; startupComplete: boolean; }
export async function handleHealth(req: IncomingMessage, res: ServerResponse, options: HealthRouteOptions): Promise<boolean> {
  if (req.method !== "GET") { send(res, 405, { error: "METHOD_NOT_ALLOWED" }); return true; }
  try {
    switch (req.url) {
      case "/health/live": send(res, 200, liveProbe(options.contract)); return true;
      case "/health/startup": { const payload = startupProbe(options.contract, options.startupComplete); send(res, options.startupComplete ? 200 : 503, payload); return true; }
      case "/health/ready": { const payload = await readyProbe(options.contract, { dependencies: options.dependencies, totalTimeoutMs: options.readinessDeadlineMs }); send(res, payload.status === "not_ready" ? 503 : 200, payload); return true; }
      default: return false;
    }
  } catch { send(res, 503, { status: "not_ready", service: options.contract.service, contractVersion: options.contract.contractVersion, timestamp: new Date().toISOString(), checks: [], durationMs: 0, errorCode: "PROBE_FAILURE" }); return true; }
}
