export const isLatitude = (v:number) => Number.isFinite(v) && v >= -90 && v <= 90;
export const isLongitude = (v:number) => Number.isFinite(v) && v >= -180 && v <= 180;
export const validateCoordinates = (lat:number, lon:number) => { if(!isLatitude(lat)) throw new Error('Vĩ độ phải nằm trong [-90, 90].'); if(!isLongitude(lon)) throw new Error('Kinh độ phải nằm trong [-180, 180].'); return true; };
export const toFiniteNumber = (v:unknown): number|undefined => typeof v === 'number' && Number.isFinite(v) ? v : undefined;
