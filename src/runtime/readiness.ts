import type { ReadinessResult, ReadinessCheck } from "./types.js";
import type { DependencyDefinition } from "./dependencies.js";
import { runDependencyCheck } from "./dependencies.js";
import { RuntimeError } from "./errors.js";

export interface ReadinessOptions { dependencies: DependencyDefinition[]; totalTimeoutMs: number; correlationId?: string; }

export async function aggregateReadiness(options: ReadinessOptions): Promise<ReadinessResult> {
  const started = performance.now();
  const controller = new AbortController();
  const deadline = setTimeout(() => controller.abort(new RuntimeError("READINESS_DEADLINE_EXCEEDED")), options.totalTimeoutMs);
  try {
    const results = await Promise.all(options.dependencies.map((dependency) => runDependencyCheck(dependency, { correlationId: options.correlationId }, controller.signal)));
    const requiredFailed = results.some((result) => result.type === "required" && result.status !== "healthy");
    const optionalFailed = results.some((result) => result.type === "optional" && result.status !== "healthy");
    const status = requiredFailed ? "not_ready" : optionalFailed ? "degraded" : "ready";
    return { status, checks: results.sort((a, b) => a.name.localeCompare(b.name)), durationMs: Math.round(performance.now() - started) };
  } finally {
    clearTimeout(deadline);
  }
}

export function checkFromPromise(check: () => Promise<void>): ReadinessCheck { return async () => check(); }
