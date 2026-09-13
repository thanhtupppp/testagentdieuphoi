import type { Sensor } from '../types/sensor';
import { classifyAlert } from '../services/alert.service';

const tone: Record<string, string> = { normal: 'text-emerald-400', warning: 'text-amber-400', danger: 'text-orange-400', critical: 'text-red-400' };

export function SensorCard({ sensor }: { sensor: Sensor }) {
  const level = classifyAlert(sensor.waterCm ?? 0, 0, sensor.rainMm ?? 0);
  return <article className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3"><div><h3 className="font-medium">{sensor.name}</h3><p className="text-xs text-slate-500">{sensor.zoneId} · {sensor.id}</p></div><span className={`text-xs font-semibold uppercase ${tone[level]}`}>● {sensor.status}</span></div>
    <div className="mt-4 flex items-end gap-2"><span className="text-3xl font-bold">{sensor.waterCm ?? '—'}</span><span className="pb-1 text-sm text-slate-400">cm</span></div>
    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400"><span>Mưa <b className="text-slate-200">{sensor.rainMm ?? '—'} mm</b></span><span>Pin <b className="text-slate-200">{sensor.batteryPct ?? '—'}%</b></span></div>
  </article>;
}
