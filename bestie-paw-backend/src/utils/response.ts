import { Response } from 'express';

export const sendSuccess = <T>(res: Response, data: T, status = 200) =>
  res.status(status).json({ success: true, data });

export const sendError = (res: Response, code: string, message: string, status = 400) =>
  res.status(status).json({ success: false, error: { code, message } });
