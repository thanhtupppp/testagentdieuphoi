import { validateRuntimeContract } from "./schema.js";
import type { RuntimeContract, RuntimeStatus } from "./types.js";

export const CONTRACT_VERSION = "1.0.0";

export function createRuntimeContract(input: Omit<RuntimeContract, "contractVersion"> & { contractVersion?: string }): RuntimeContract {
  return validateRuntimeContract({ ...input, contractVersion: input.contractVersion ?? CONTRACT_VERSION });
}

export function transitionStatus(contract: RuntimeContract, status: RuntimeStatus, readyAt?: string): RuntimeContract {
  return validateRuntimeContract({ ...contract, status, ...(readyAt ? { readyAt } : {}) });
}
