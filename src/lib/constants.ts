import type { RiskLevel } from '../features/flood/types';

export const RISK_LABELS: Record<RiskLevel, string> = {
  normal: 'Bình thường',
  watch: 'Theo dõi',
  warning: 'Cảnh báo',
  danger: 'Nguy hiểm',
};

export const DEFAULT_POLL_MINUTES = 30;
export const STALE_DATA_MINUTES = 90;
export const FLOOD_API = 'https://flood-api.open-meteo.com/v1/flood';
export const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';
