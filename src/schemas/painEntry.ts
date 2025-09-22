import { z } from 'zod';

export const PainEntrySchema = z.object({
  id: z.string().uuid().optional(),
  intensity: z.number().min(0).max(10),
  location: z.string().optional(),
  description: z.string().optional(),
  timestamp: z.string().datetime(),
});

export type PainEntry = z.infer<typeof PainEntrySchema>;

export default PainEntrySchema;
