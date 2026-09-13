import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchFlood, geocode } from '../features/flood/api';
import type { Location } from '../features/flood/types';

const location: Location = {
  id: 'x',
  name: 'Test',
  latitude: 10,
  longitude: 106,
  notificationsEnabled: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

beforeEach(() => vi.restoreAllMocks());

describe('flood API parser', () => {
  it('normalizes nullable discharge values and classifies through the domain module', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      timezone: 'Asia/Ho_Chi_Minh',
      daily: { time: ['2026-09-13', '2026-09-14'], river_discharge: [null, 100] },
    }), { status: 200, headers: { 'content-type': 'application/json' } })));
    const result = await fetchFlood(location);
    expect(result.forecast[0].discharge).toBeUndefined();
    expect(result.currentDischarge).toBe(100);
    expect(result.risk.level).toBe('normal');
  });

  it('rejects mismatched time and value arrays', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      daily: { time: ['2026-09-13'], river_discharge: [10, 20] },
    }), { status: 200 })));
    await expect(fetchFlood(location)).rejects.toThrow('khác độ dài');
  });

  it('surfaces rate limiting', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 429 })));
    await expect(fetchFlood(location)).rejects.toThrow('giới hạn tốc độ');
  });
});

describe('geocoding', () => {
  it('returns an empty list for no results but throws on transport errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ results: [] }), { status: 200 })));
    await expect(geocode('Không tồn tại')).resolves.toEqual([]);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    await expect(geocode('Đồng Nai')).rejects.toThrow('network');
  });
});
