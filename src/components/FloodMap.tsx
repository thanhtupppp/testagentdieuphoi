import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { FloodObservation, Location } from '../features/flood/types';

function FitBounds({ locations }: { locations: Location[] }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length === 1) {
      map.setView([locations[0].latitude, locations[0].longitude], 10);
    } else if (locations.length > 1) {
      map.fitBounds(locations.map((item) => [item.latitude, item.longitude] as [number, number]), { padding: [30, 30] });
    }
  }, [locations, map]);
  return null;
}

const radiusByRisk = { normal: 8, watch: 10, warning: 12, danger: 14 } as const;

export function FloodMap({
  locations,
  observations,
  onSelect,
}: {
  locations: Location[];
  observations: Record<string, FloodObservation>;
  onSelect: (id: string) => void;
}) {
  const center: [number, number] = locations[0] ? [locations[0].latitude, locations[0].longitude] : [10.78, 106.7];
  return (
    <MapContainer center={center} zoom={6} scrollWheelZoom className="map">
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds locations={locations} />
      {locations.map((location) => {
        const observation = observations[location.id];
        const level = observation?.risk.level ?? 'normal';
        return (
          <CircleMarker
            key={location.id}
            center={[location.latitude, location.longitude]}
            radius={radiusByRisk[level]}
            pathOptions={{ className: `risk-circle risk-${level}` }}
            eventHandlers={{ click: () => onSelect(location.id) }}
          >
            <Popup>
              <strong>{location.name}</strong><br />
              Tọa độ: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}<br />
              Mức: {observation?.risk.label ?? 'Chưa có dữ liệu'}<br />
              Cập nhật: {observation?.fetchedAt ? new Date(observation.fetchedAt).toLocaleString('vi-VN') : '—'}
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
