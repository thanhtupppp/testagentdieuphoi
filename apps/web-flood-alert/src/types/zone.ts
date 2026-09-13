export type Zone = { id:string; name:string; risk:'low'|'medium'|'high'|'critical'; center:[number,number]; polygon?:[number,number][] };
