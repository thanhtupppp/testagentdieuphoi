import type { IncomingMessage, ServerResponse } from "node:http";
import type { DependencyDefinition } from "../runtime/dependencies.js";
import type { RuntimeStateStore } from "../runtime/state.js";
import type { StartupStateStore } from "../runtime/startup.js";
import { liveProbe } from "../health/live.js";
import { readyProbe } from "../health/ready.js";
import { startupProbe } from "../health/startup.js";

function send(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

export interface HealthRouteOptions {
  state: RuntimeStateStore;
  startup: StartupStateStore;
  dependencies: DependencyDefinition[];
  readinessDeadlineMs: number;
}

export async function handleHealth(req: IncomingMessage, res: ServerResponse, options: HealthRouteOptions): Promise<boolean> {
  if (req.method !== "GET") { send(res, 405, { error: "METHOD_NOT_ALLOWED" }); return true; }
  const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
  try {
    const contract = options.state.snapshot();
    switch (pathname) {
      case "/health/live": send(res, 200, liveProbe(contract)); return true;
      case "/health/startup": {
        const payload = startupProbe(contract, options.startup.snapshot());
        send(res, payload.status === "complete" ? 200 : 503, payload);
        return true;
      }
      case "/health/ready": {
        const startup = options.startup.snapshot();
        if (startup.status !== "complete") {
          options.state.transition("initializing");
          send(res, 503, { status: "initializing", service: contract.service, contractVersion: contract.contractVersion, timestamp: new Date().toISOString(), checks: [], durationMs: 0, errorCode: "STARTUP_INCOMPLETE" });
          return true;
        }
        const payload = await readyProbe(contract, { dependencies: options.dependencies, totalTimeoutMs: options.readinessDeadlineMs });
        options.state.transition(payload.status, payload.status === "ready" || payload.status === "degraded" ? new Date().toISOString() : undefined);
        send(res, payload.status === "not_ready" ? 503 : 200, payload);
        return true;
      }
      default: return false;
    }
  } catch {
    send(res, 503, { status: "not_ready", service: options.state.snapshot().service, contractVersion: options.state.snapshot().contractVersion, timestamp: new Date().toISOString(), checks: [], durationMs: 0, errorCode: "PROBE_FAILURE" });
    return true;
  }
}
