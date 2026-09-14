import type { RuntimeContract, RuntimeStatus } from "./types.js";

export class RuntimeStateStore {
  private snapshotValue: RuntimeContract;

  constructor(initial: RuntimeContract) {
    this.snapshotValue = cloneContract(initial);
  }

  snapshot(): RuntimeContract {
    return cloneContract(this.snapshotValue);
  }

  transition(status: RuntimeStatus, readyAt?: string): RuntimeContract {
    const next: RuntimeContract = {
      ...this.snapshotValue,
      status,
      dependencies: this.snapshotValue.dependencies.map((dependency) => ({ ...dependency })),
      capabilities: [...this.snapshotValue.capabilities],
      ...(readyAt ? { readyAt } : {})
    };
    if (status !== "ready" && status !== "degraded") delete next.readyAt;
    this.snapshotValue = cloneContract(next);
    return this.snapshot();
  }

  updateDependencies(dependencies: RuntimeContract["dependencies"]): RuntimeContract {
    this.snapshotValue = cloneContract({ ...this.snapshotValue, dependencies: dependencies.map((dependency) => ({ ...dependency })) });
    return this.snapshot();
  }
}

function cloneContract(contract: RuntimeContract): RuntimeContract {
  return {
    ...contract,
    capabilities: [...contract.capabilities],
    dependencies: contract.dependencies.map((dependency) => ({ ...dependency })),
    ...(contract.metadata ? { metadata: { ...contract.metadata } } : {})
  };
}
