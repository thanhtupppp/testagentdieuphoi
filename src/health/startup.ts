import type { RuntimeContract } from "../runtime/types.js";
import type { StartupSnapshot } from "../runtime/startup.js";

export interface StartupResponse {
  status: "initializing" | "complete" | "failed";
  service: string;
  contractVersion: string;
  timestamp: string;
  checks: [];
  durationMs: number;
  errorCode?: string;
}

export function startupProbe(contract: RuntimeContract, startup: StartupSnapshot): StartupResponse {
  return {
    status: startup.status,
    service: contract.service,
    contractVersion: contract.contractVersion,
    timestamp: new Date().toISOString(),
    checks: [],
    durationMs: 0,
    ...(startup.errorCode ? { errorCode: startup.errorCode } : {})
  };
}
