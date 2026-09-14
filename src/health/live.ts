import type { RuntimeContract } from "../runtime/types.js";
import { healthResponse } from "./response.js";
export function liveProbe(contract: RuntimeContract) { return healthResponse(contract.service, contract.contractVersion, "ready", [], 0); }
