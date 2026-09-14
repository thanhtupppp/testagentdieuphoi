import type { DependencyDefinition } from "./dependencies.js";
import type { DependencyType, ReadinessCheck } from "./types.js";

export interface DependencyRegistration {
  name: string;
  type: DependencyType;
  timeoutMs: number;
  check: ReadinessCheck;
}

export class DependencyRegistry {
  private readonly entries = new Map<string, DependencyDefinition>();

  register(definition: DependencyRegistration): void {
    if (!definition.name.trim()) throw new Error("DEPENDENCY_INVALID_NAME");
    if (this.entries.has(definition.name)) throw new Error("DUPLICATE_DEPENDENCY");
    if (!Number.isInteger(definition.timeoutMs) || definition.timeoutMs <= 0 || definition.timeoutMs > 30_000) {
      throw new Error("DEPENDENCY_INVALID_TIMEOUT");
    }
    this.entries.set(definition.name, Object.freeze({ ...definition }));
  }

  list(): DependencyDefinition[] {
    return [...this.entries.values()].sort((a, b) => a.name.localeCompare(b.name)).map((entry) => ({ ...entry }));
  }
}

export function createDependencyRegistry(definitions: DependencyRegistration[] = []): DependencyRegistry {
  const registry = new DependencyRegistry();
  for (const definition of definitions) registry.register(definition);
  return registry;
}
