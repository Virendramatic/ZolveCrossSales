import { Router, Request, Response, NextFunction } from 'express';
import { loginSchema } from '../schemas/auth.schema';
import { AuthService } from '../services/auth.service';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validate input
    const { email, password } = loginSchema.parse(req.body);

    // Authenticate user
    const result = await AuthService.login(email, password);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return response
    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Get current user info (protected endpoint)
 */
router.get(
  '/me',
  async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        const error = new Error('Not authenticated') as AppError;
        error.statusCode = 401;
        error.code = 'UNAUTHORIZED';
        throw error;
      }

      res.json({
        success: true,
        data: req.user,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post(
  '/logout',
  (_req: Request, res: Response, _next: NextFunction): void => {
    res.clearCookie('refreshToken');
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
);

export default router;
