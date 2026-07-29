import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

interface ErrorResponse {
  status: 'error';
  statusCode: number;
  message: string;
  code?: string;
  errors?: Array<{ field: string; message: string }>;
  stack?: string;
}

const isProduction = process.env.NODE_ENV === 'production';

function mapPrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
  switch (error.code) {
    case 'P2002': {
      const target = Array.isArray(error.meta?.target)
        ? (error.meta?.target as string[]).join(',')
        : String(error.meta?.target ?? '');

      if (target.includes('login')) {
        return AppError.conflict('Bu login band');
      }
      return AppError.conflict('Bu ma\'lumot allaqachon mavjud');
    }
    case 'P2025':
      return AppError.notFound('Ma\'lumot topilmadi');
    case 'P2003':
      return AppError.badRequest('Bog\'liq ma\'lumot topilmadi');
    case 'P2014':
      return AppError.badRequest('Noto\'g\'ri ma\'lumotlar bog\'lanishi');
    default:
      return new AppError('Ma\'lumotlar bazasi xatosi', 500, error.code);
  }
}

function buildResponse(
  statusCode: number,
  message: string,
  options?: {
    code?: string;
    errors?: Array<{ field: string; message: string }>;
    stack?: string;
  }
): ErrorResponse {
  const body: ErrorResponse = {
    status: 'error',
    statusCode,
    message,
  };

  if (options?.code) body.code = options.code;
  if (options?.errors) body.errors = options.errors;
  if (!isProduction && options?.stack) body.stack = options.stack;

  return body;
}

/**
 * Global Express error handler (4 parametrli).
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      buildResponse(err.statusCode, err.message, {
        code: err.code,
        stack: err.stack,
      })
    );
  }

  if (err instanceof ZodError) {
    return res.status(400).json(
      buildResponse(400, 'Validatsiya xatosi', {
        code: 'VALIDATION_ERROR',
        errors: err.errors.map((issue) => ({
          field: issue.path.join('.') || 'root',
          message: issue.message,
        })),
        stack: err.stack,
      })
    );
  }

  if (err instanceof TokenExpiredError) {
    return res.status(401).json(
      buildResponse(401, 'Autentifikatsiya muddati tugagan', {
        code: 'TOKEN_EXPIRED',
        stack: err.stack,
      })
    );
  }

  if (err instanceof JsonWebTokenError) {
    return res.status(401).json(
      buildResponse(401, 'Autentifikatsiya muvaffaqiyatsiz', {
        code: 'INVALID_TOKEN',
        stack: err.stack,
      })
    );
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = mapPrismaError(err);
    if (!isProduction) {
      console.error('[PrismaError]', { code: err.code, meta: err.meta });
    }
    return res.status(mapped.statusCode).json(
      buildResponse(mapped.statusCode, mapped.message, {
        code: mapped.code ?? err.code,
        stack: err.stack,
      })
    );
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json(
      buildResponse(400, 'Noto\'g\'ri so\'rov', {
        code: 'PRISMA_VALIDATION',
        stack: err.stack,
      })
    );
  }

  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json(
      buildResponse(403, isProduction ? 'Ruxsat rad etildi' : err.message, {
        code: 'CORS_FORBIDDEN',
        stack: err.stack,
      })
    );
  }

  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json(
      buildResponse(400, 'JSON formati noto\'g\'ri', {
        code: 'INVALID_JSON',
        stack: err.stack,
      })
    );
  }

  console.error('[UnhandledError]', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  return res.status(500).json(
    buildResponse(500, isProduction ? 'Ichki server xatosi' : err.message, {
      code: 'INTERNAL_ERROR',
      stack: err.stack,
    })
  );
}
