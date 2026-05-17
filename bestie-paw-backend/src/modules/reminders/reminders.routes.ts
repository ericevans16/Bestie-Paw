import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import {
  createReminderHandler,
  deleteReminderHandler,
  listRemindersHandler,
  updateReminderHandler
} from './reminders.controller';

const router = Router({ mergeParams: true });

/**
 * GET /api/pets/:petId/reminders
 * List reminders for a pet. Auth: yes.
 */
router.get('/', authMiddleware, listRemindersHandler);

/**
 * POST /api/pets/:petId/reminders
 * Create a reminder. Auth: yes.
 */
router.post('/', authMiddleware, createReminderHandler);

/**
 * PATCH /api/pets/:petId/reminders/:reminderId
 * Update a reminder. Auth: yes.
 */
router.patch('/:reminderId', authMiddleware, updateReminderHandler);

/**
 * DELETE /api/pets/:petId/reminders/:reminderId
 * Delete a reminder. Auth: yes.
 */
router.delete('/:reminderId', authMiddleware, deleteReminderHandler);

export default router;
