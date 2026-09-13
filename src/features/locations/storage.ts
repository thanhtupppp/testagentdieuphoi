import type { Location } from '../flood/types';
import { validateCoordinates } from '../../lib/validation';

const KEY = 'flood-alert.locations.v1';
const DEFAULT_KEY = 'flood-alert.default-location.v1';

function isValidLocation(value: unknown): value is Location {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== 'string' || !item.id.trim()) return false;
  if (typeof item.name !== 'string' || !item.name.trim()) return false;
  if (typeof item.latitude !== 'number' || typeof item.longitude !== 'number') return false;
  if (typeof item.notificationsEnabled !== 'boolean') return false;
  if (typeof item.createdAt !== 'string' || Number.isNaN(Date.parse(item.createdAt))) return false;
  if (typeof item.updatedAt !== 'string' || Number.isNaN(Date.parse(item.updatedAt))) return false;
  try {
    validateCoordinates(item.latitude, item.longitude);
  } catch {
    return false;
  }
  return true;
}

function getStorage(): Storage | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function loadLocations(): Location[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(KEY);
    const parsed: unknown = JSON.parse(raw ?? 'null');
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed.filter((value): value is Location => {
      if (!isValidLocation(value)) return false;
      if (seen.has(value.id)) return false;
      seen.add(value.id);
      return true;
    });
  } catch {
    return [];
  }
}

export function saveLocations(locations: Location[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(KEY, JSON.stringify(locations.filter(isValidLocation)));
  } catch {
    // Storage may be blocked or full; the in-memory state remains usable.
  }
}

export function loadDefaultLocationId(): string | undefined {
  const storage = getStorage();
  if (!storage) return undefined;
  try {
    return storage.getItem(DEFAULT_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function saveDefaultLocationId(id: string | undefined): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    if (id) storage.setItem(DEFAULT_KEY, id);
    else storage.removeItem(DEFAULT_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export function makeLocation(name: string, latitude: number, longitude: number): Location {
  validateCoordinates(latitude, longitude);
  const normalizedName = name.trim().slice(0, 80);
  if (!normalizedName) throw new Error('Tên địa điểm không được để trống.');
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: normalizedName,
    latitude,
    longitude,
    notificationsEnabled: false,
    createdAt: now,
    updatedAt: now,
  };
}
