import type { Sensor } from '../types/sensor';
export function SensorList({sensors}:{sensors:Sensor[]}){return <div className="space-y-2">{sensors.map(s=><div key={s.id} className="rounded-lg border border-slate-800 p-3"><div className="flex justify-between"><span>{s.name}</span><span>{s.waterCm ?? '—'} cm</span></div></div>)}</div>}
