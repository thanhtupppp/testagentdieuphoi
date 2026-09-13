import { z } from 'zod';
export const FloodApiSchema=z.object({timezone:z.string().optional(),daily:z.object({time:z.array(z.string()),river_discharge:z.array(z.number().nullable()).optional()}).optional()});
export type FloodApiPayload=z.infer<typeof FloodApiSchema>;
export const parseFloodApi=(input:unknown)=>FloodApiSchema.parse(input);
