import { describe, expect, it } from 'vitest';
import { classifyRisk, percentileThresholds } from '../features/flood/risk-classifier';
import { validateCoordinates } from '../lib/validation';
import { isStale } from '../lib/date-time';

describe('risk classifier', () => {
  const thresholds = { watch: 100, warning: 200, danger: 300, estimated: true };

  it('classifies every boundary', () => {
    expect(classifyRisk(99.99, thresholds).level).toBe('normal');
    expect(classifyRisk(100, thresholds).level).toBe('watch');
    expect(classifyRisk(199.99, thresholds).level).toBe('watch');
    expect(classifyRisk(200, thresholds).level).toBe('warning');
    expect(classifyRisk(299.99, thresholds).level).toBe('warning');
    expect(classifyRisk(300, thresholds).level).toBe('danger');
  });

  it('does not call missing data safe', () => {
    const result = classifyRisk(undefined, thresholds);
    expect(result.reason).toContain('không được coi là an toàn');
  });

  it('creates transparent estimated percentile thresholds', () => {
    expect(percentileThresholds([10, 20, 30])?.estimated).toBe(true);
    expect(percentileThresholds([])).toBeUndefined();
  });
});

describe('coordinates', () => {
  it('accepts valid edges', () => expect(validateCoordinates(90, -180)).toBe(true));
  it('rejects invalid latitude', () => expect(() => validateCoordinates(91, 0)).toThrow());
  it('rejects invalid longitude', () => expect(() => validateCoordinates(0, 181)).toThrow());
});

describe('stale data', () => {
  it('flags data older than the configured limit', () => {
    expect(isStale(new Date(Date.now() - 91 * 60_000).toISOString(), 90)).toBe(true);
    expect(isStale(new Date(Date.now() - 30 * 60_000).toISOString(), 90)).toBe(false);
  });
});
