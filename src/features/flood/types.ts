export type RiskLevel = 'normal' | 'watch' | 'warning' | 'danger';
export type Location = { id: string; name: string; latitude: number; longitude: number; notificationsEnabled: boolean; createdAt: string; updatedAt: string };
export type FloodPoint = { date: string; discharge?: number; p25?: number; p75?: number };
export type FloodObservation = { locationId: string; latitude: number; longitude: number; timezone: string; fetchedAt: string; sourceUpdatedAt?: string; currentDischarge?: number; forecast: FloodPoint[]; risk: { level: RiskLevel; label: string; estimated: boolean; reason: string } };
export type Thresholds = { watch: number; warning: number; danger: number; estimated?: boolean };
