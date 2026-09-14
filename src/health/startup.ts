import type { RuntimeContract } from "../runtime/types.js";
import { healthResponse } from "./response.js";
export function startupProbe(contract: RuntimeContract, complete: boolean) { return healthResponse(contract.service, contract.contractVersion, complete ? "ready" : "not_ready", [], 0); }
