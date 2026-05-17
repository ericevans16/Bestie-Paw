import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError } from 'jsonwebtoken';
import multer from 'multer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export class AppError extends Error {
  code: string;
  status: number;
  action?: string;

  constructor(code: string, message: string, status = 400, action?: string) {
    super(message);
    this.code = code;
    this.status = status;
    this.action = action;
  }
}

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    const fields = err.flatten().fieldErrors;
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request',
        fields
      }
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'Resource already exists'
      }
    });
  }

  if (err instanceof JsonWebTokenError) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid token'
      }
    });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message
      }
    });
  }

  if (err instanceof Error && err.message === 'Unsupported file type') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'UNSUPPORTED_FILE_TYPE',
        message: err.message
      }
    });
  }

  if (err instanceof AppError) {
    const errorPayload: { code: string; message: string; action?: string } = {
      code: err.code,
      message: err.message
    };

    if (err.action) {
      errorPayload.action = err.action;
    }

    return res.status(err.status).json({
      success: false,
      error: errorPayload
    });
  }

  logger.error('Unhandled error', err as Error);

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production' ? 'Internal server error' : (err as Error).message
    }
  });
};
