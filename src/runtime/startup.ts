export type StartupState = "initializing" | "complete" | "failed";

export interface StartupSnapshot {
  status: StartupState;
  errorCode?: string;
}

export class StartupStateStore {
  private state: StartupSnapshot = { status: "initializing" };

  snapshot(): StartupSnapshot {
    return { ...this.state };
  }

  markComplete(): StartupSnapshot {
    this.state = { status: "complete" };
    return this.snapshot();
  }

  markFailed(errorCode = "STARTUP_FAILED"): StartupSnapshot {
    this.state = { status: "failed", errorCode };
    return this.snapshot();
  }
}
