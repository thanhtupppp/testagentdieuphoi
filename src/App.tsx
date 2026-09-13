import { useCallback, useEffect, useMemo, useState } from 'react';
import { FloodMap } from './components/FloodMap';
import { geocode } from './features/flood/api';
import { useFlood } from './features/flood/hooks/useFlood';
import type { FloodObservation, Location } from './features/flood/types';
import {
  loadDefaultLocationId,
  loadLocations,
  makeLocation,
  saveDefaultLocationId,
  saveLocations,
} from './features/locations/storage';
import { notifyRisk, requestNotificationPermission } from './features/notifications/notifications';
import { STALE_DATA_MINUTES } from './lib/constants';
import { formatTimestamp, isStale } from './lib/date-time';
import { validateCoordinates } from './lib/validation';
import './styles/app.css';

function RiskIcon({ level }: { level: FloodObservation['risk']['level'] }) {
  return <span aria-hidden="true">{level === 'danger' ? '⚠' : level === 'warning' ? '!' : level === 'watch' ? '◐' : '✓'}</span>;
}

function TrendChart({ forecast }: { forecast: FloodObservation['forecast'] }) {
  const points = forecast.filter((item) => item.discharge !== undefined);
  if (!points.length) return <p className="muted">Chưa đủ dữ liệu để vẽ xu hướng.</p>;
  const values = points.map((item) => item.discharge as number);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const path = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${100 - ((value - min) / range) * 90 - 5}`).join(' ');
  return (
    <div className="trend" aria-label="Biểu đồ xu hướng dự báo dòng chảy">
      <svg viewBox="0 0 100 100" role="img" aria-labelledby="trend-title">
        <title id="trend-title">Xu hướng lưu lượng dự báo</title>
        <polyline points={path} fill="none" stroke="currentColor" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="trend-labels"><span>{points[0].date}</span><span>{points[points.length - 1].date}</span></div>
    </div>
  );
}

function Dashboard({ location, onData, onNotify }: { location: Location; onData: (data: FloodObservation) => void; onNotify: (data: FloodObservation) => void }) {
  const { data, loading, error, refresh } = useFlood(location);
  useEffect(() => { if (data) onData(data); }, [data, onData]);
  const stale = data ? isStale(data.fetchedAt, STALE_DATA_MINUTES) : false;

  return (
    <section aria-labelledby="status-heading">
      <div className={`risk risk-${data?.risk.level ?? 'normal'}`}>
        <RiskIcon level={data?.risk.level ?? 'normal'} />
        <div>
          <h2 id="status-heading">{data?.risk.label ?? 'Chưa có dữ liệu'}</h2>
          <p>{data?.risk.reason ?? 'Đang chờ dữ liệu mô hình.'}</p>
          {data?.risk.estimated && <small>Ước tính tham khảo, không phải cảnh báo chính thức.</small>}
        </div>
      </div>
      {stale && <div className="warning" role="status">Dữ liệu có thể đã cũ (quá {STALE_DATA_MINUTES} phút). Không coi dữ liệu cũ là trạng thái an toàn.</div>}
      {loading && <div className="skeleton" aria-live="polite">Đang tải dữ liệu…</div>}
      {error && <div className="error" role="alert">{error}<button onClick={() => void refresh()}>Thử lại</button></div>}
      <div className="stats">
        <div><span>Dự báo ngày gần nhất</span><strong>{data?.currentDischarge !== undefined ? `${data.currentDischarge.toFixed(1)} m³/s` : '—'}</strong></div>
        <div><span>Thời điểm dữ liệu</span><strong>{data ? formatTimestamp(data.fetchedAt, data.timezone) : '—'}</strong></div>
        <div><span>Múi giờ</span><strong>{data?.timezone ?? '—'}</strong></div>
      </div>
      {data && <div>
        <h3>Dự báo 7 ngày</h3>
        <TrendChart forecast={data.forecast} />
        <div className="forecast">{data.forecast.map((point) => <div key={point.date}><b>{new Date(point.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}</b><span>{point.discharge !== undefined ? `${point.discharge.toFixed(1)} m³/s` : 'Không có dữ liệu'}</span></div>)}</div>
        <p className="muted">Nguồn cập nhật gần nhất: {data.sourceUpdatedAt ?? 'không xác định'}.</p>
        <button onClick={() => onNotify(data)} className="secondary">Gửi cập nhật thông báo</button>
      </div>}
    </section>
  );
}

export default function App() {
  const [locations, setLocations] = useState<Location[]>(loadLocations);
  const [selected, setSelected] = useState(() => loadDefaultLocationId() ?? loadLocations()[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState('');
  const [inputError, setInputError] = useState('');
  const [searchError, setSearchError] = useState('');
  const [geoError, setGeoError] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [searching, setSearching] = useState(false);
  const [observations, setObservations] = useState<Record<string, FloodObservation>>({});

  const updateLocations = useCallback((next: Location[]) => { setLocations(next); saveLocations(next); }, []);
  const selectLocation = useCallback((id: string) => { setSelected(id); saveDefaultLocationId(id || undefined); }, []);
  const add = useCallback((source: Location) => {
    const location = makeLocation(source.name, source.latitude, source.longitude);
    updateLocations([...locations, location]);
    selectLocation(location.id);
    setResults([]); setCoords(''); setInputError('');
  }, [locations, selectLocation, updateLocations]);

  const search = useCallback(async () => {
    setSearchError(''); setSearching(true);
    try {
      const found = await geocode(query);
      setResults(found);
      if (!found.length) setSearchError('Không tìm thấy địa điểm phù hợp.');
    } catch (error) {
      setResults([]); setSearchError(error instanceof Error ? error.message : 'Không thể tìm kiếm địa điểm.');
    } finally { setSearching(false); }
  }, [query]);

  const useCurrentLocation = useCallback(() => {
    setGeoError('');
    if (!('geolocation' in navigator)) { setGeoError('Trình duyệt không hỗ trợ định vị.'); return; }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          validateCoordinates(position.coords.latitude, position.coords.longitude);
          add({ id: '', name: 'Vị trí hiện tại', latitude: position.coords.latitude, longitude: position.coords.longitude, notificationsEnabled: false, createdAt: '', updatedAt: '' });
        } catch (error) { setGeoError(error instanceof Error ? error.message : 'Tọa độ vị trí hiện tại không hợp lệ.'); }
      },
      (error) => { setGeoError(error.code === error.PERMISSION_DENIED ? 'Bạn đã từ chối quyền vị trí.' : error.code === error.TIMEOUT ? 'Định vị hết thời gian chờ.' : 'Không thể xác định vị trí hiện tại.'); },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, [add]);

  const rename = useCallback((location: Location) => {
    const name = window.prompt('Tên mới', location.name)?.trim();
    if (!name) return;
    updateLocations(locations.map((item) => item.id === location.id ? { ...item, name: name.slice(0, 80), updatedAt: new Date().toISOString() } : item));
  }, [locations, updateLocations]);

  const remove = useCallback((id: string) => {
    const next = locations.filter((item) => item.id !== id);
    updateLocations(next);
    if (selected === id) selectLocation(next[0]?.id ?? '');
  }, [locations, selectLocation, selected, updateLocations]);

  const toggleNotifications = useCallback(async (location: Location) => {
    if (location.notificationsEnabled) {
      updateLocations(locations.map((item) => item.id === location.id ? { ...item, notificationsEnabled: false, updatedAt: new Date().toISOString() } : item));
      return;
    }
    const permission = await requestNotificationPermission();
    if (permission === 'granted') updateLocations(locations.map((item) => item.id === location.id ? { ...item, notificationsEnabled: true, updatedAt: new Date().toISOString() } : item));
  }, [locations, updateLocations]);

  const onData = useCallback((data: FloodObservation) => setObservations((current) => ({ ...current, [data.locationId]: data })), []);
  const onNotify = useCallback(async (data: FloodObservation) => {
    const location = locations.find((item) => item.id === data.locationId);
    if (location?.notificationsEnabled) await notifyRisk(location.id, location.name, data.risk.level);
  }, [locations]);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
    void navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  }, []);

  const selectedLocation = locations.find((item) => item.id === selected);
  const mapLocations = useMemo(() => locations, [locations]);

  return <main>
    <header><div><span className="eyebrow">FLOOD WATCH</span><h1>Theo dõi lũ</h1><p>Dashboard dòng chảy theo mô hình Open-Meteo.</p></div><button onClick={useCurrentLocation}>Dùng vị trí hiện tại</button></header>
    {geoError && <div className="error" role="alert">{geoError}</div>}
    <div className="notice"><strong>Lưu ý:</strong> Dữ liệu là mô hình tham khảo, không phải cảnh báo thiên tai chính thức. Luôn tuân theo hướng dẫn của cơ quan chức năng địa phương. Flood API có độ phân giải không gian khoảng 5 km.</div>
    <section className="card"><h2>Điểm theo dõi</h2>
      <form onSubmit={(event) => { event.preventDefault(); void search(); }}><label htmlFor="place">Địa điểm</label><div className="row"><input id="place" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ví dụ: Đồng Nai" /><button disabled={searching}>{searching ? 'Đang tìm…' : 'Tìm kiếm'}</button></div></form>
      {searchError && <div className="error" role="alert">{searchError}</div>}
      {results.length > 0 && <div className="results" aria-label="Kết quả địa điểm">{results.map((result) => <button key={result.id} onClick={() => add(result)}>{result.name} ({result.latitude.toFixed(3)}, {result.longitude.toFixed(3)})</button>)}</div>}
      <div className="row coordinate-row"><label htmlFor="coords">Tọa độ</label><input id="coords" value={coords} onChange={(event) => { setCoords(event.target.value); setInputError(''); }} placeholder="10.95, 106.82" aria-invalid={Boolean(inputError)} /><button type="button" onClick={() => { const [latitude, longitude] = coords.split(',').map(Number); try { validateCoordinates(latitude, longitude); add({ id: '', name: 'Điểm tọa độ', latitude, longitude, notificationsEnabled: false, createdAt: '', updatedAt: '' }); } catch (error) { setInputError(error instanceof Error ? error.message : 'Tọa độ không hợp lệ.'); } }}>Thêm</button></div>
      {inputError && <div className="error" role="alert">{inputError}</div>}
      <div className="locations">{locations.map((location) => <div className={location.id === selected ? 'location selected' : 'location'} key={location.id}><button className="link" onClick={() => selectLocation(location.id)}>{location.name}</button><span>{location.latitude.toFixed(3)}, {location.longitude.toFixed(3)}</span><button onClick={() => rename(location)} aria-label={`Đổi tên ${location.name}`}>Đổi tên</button><button onClick={() => remove(location.id)} aria-label={`Xóa ${location.name}`}>Xóa</button><button onClick={() => void toggleNotifications(location)} aria-label={`${location.notificationsEnabled ? 'Tắt' : 'Bật'} thông báo cho ${location.name}`}>{location.notificationsEnabled ? '🔔' : '🔕'}</button></div>)}</div>
    </section>
    {selectedLocation ? <section className="card"><Dashboard location={selectedLocation} onData={onData} onNotify={onNotify} /></section> : <section className="empty card"><h2>Chưa có điểm theo dõi</h2><p>Thêm một địa điểm hoặc dùng vị trí hiện tại để bắt đầu.</p></section>}
    <section className="card"><h2>Bản đồ</h2><FloodMap locations={mapLocations} observations={observations} onSelect={selectLocation} /></section>
    <footer>Nguồn: Open-Meteo / dữ liệu Flood API dựa trên GloFAS. Bản đồ © OpenStreetMap contributors. Thông báo nền yêu cầu HTTPS hoặc localhost.</footer>
  </main>;
}
