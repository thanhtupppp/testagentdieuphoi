import type { DependencyCheckResult, DependencyType, ReadinessCheck } from "./types.js";
import { RuntimeError } from "./errors.js";

export interface DependencyDefinition {
  name: string;
  type: DependencyType;
  timeoutMs: number;
  check: ReadinessCheck;
}

function now(): number { return performance.now(); }

function codeFromReason(reason: unknown): string {
  return reason instanceof RuntimeError ? reason.code : "READINESS_DEADLINE_EXCEEDED";
}

export async function runDependencyCheck(
  dependency: DependencyDefinition,
  context: { correlationId?: string },
  signal: AbortSignal
): Promise<DependencyCheckResult> {
  const started = now();
  const controller = new AbortController();
  let dependencyTimedOut = false;
  let callerAborted = false;
  const onParentAbort = (): void => {
    callerAborted = true;
    controller.abort(signal.reason);
  };
  const timer = setTimeout(() => {
    dependencyTimedOut = true;
    controller.abort(new RuntimeError("DEPENDENCY_TIMEOUT"));
  }, dependency.timeoutMs);
  if (signal.aborted) onParentAbort(); else signal.addEventListener("abort", onParentAbort, { once: true });

  try {
    await dependency.check(controller.signal, context);
    return { name: dependency.name, type: dependency.type, status: "healthy", durationMs: Math.round(now() - started) };
  } catch (error) {
    const timedOut = dependencyTimedOut;
    const parentDeadline = callerAborted || signal.aborted;
    const status: "timeout" | "unhealthy" = timedOut || parentDeadline ? "timeout" : "unhealthy";
    const errorCode = timedOut ? "DEPENDENCY_TIMEOUT" : parentDeadline ? codeFromReason(signal.reason) : error instanceof RuntimeError ? error.code : "DEPENDENCY_EXCEPTION";
    return { name: dependency.name, type: dependency.type, status, durationMs: Math.round(now() - started), errorCode };
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", onParentAbort);
  }
}
