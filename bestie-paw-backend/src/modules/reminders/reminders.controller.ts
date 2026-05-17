import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess } from '../../utils/response';
import { createReminder, deleteReminder, listReminders, updateReminder } from './reminders.service';

const reminderTypeEnum = z.enum(['VACCINE', 'CHECKUP', 'MEDICATION', 'DEWORMING', 'OTHER']);
const dateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: 'Invalid date'
});

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: reminderTypeEnum,
  dueDate: dateString
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: reminderTypeEnum.optional(),
  dueDate: dateString.optional()
});

export const listRemindersHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const upcoming = req.query.upcoming === 'true';
    const data = await listReminders(req.user!.userId, req.params.petId, upcoming);
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const createReminderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const input = createSchema.parse(req.body);
    const data = await createReminder(req.user!.userId, req.params.petId, input);
    return sendSuccess(res, data, 201);
  } catch (err) {
    return next(err);
  }
};

export const updateReminderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const input = updateSchema.parse(req.body);
    const data = await updateReminder(
      req.user!.userId,
      req.params.petId,
      req.params.reminderId,
      input
    );
    return sendSuccess(res, data);
  } catch (err) {
    return next(err);
  }
};

export const deleteReminderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteReminder(req.user!.userId, req.params.petId, req.params.reminderId);
    return sendSuccess(res, { message: 'Reminder deleted' });
  } catch (err) {
    return next(err);
  }
};
