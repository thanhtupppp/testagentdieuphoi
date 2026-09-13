import { useEffect, useMemo, useState } from 'react';
import { createMqttClient, telemetryWildcard } from '../services/mqtt.service';
import { useFloodStore } from '../store';

export function useMQTT() {
  const [connected, setConnected] = useState(false);
  const upsert = useFloodStore(s => s.upsertSensor);
  const addTelemetry = useFloodStore(s => s.addTelemetry);
  const topic = useMemo(() => telemetryWildcard(), []);
  useEffect(() => {
    const client = createMqttClient();
    const onConnect = () => { setConnected(true); client.subscribe(topic); };
    const onClose = () => setConnected(false);
    client.on('connect', onConnect); client.on('reconnect', () => setConnected(false)); client.on('close', onClose); client.on('offline', onClose);
    client.on('message', (rawTopic, payload) => {
      const parts = rawTopic.split('/'); if (parts.length !== 4) return;
      const [, zoneId, nodeId, metric] = parts; const value = Number(payload.toString()); if (!Number.isFinite(value)) return;
      const sensor = useFloodStore.getState().sensors[nodeId]; if (!sensor) return;
      const next = { ...sensor, zoneId, updatedAt: new Date().toISOString() };
      if (metric === 'water_cm') next.waterCm = value; else if (metric === 'rain_mm') next.rainMm = value; else if (metric === 'battery_pct') next.batteryPct = Math.max(0, Math.min(100, value)); else if (metric === 'status') next.status = payload.toString() === 'online' ? 'online' : 'offline'; else return;
      upsert(next); if (metric === 'water_cm' || metric === 'rain_mm') addTelemetry(nodeId, { timestamp: Date.now(), waterCm: next.waterCm ?? 0, rainMm: next.rainMm ?? 0 });
    });
    return () => { client.removeAllListeners(); client.end(true); setConnected(false); };
  }, [topic, upsert, addTelemetry]);
  return { connected };
}
