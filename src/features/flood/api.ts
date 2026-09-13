import { FLOOD_API, GEOCODING_API, RISK_LABELS } from '../../lib/constants';
import { validateCoordinates } from '../../lib/validation';
import type { FloodObservation, FloodPoint, Location } from './types';
import { classifyRisk, percentileThresholds } from './risk-classifier';
import { parseFloodApi } from './schema';

class ApiError extends Error {
  constructor(message: string, readonly code?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    if (response.status === 429) throw new ApiError('API đang giới hạn tốc độ. Vui lòng thử lại sau.', 429);
    if (response.status >= 500) throw new ApiError('Máy chủ dữ liệu đang gặp sự cố.', response.status);
    throw new ApiError(`API trả về lỗi HTTP ${response.status}.`, response.status);
  }
  return response.json() as Promise<unknown>;
}

export async function geocode(query: string, signal?: AbortSignal): Promise<Location[]> {
  const value = query.trim();
  if (!value) return [];
  const raw = await fetchJson(
    `${GEOCODING_API}?name=${encodeURIComponent(value)}&count=5&language=vi&format=json`,
    signal,
  );
  if (!raw || typeof raw !== 'object') throw new Error('Dữ liệu tìm kiếm địa điểm không hợp lệ.');

  const results = 'results' in raw && Array.isArray(raw.results) ? raw.results : [];
  return results
    .filter((item): item is { id: number; name: string; latitude: number; longitude: number; country?: string } => {
      if (!item || typeof item !== 'object') return false;
      const value = item as Record<string, unknown>;
      return typeof value.id === 'number' && typeof value.name === 'string' &&
        typeof value.latitude === 'number' && typeof value.longitude === 'number';
    })
    .filter((item) => {
      try {
        validateCoordinates(item.latitude, item.longitude);
        return true;
      } catch {
        return false;
      }
    })
    .map((item) => {
      const now = new Date().toISOString();
      return {
        id: `geo-${item.id}`,
        name: [item.name, item.country].filter(Boolean).join(', ').slice(0, 80),
        latitude: item.latitude,
        longitude: item.longitude,
        notificationsEnabled: false,
        createdAt: now,
        updatedAt: now,
      };
    });
}

export async function fetchFlood(location: Location, signal?: AbortSignal): Promise<FloodObservation> {
  validateCoordinates(location.latitude, location.longitude);
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    daily: 'river_discharge',
    forecast_days: '7',
    timezone: 'auto',
  });

  const data = parseFloodApi(await fetchJson(`${FLOOD_API}?${params}`, signal));
  if (!data.daily) throw new Error('API không trả về khối dữ liệu daily.');

  const dates = data.daily.time;
  const values = data.daily.river_discharge ?? [];
  if (dates.length !== values.length) {
    throw new Error('Dữ liệu API không nhất quán: time và river_discharge khác độ dài.');
  }

  const forecast: FloodPoint[] = dates.map((date, index) => ({
    date,
    discharge: values[index] ?? undefined,
  }));
  const clean = forecast
    .map((point) => point.discharge)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  const thresholds = percentileThresholds(clean);
  const latestForecast = forecast.find((point) => point.discharge !== undefined);
  const classification = thresholds
    ? classifyRisk(latestForecast?.discharge, thresholds)
    : classifyRisk(undefined, { watch: 0, warning: 0, danger: 0 });

  return {
    locationId: location.id,
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: data.timezone ?? 'UTC',
    fetchedAt: new Date().toISOString(),
    sourceUpdatedAt: latestForecast?.date,
    currentDischarge: latestForecast?.discharge,
    forecast,
    risk: { ...classification, label: RISK_LABELS[classification.level] },
  };
}

export { ApiError };
