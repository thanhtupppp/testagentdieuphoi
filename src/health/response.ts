import type { RuntimeStatus, DependencyCheckResult } from "../runtime/types.js";
export interface HealthResponse { status: RuntimeStatus; service: string; contractVersion: string; timestamp: string; checks: DependencyCheckResult[]; durationMs: number; }
export function healthResponse(service: string, contractVersion: string, status: RuntimeStatus, checks: DependencyCheckResult[], durationMs: number): HealthResponse { return { status, service, contractVersion, timestamp: new Date().toISOString(), checks, durationMs }; }
