export type SensorStatus = 'online' | 'offline' | 'unknown';
export type Sensor = { id:string; name:string; zoneId:string; status:SensorStatus; waterCm:number|null; rainMm:number|null; batteryPct:number|null; lat:number; lng:number; updatedAt:string };
