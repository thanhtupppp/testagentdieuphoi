import type { DependencyCheckResult, ReadinessResult } from "./types.js";
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
  const settled = new Map<string, DependencyCheckResult>();
  const operations = options.dependencies.map((dependency) =>
    runDependencyCheck(dependency, { correlationId: options.correlationId }, controller.signal)
      .then((result) => { settled.set(dependency.name, result); return result; })
  );
  let deadlineTimer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    deadlineTimer = setTimeout(() => {
      controller.abort(new RuntimeError("READINESS_DEADLINE_EXCEEDED"));
      reject(new RuntimeError("READINESS_DEADLINE_EXCEEDED"));
    }, options.totalTimeoutMs);
  });

  try {
    const results = await Promise.race([Promise.all(operations), deadline]);
    return buildResult(results, started);
  } catch (error) {
    if (!(error instanceof RuntimeError) || error.code !== "READINESS_DEADLINE_EXCEEDED") throw error;
    const results = options.dependencies.map((dependency) => settled.get(dependency.name) ?? {
      name: dependency.name,
      type: dependency.type,
      status: "timeout" as const,
      durationMs: Math.round(performance.now() - started),
      errorCode: "READINESS_DEADLINE_EXCEEDED"
    });
    return buildResult(results, started);
  } finally {
    if (deadlineTimer !== undefined) clearTimeout(deadlineTimer);
    controller.abort(new RuntimeError("READINESS_OPERATION_COMPLETE"));
  }
}

function buildResult(results: DependencyCheckResult[], started: number): ReadinessResult {
  const checks = results.slice().sort((a, b) => a.name.localeCompare(b.name));
  const requiredFailed = checks.some((result) => result.type === "required" && result.status !== "healthy");
  const optionalFailed = checks.some((result) => result.type === "optional" && result.status !== "healthy");
  return {
    status: requiredFailed ? "not_ready" : optionalFailed ? "degraded" : "ready",
    checks,
    durationMs: Math.round(performance.now() - started)
  };
}
