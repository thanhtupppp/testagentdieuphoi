import type { Sensor } from '../types/sensor';
import { SensorCard } from './SensorCard';
export function SensorList({ sensors }: { sensors: Sensor[] }) { return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{sensors.map(sensor => <SensorCard key={sensor.id} sensor={sensor} />)}</div>; }
