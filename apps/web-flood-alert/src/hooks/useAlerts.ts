import { useMemo } from 'react';
import { useFloodStore } from '../store';
import { classifyAlert } from '../services/alert.service';
export const useAlerts = () => { const sensors = useFloodStore(s => s.sensors); const history = useFloodStore(s => s.history); return useMemo(() => Object.values(sensors).map(sensor => { const points = history[sensor.id] ?? []; const previous = points.at(-2); const latest = points.at(-1); const minutes = previous && latest ? Math.max((latest.timestamp - previous.timestamp) / 60000, 1 / 60) : 1; const slope = previous && latest ? (latest.waterCm - previous.waterCm) / minutes : 0; return { sensor, slope, level: classifyAlert(sensor.waterCm ?? 0, slope, sensor.rainMm ?? 0) }; }).filter(x => x.level !== 'normal'), [sensors, history]); };
