import { useFloodStore } from '../store';
export const useSensorData = () => Object.values(useFloodStore(s=>s.sensors));
