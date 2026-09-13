import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Sensor } from '../types/sensor';
import { classifyAlert } from '../services/alert.service';

function FitSensors({ sensors }: { sensors: Sensor[] }) { const map = useMap(); if (sensors.length) { const bounds = sensors.map(s => [s.lat, s.lng] as [number, number]); map.fitBounds(bounds, { padding: [24, 24], maxZoom: 13 }); } return null; }
export function Map({ sensors }: { sensors: Sensor[] }) { const center: [number, number] = sensors[0] ? [sensors[0].lat, sensors[0].lng] : [10.78, 106.69]; return <div className="h-[360px] overflow-hidden rounded-xl border border-slate-800"><MapContainer center={center} zoom={11} scrollWheelZoom className="h-full w-full"><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><FitSensors sensors={sensors} />{sensors.map(s => { const level = classifyAlert(s.waterCm ?? 0, 0, s.rainMm ?? 0); return <CircleMarker key={s.id} center={[s.lat, s.lng]} radius={Math.max(8, Math.min(20, 8 + (s.waterCm ?? 0) / 20))} pathOptions={{ className: `sensor-level-${level}`, fillOpacity: .75 }}><Popup><b>{s.name}</b><br />Mực nước: {s.waterCm ?? '—'} cm<br />Mưa: {s.rainMm ?? '—'} mm<br />Trạng thái: {s.status}</Popup></CircleMarker>; })}</MapContainer></div>; }
