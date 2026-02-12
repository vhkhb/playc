import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Middleware that runs an array of express-validator validation chains and,
 * if any of them fail, returns a 400 response with a structured error list.
 *
 * Usage:
 * ```ts
 * router.post(
 *   '/register',
 *   validate([
 *     body('email').isEmail().withMessage('Valid email is required'),
 *     body('password').isLength({ min: 6 }),
 *   ]),
 *   registerController
 * );
 * ```
 */
export const validate = (validations: ValidationChain[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      next();
      return;
    }

    res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((err) => ({
        field: (err as any).path || (err as any).param,
        message: err.msg,
      })),
    });
  };
};
