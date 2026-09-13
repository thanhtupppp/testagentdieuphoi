import type { Alert } from '../types/alert';
export function AlertPanel({alerts}:{alerts:Alert[]}){return <section><h2 className="mb-2 font-semibold">Cảnh báo</h2>{alerts.length===0?<p className="text-sm text-slate-400">Không có cảnh báo.</p>:alerts.map(a=><div key={a.id}>{a.message}</div>)}</section>}
