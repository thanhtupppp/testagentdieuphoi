# Readiness and Observability

## States

- `initializing`: startup is in progress.
- `ready`: every required dependency is healthy.
- `degraded`: required dependencies are healthy but at least one optional dependency is unhealthy or timed out.
- `not_ready`: at least one required dependency is unhealthy or timed out.

Liveness answers whether the process can respond; readiness answers whether it can safely accept work; startup answers whether initialization has completed. Liveness never implies readiness.

## Aggregation algorithm

Each check gets an independent `AbortController` timeout. A separate total deadline aborts the complete readiness operation. All checks are awaited so one failure does not hide other results. Results are sorted by dependency name before serialization for deterministic output.

Timeouts are reported as `DEPENDENCY_TIMEOUT`; thrown probe errors are reported as `DEPENDENCY_EXCEPTION` or a stable `RuntimeError` code. Probe exceptions are caught and never crash the server.

The implementation does not retry inside an HTTP readiness request. If retries are added later, they must be bounded and use explicit backoff.

## Structured events

Lifecycle events are JSON objects with timestamp, level, event, service, contract version, status, duration and optional correlation ID. `RuntimeLogger` suppresses duplicate consecutive state events for a service, preventing readiness polling from creating a log storm.

## HTTP policy

Health endpoints are `GET` only, reject other methods with 405, use `Cache-Control: no-store`, do not accept query parameters that change policy, and return 503 for failed readiness/startup. They are intended for private network exposure unless an ingress adds authentication/network controls.
