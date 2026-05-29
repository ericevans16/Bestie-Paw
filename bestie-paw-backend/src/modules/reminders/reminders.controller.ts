import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import { createReminder, deleteReminder, listReminders, updateReminder } from './reminders.service';
import { createSchema, updateSchema } from './reminders.schema';

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
