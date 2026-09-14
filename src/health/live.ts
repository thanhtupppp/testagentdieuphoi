import type { RuntimeContract } from "../runtime/types.js";

export interface LivenessResponse {
  status: "alive";
  service: string;
  contractVersion: string;
  timestamp: string;
  checks: [];
  durationMs: number;
}

export function liveProbe(contract: RuntimeContract): LivenessResponse {
  return { status: "alive", service: contract.service, contractVersion: contract.contractVersion, timestamp: new Date().toISOString(), checks: [], durationMs: 0 };
}
