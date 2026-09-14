import { RuntimeError } from "./errors.js";

export interface Semver { major: number; minor: number; patch: number; }

export function parseSemver(version: string): Semver {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(version);
  if (!match) throw new RuntimeError("CONTRACT_INVALID");
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

export function isCompatible(consumerVersion: string, providerVersion: string): boolean {
  const consumer = parseSemver(consumerVersion);
  const provider = parseSemver(providerVersion);
  if (consumer.major !== provider.major) return false;
  if (provider.minor < consumer.minor) return true;
  if (provider.minor > consumer.minor) return true;
  return provider.patch >= consumer.patch;
}

export function assertCompatible(consumerVersion: string, providerVersion: string): void {
  if (!isCompatible(consumerVersion, providerVersion)) throw new RuntimeError("CONTRACT_VERSION_INCOMPATIBLE");
}
