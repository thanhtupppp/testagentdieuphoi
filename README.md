# testagentdieuphoi

Production-ready TypeScript skeleton for safe runtime contracts and readiness observability. The repository intentionally uses Node's standard HTTP server to keep the runtime surface small; Zod is used for runtime schema validation.

## Requirements

- Node.js 22+
- npm 10+

## Install and run

```bash
npm ci
npm run build
npm start
```

Development uses the TypeScript compiler output so production and development execute the same generated JavaScript:

```bash
npm run dev
```

## Quality gates

```bash
npm run typecheck
npm test
npm run lint
npm run format:check
npm run build
```

`lint` is a dependency-free static hygiene check over the source tree. `format:check` enforces LF endings, no trailing whitespace, and final newlines; the project avoids adding a formatter dependency solely for these checks.

## Endpoints

- `GET /health/live` — process liveness. Returns HTTP 200 while the HTTP process can answer.
- `GET /health/ready` — dependency readiness. Returns 200 for `ready` or `degraded`, 503 for `not_ready`.
- `GET /health/startup` — startup completion. Returns 200 only after startup is complete, otherwise 503.
- `GET /runtime/contract` — current validated runtime contract.

All health/contract responses use `Cache-Control: no-store` and never serialize environment variables, credentials, stack traces, or connection strings.

## Runtime contract

The contract is versioned with semantic versioning and contains service identity, environment, lifecycle status, capabilities, dependencies, timestamps, and safe diagnostic metadata. Runtime input is validated with Zod and rejects duplicate capabilities, dangerous object keys, secret-like metadata, malformed timestamps, unsupported status values, and invalid dependency timeouts.

See [`docs/runtime-contract.md`](docs/runtime-contract.md) for the compatibility policy and schema rules.

## Readiness model

Readiness is independent from liveness. Required dependency failure or timeout makes the component `not_ready`; optional dependency failure produces `degraded` while the HTTP status remains 200. Every dependency has its own timeout and the aggregator has a total deadline. Checks are read-only by convention, execute concurrently, and all results are collected deterministically before the aggregate state is selected.

See [`docs/readiness-observability.md`](docs/readiness-observability.md).

## Security assumptions

The health endpoints are intended for localhost/private-network exposure. If they are exposed through a public ingress, protect them with network policy, authentication at the ingress, or equivalent access controls. Query parameters cannot alter probe deadlines or bypass required checks. Error responses expose stable internal error codes rather than exception messages.

Structured runtime events are emitted only on lifecycle state transitions to avoid polling log storms. Sensitive field names are removed before JSON logging.

## Docker/Kubernetes

The endpoints map directly to common Kubernetes probes:

```yaml
livenessProbe:
  httpGet: { path: /health/live, port: 3000 }
readinessProbe:
  httpGet: { path: /health/ready, port: 3000 }
startupProbe:
  httpGet: { path: /health/startup, port: 3000 }
```

The application currently does not ship a Dockerfile; container images can run `npm ci`, `npm run build`, and `npm start` with a non-root runtime user.

## Adding a readiness check

Add a read-only `DependencyDefinition` with a stable name, explicit `required`/`optional` classification, and a bounded timeout. Do not accept dependency definitions from HTTP clients. Register the check in the application composition layer and keep secrets out of its error messages and metadata.
