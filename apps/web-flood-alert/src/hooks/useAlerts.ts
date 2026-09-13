import { useMemo } from 'react';
import { useFloodStore } from '../store';
import { classifyAlert } from '../services/alert.service';
export const useAlerts = () => { const sensors=useFloodStore(s=>s.sensors); return useMemo(()=>Object.values(sensors).map(s=>({sensor:s,level:classifyAlert(s.waterCm??0,0,s.rainMm??0)})).filter(x=>x.level!=='normal'),[sensors]); };
