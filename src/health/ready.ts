import type { RuntimeContract } from "../runtime/types.js";
import { aggregateReadiness, type ReadinessOptions } from "../runtime/readiness.js";
import { healthResponse } from "./response.js";
export async function readyProbe(contract: RuntimeContract, options: ReadinessOptions) { const result = await aggregateReadiness(options); return healthResponse(contract.service, contract.contractVersion, result.status, result.checks, result.durationMs); }
