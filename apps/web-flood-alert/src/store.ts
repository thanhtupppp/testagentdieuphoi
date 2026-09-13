import { create } from 'zustand';
import type { Alert } from './types/alert';
import type { Sensor } from './types/sensor';
export type TelemetryPoint = { timestamp: number; waterCm: number; rainMm: number };
type State = { sensors: Record<string, Sensor>; alerts: Alert[]; history: Record<string, TelemetryPoint[]>; upsertSensor: (sensor: Sensor) => void; addAlert: (alert: Alert) => void; addTelemetry: (sensorId: string, point: TelemetryPoint) => void };
export const useFloodStore = create<State>((set) => ({ sensors: {}, alerts: [], history: {}, upsertSensor: (sensor) => set((s) => ({ sensors: { ...s.sensors, [sensor.id]: sensor } })), addAlert: (alert) => set((s) => ({ alerts: [alert, ...s.alerts.filter(a => a.id !== alert.id)].slice(0, 100) })), addTelemetry: (sensorId, point) => set((s) => ({ history: { ...s.history, [sensorId]: [...(s.history[sensorId] ?? []), point].slice(-288) } })) }));
