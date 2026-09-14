export type RuntimeErrorCode =
  | "CONTRACT_INVALID"
  | "CONTRACT_VERSION_INCOMPATIBLE"
  | "DEPENDENCY_UNHEALTHY"
  | "DEPENDENCY_TIMEOUT"
  | "DEPENDENCY_EXCEPTION"
  | "READINESS_DEADLINE_EXCEEDED"
  | "STARTUP_NOT_COMPLETE";

export class RuntimeError extends Error {
  public readonly code: RuntimeErrorCode;
  public readonly cause?: unknown;

  public constructor(code: RuntimeErrorCode, cause?: unknown) {
    super(code);
    this.name = "RuntimeError";
    this.code = code;
    this.cause = cause;
  }
}

export function sanitizeErrorCode(error: unknown): RuntimeErrorCode {
  if (error instanceof RuntimeError) return error.code;
  return "DEPENDENCY_EXCEPTION";
}
