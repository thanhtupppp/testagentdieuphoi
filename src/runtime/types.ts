export type RuntimeStatus = "initializing" | "ready" | "degraded" | "not_ready";
export type DependencyType = "required" | "optional";
export type DependencyStatus = "unknown" | "healthy" | "unhealthy" | "timeout";
export type Primitive = string | number | boolean;
export type SafeMetadata = Record<string, Primitive>;

export interface RuntimeDependency {
  name: string;
  type: DependencyType;
  timeoutMs: number;
  status?: DependencyStatus;
  errorCode?: string;
}

export interface RuntimeContract {
  contractVersion: string;
  service: string;
  instanceId?: string;
  environment: string;
  status: RuntimeStatus;
  capabilities: string[];
  dependencies: RuntimeDependency[];
  startedAt: string;
  readyAt?: string;
  metadata?: SafeMetadata;
}

export interface DependencyCheckResult {
  name: string;
  type: DependencyType;
  status: Exclude<DependencyStatus, "unknown">;
  durationMs: number;
  errorCode?: string;
}

export interface ReadinessResult {
  status: Extract<RuntimeStatus, "ready" | "degraded" | "not_ready">;
  checks: DependencyCheckResult[];
  durationMs: number;
}

export interface ProbeContext {
  correlationId?: string;
}

export type ReadinessCheck = (signal: AbortSignal, context: ProbeContext) => Promise<void>;
