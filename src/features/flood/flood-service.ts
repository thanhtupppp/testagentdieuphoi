import type { Location } from './types'; import { fetchFlood } from './api'; export const getFloodObservation=(location:Location,signal?:AbortSignal)=>fetchFlood(location,signal);
