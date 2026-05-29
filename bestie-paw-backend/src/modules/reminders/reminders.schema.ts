import { z } from 'zod';

export const reminderTypeEnum = z.enum(['VACCINE', 'CHECKUP', 'MEDICATION', 'DEWORMING', 'OTHER']);

export const dateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: 'Invalid date'
});

export const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: reminderTypeEnum,
  dueDate: dateString.refine((value) => new Date(value) > new Date(), {
    message: 'dueDate must be in the future'
  })
});

export const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: reminderTypeEnum.optional(),
  dueDate: dateString.optional()
});
