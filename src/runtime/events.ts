import type { RuntimeStatus } from "./types.js";
import { RuntimeLogger } from "./logger.js";
export type RuntimeEvent = `runtime.${RuntimeStatus}`;
export function emitRuntimeEvent(logger: RuntimeLogger, service: string, contractVersion: string, status: RuntimeStatus, durationMs?: number, correlationId?: string): void {
  logger.transition({ service, contractVersion, status, durationMs, correlationId }, `runtime.${status}`);
}
