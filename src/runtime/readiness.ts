import type { ReadinessResult } from "./types.js";
import type { DependencyDefinition } from "./dependencies.js";
import { runDependencyCheck } from "./dependencies.js";
import { RuntimeError } from "./errors.js";

export interface ReadinessOptions {
  dependencies: DependencyDefinition[];
  totalTimeoutMs: number;
  correlationId?: string;
}

export async function aggregateReadiness(options: ReadinessOptions): Promise<ReadinessResult> {
  if (!Number.isInteger(options.totalTimeoutMs) || options.totalTimeoutMs <= 0) throw new RuntimeError("READINESS_INVALID_DEADLINE");
  const started = performance.now();
  const controller = new AbortController();
  let deadlineFired = false;
  const deadline = setTimeout(() => {
    deadlineFired = true;
    controller.abort(new RuntimeError("READINESS_DEADLINE_EXCEEDED"));
  }, options.totalTimeoutMs);

  const operation = Promise.all(options.dependencies.map((dependency) => runDependencyCheck(dependency, { correlationId: options.correlationId }, controller.signal)));
  const hardDeadline = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new RuntimeError("READINESS_DEADLINE_EXCEEDED")), options.totalTimeoutMs);
  });

  try {
    const results = await Promise.race([operation, hardDeadline]);
    const sorted = results.slice().sort((a, b) => a.name.localeCompare(b.name));
    const requiredFailed = sorted.some((result) => result.type === "required" && result.status !== "healthy");
    const optionalFailed = sorted.some((result) => result.type === "optional" && result.status !== "healthy");
    const status = requiredFailed ? "not_ready" : optionalFailed ? "degraded" : "ready";
    return { status, checks: sorted, durationMs: Math.round(performance.now() - started) };
  } catch (error) {
    if (deadlineFired || error instanceof RuntimeError && error.code === "READINESS_DEADLINE_EXCEEDED") {
      controller.abort(new RuntimeError("READINESS_DEADLINE_EXCEEDED"));
      const settled = await Promise.allSettled(options.dependencies.map((dependency) => runDependencyCheck(dependency, { correlationId: options.correlationId }, controller.signal)));
      const checks = settled.flatMap((entry) => entry.status === "fulfilled" ? [entry.value] : []).sort((a, b) => a.name.localeCompare(b.name));
      return { status: "not_ready", checks, durationMs: Math.round(performance.now() - started) };
    }
    throw error;
  } finally {
    clearTimeout(deadline);
  }
}
