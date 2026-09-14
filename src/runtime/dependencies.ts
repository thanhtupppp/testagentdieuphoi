import type { DependencyCheckResult, DependencyType, ReadinessCheck } from "./types.js";
import { RuntimeError } from "./errors.js";

export interface DependencyDefinition { name: string; type: DependencyType; timeoutMs: number; check: ReadinessCheck; }

function now(): number { return performance.now(); }

export async function runDependencyCheck(dependency: DependencyDefinition, context: { correlationId?: string }, signal: AbortSignal): Promise<DependencyCheckResult> {
  const started = now();
  const controller = new AbortController();
  const onAbort = (): void => controller.abort(signal.reason);
  if (signal.aborted) controller.abort(signal.reason); else signal.addEventListener("abort", onAbort, { once: true });
  const timer = setTimeout(() => controller.abort(new RuntimeError("DEPENDENCY_TIMEOUT")), dependency.timeoutMs);
  try {
    await dependency.check(controller.signal, context);
    return { name: dependency.name, type: dependency.type, status: "healthy", durationMs: Math.round(now() - started) };
  } catch (error) {
    const status: "timeout" | "unhealthy" = controller.signal.aborted ? "timeout" : "unhealthy";
    return { name: dependency.name, type: dependency.type, status, durationMs: Math.round(now() - started), errorCode: status === "timeout" ? (signal.aborted ? "READINESS_DEADLINE_EXCEEDED" : "DEPENDENCY_TIMEOUT") : error instanceof RuntimeError ? error.code : "DEPENDENCY_EXCEPTION" };
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", onAbort);
  }
}
