import { z } from 'zod';

export const healthTypeEnum = z.enum([
  'VACCINE',
  'CHECKUP',
  'MEDICATION',
  'SURGERY',
  'DEWORMING',
  'OTHER'
]);

const dateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: 'Invalid date'
});

export const healthCreateSchema = z.object({
  type: healthTypeEnum,
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  date: dateString,
  vetName: z.string().max(100).optional(),
  clinic: z.string().max(100).optional()
});

export const healthUpdateSchema = z.object({
  type: healthTypeEnum.optional(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  date: dateString.optional(),
  vetName: z.string().max(100).optional(),
  clinic: z.string().max(100).optional()
});

export type HealthCreateInput = z.infer<typeof healthCreateSchema>;
export type HealthUpdateInput = z.infer<typeof healthUpdateSchema>;
