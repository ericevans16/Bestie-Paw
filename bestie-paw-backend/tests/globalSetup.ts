import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

export default async () => {
  dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
  console.log('\\nRunning test database migration...');
  try {
    execSync('npx prisma migrate deploy', { env: { ...process.env, PATH: process.env.PATH }, stdio: 'inherit' });
  } catch (error) {
    console.error('Migration failed, fallback to db push...', error);
    execSync('npx prisma db push', { env: { ...process.env, PATH: process.env.PATH }, stdio: 'inherit' });
  }
};
