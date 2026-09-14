import { createServer } from "node:http";
import { createRuntimeContract, CONTRACT_VERSION } from "./runtime/contract.js";
import { loadConfig } from "./config.js";
import { handleHealth } from "./routes/health.js";
import { RuntimeLogger } from "./runtime/logger.js";
import { emitRuntimeEvent } from "./runtime/events.js";
import type { DependencyDefinition } from "./runtime/dependencies.js";
const config = loadConfig();
const startedAt = new Date().toISOString();
const contract = createRuntimeContract({ service: config.serviceName, environment: config.environment, status: config.startupComplete ? "ready" : "initializing", capabilities: ["health.live", "health.ready", "health.startup", "runtime.contract"], dependencies: [], startedAt, ...(config.startupComplete ? { readyAt: startedAt } : {}) });
const dependencies: DependencyDefinition[] = [];
const logger = new RuntimeLogger();
emitRuntimeEvent(logger, contract.service, CONTRACT_VERSION, contract.status);
const server = createServer(async (req, res) => {
  if (req.url === "/runtime/contract" && req.method === "GET") { res.statusCode = 200; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.setHeader("Cache-Control", "no-store"); res.end(JSON.stringify(contract)); return; }
  const handled = await handleHealth(req, res, { contract, dependencies, readinessDeadlineMs: config.readinessDeadlineMs, startupComplete: config.startupComplete });
  if (!handled) { res.statusCode = 404; res.setHeader("Cache-Control", "no-store"); res.end(JSON.stringify({ error: "NOT_FOUND" })); }
});
server.listen(config.port, config.host, () => process.stdout.write(JSON.stringify({ timestamp: new Date().toISOString(), level: "info", event: "server.listening", service: contract.service, contractVersion: CONTRACT_VERSION, status: contract.status }) + "\n"));
export { server, contract };
