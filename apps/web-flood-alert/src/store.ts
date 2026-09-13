import { create } from 'zustand';
import type { Alert } from './types/alert';
import type { Sensor } from './types/sensor';

type State = { sensors: Record<string, Sensor>; alerts: Alert[]; upsertSensor: (sensor: Sensor) => void; addAlert: (alert: Alert) => void };
export const useFloodStore = create<State>((set) => ({ sensors: {}, alerts: [], upsertSensor: (sensor) => set((s) => ({ sensors: { ...s.sensors, [sensor.id]: sensor } })), addAlert: (alert) => set((s) => ({ alerts: [alert, ...s.alerts].slice(0, 100) })) }));
