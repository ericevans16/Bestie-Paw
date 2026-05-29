import cron from 'node-cron';
import { prisma } from '../../utils/prisma';
import { sendReminderEmail } from '../../utils/mailer';
import { logger } from '../../utils/logger';

export const startReminderCron = () => {
  let running = false;

  const task = cron.schedule('0 8 * * *', async () => {
    if (running) return;
    running = true;
    try {
      const now = new Date();
      const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const reminders = await prisma.reminder.findMany({
        where: { notified: false, dueDate: { gte: now, lte: nextDay } },
        include: { pet: { include: { owner: true } } }
      });

      const results = await Promise.allSettled(
        reminders.map((r) =>
          sendReminderEmail(r.pet.owner.email, r.pet.name, r.title, r.dueDate)
            .then(() => r.id)
        )
      );

      const successIds = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
        .map((r) => r.value);

      if (successIds.length > 0) {
        await prisma.reminder.updateMany({
          where: { id: { in: successIds } },
          data: { notified: true }
        });
      }

      const failCount = results.filter((r) => r.status === 'rejected').length;
      if (failCount > 0) logger.error(`${failCount} reminder email(s) failed`);
    } finally {
      running = false;
    }
  });

  task.start();
  return task;
};
