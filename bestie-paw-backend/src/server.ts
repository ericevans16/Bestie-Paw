import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { startReminderCron } from './modules/reminders/reminder.cron';

app.listen(env.PORT, () => {
  logger.info(`Bestie Paw API running on port ${env.PORT}`);
});

startReminderCron();
