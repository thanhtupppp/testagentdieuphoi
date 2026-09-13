import { beforeEach, describe, expect, it } from 'vitest';
import {
  loadDefaultLocationId,
  loadLocations,
  makeLocation,
  saveDefaultLocationId,
  saveLocations,
} from '../features/locations/storage';

beforeEach(() => localStorage.clear());

describe('storage adapter', () => {
  it('round trips valid locations and default selection', () => {
    const location = makeLocation('A', 1, 2);
    saveLocations([location]);
    saveDefaultLocationId(location.id);
    expect(loadLocations()).toHaveLength(1);
    expect(loadDefaultLocationId()).toBe(location.id);
  });

  it('ignores malformed JSON and unsafe shapes', () => {
    localStorage.setItem('flood-alert.locations.v1', 'not-json');
    expect(loadLocations()).toEqual([]);
    localStorage.setItem('flood-alert.locations.v1', JSON.stringify([{
      id: 'bad', name: '', latitude: 999, longitude: 2,
      notificationsEnabled: 'yes', createdAt: 'x', updatedAt: 'x',
    }]));
    expect(loadLocations()).toEqual([]);
  });
});
