import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodEffects, ZodError, ZodTypeAny } from 'zod';

type ValidationSource = 'body' | 'query' | 'params';
type ZodSchema = AnyZodObject | ZodEffects<AnyZodObject> | ZodTypeAny;

function formatZodErrors(error: ZodError) {
  return error.errors.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
  }));
}

/**
 * Universal Zod validation middleware.
 * validate(schema) — body
 * validate(schema, 'params') — URL params
 */
export function validate(schema: ZodSchema, source: ValidationSource = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Validatsiya xatosi',
        errors: formatZodErrors(result.error),
      });
      return;
    }

    (req as Request & Record<string, unknown>)[source] = result.data;
    next();
  };
}
