export type AlertLevel = 'normal' | 'warning' | 'danger' | 'critical';
export type Alert = { id:string; sensorId:string; zoneId:string; level:AlertLevel; waterCm:number; message:string; createdAt:string; acknowledged:boolean };
export const levelForWater = (cm:number):AlertLevel => cm > 200 ? 'critical' : cm >= 150 ? 'danger' : cm >= 100 ? 'warning' : 'normal';
