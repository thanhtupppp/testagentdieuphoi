import type { RiskLevel, Thresholds } from './types';

export function classifyRisk(
  value: number | undefined,
  thresholds: Thresholds,
): { level: RiskLevel; estimated: boolean; reason: string } {
  if (value === undefined || !Number.isFinite(value)) {
    return {
      level: 'watch',
      estimated: true,
      reason: 'Chưa có lưu lượng để ước tính rủi ro; không được coi là an toàn.',
    };
  }

  const estimated = thresholds.estimated !== false;
  if (value >= thresholds.danger) return { level: 'danger', estimated, reason: `Lưu lượng ${value.toFixed(1)} vượt ngưỡng nguy hiểm.` };
  if (value >= thresholds.warning) return { level: 'warning', estimated, reason: `Lưu lượng ${value.toFixed(1)} vượt ngưỡng cảnh báo.` };
  if (value >= thresholds.watch) return { level: 'watch', estimated, reason: `Lưu lượng ${value.toFixed(1)} vượt ngưỡng theo dõi.` };
  return { level: 'normal', estimated, reason: 'Lưu lượng dưới ngưỡng theo dõi.' };
}

export function percentileThresholds(values: number[]): Thresholds | undefined {
  const clean = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!clean.length) return undefined;

  const quantile = (percentile: number) => clean[Math.min(clean.length - 1, Math.floor((clean.length - 1) * percentile))];
  const watch = quantile(0.9);
  const warning = quantile(0.98);
  return { watch, warning, danger: Math.max(warning, warning * 1.25), estimated: true };
}
