import type { AlertLevel } from '../types/alert';
export const classifyAlert = (waterCm:number, slopeCmPerMin=0, rainMm=0):AlertLevel => { const score = (waterCm > 200 ? 3 : waterCm >= 150 ? 2 : waterCm >= 100 ? 1 : 0) + (slopeCmPerMin >= 2 ? 1 : 0) + (rainMm >= 20 ? 1 : 0); return score >= 4 || waterCm > 200 ? 'critical' : score >= 2 ? 'danger' : score >= 1 ? 'warning' : 'normal'; };
