# Runtime Contract v1

## Schema

```ts
interface RuntimeContract {
  contractVersion: string;
  service: string;
  instanceId?: string;
  environment: string;
  status: "initializing" | "ready" | "degraded" | "not_ready";
  capabilities: string[];
  dependencies: RuntimeDependency[];
  startedAt: string;
  readyAt?: string;
  metadata?: Record<string, string | number | boolean>;
}
```

Dependencies contain `name`, `type` (`required` or `optional`) and a positive bounded `timeoutMs`. Runtime validation rejects extra object keys, dangerous prototype keys, duplicate capabilities, malformed semantic versions, and secret-like metadata keys.

## Compatibility policy

- Major versions are incompatible by default.
- A newer provider minor version is accepted when the consumer does not require fields or capabilities introduced by that minor version.
- Patch versions are backward compatible.
- A missing capability is a contract error when it is required; for an optional dependency it is represented as degraded.
- Compatibility is evaluated using parsed semantic-version components, never raw string comparison.

The initial compatibility API therefore accepts equal-major versions and rejects major-version mismatches. Capability negotiation remains an application-level responsibility and must never trust client-supplied dependency declarations.

## Security

Contracts are configuration/runtime state, not an authorization mechanism. Never place credentials, tokens, passwords, database URLs, cookies, or authorization headers in `metadata`. Never serialize `process.env` into the contract or health response.
