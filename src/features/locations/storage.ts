import type { Location } from '../flood/types';
const KEY='flood-alert.locations.v1';
const safe = (raw:string|null):Location[] => { try { const x=JSON.parse(raw??'null'); return Array.isArray(x)?x.filter((v):v is Location=>v&&typeof v.id==='string'&&typeof v.name==='string'&&typeof v.latitude==='number'&&typeof v.longitude==='number'):[]; } catch { return []; } };
export const loadLocations=():Location[]=>safe(localStorage.getItem(KEY));
export const saveLocations=(locations:Location[])=>localStorage.setItem(KEY,JSON.stringify(locations));
export const makeLocation=(name:string,latitude:number,longitude:number):Location=>{const now=new Date().toISOString();return{id:crypto.randomUUID(),name:name.trim().slice(0,80),latitude,longitude,notificationsEnabled:false,createdAt:now,updatedAt:now};};
