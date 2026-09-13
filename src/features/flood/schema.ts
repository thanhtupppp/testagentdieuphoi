import { z } from 'zod';

const DailySchema = z.object({
  time: z.array(z.string()),
  river_discharge: z.array(z.number().nullable()).optional(),
});

export const FloodApiSchema = z.object({
  timezone: z.string().optional(),
  daily: DailySchema.optional(),
});

export type FloodApiPayload = z.infer<typeof FloodApiSchema>;

export function parseFloodApi(input: unknown): FloodApiPayload {
  return FloodApiSchema.parse(input);
}
