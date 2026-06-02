import dotenv from 'dotenv';
import path from 'path';

// Ensure we load .env.test before anything else
dotenv.config({ path: path.resolve(__dirname, '../.env.test'), override: true });
