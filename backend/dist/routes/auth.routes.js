"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_schema_1 = require("../schemas/auth.schema");
const auth_service_1 = require("../services/auth.service");
const router = (0, express_1.Router)();
/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res, next) => {
    try {
        // Validate input
        const { email, password } = auth_schema_1.loginSchema.parse(req.body);
        // Authenticate user
        const result = await auth_service_1.AuthService.login(email, password);
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
    }
    catch (err) {
        next(err);
    }
});
/**
 * GET /api/auth/me
 * Get current user info (protected endpoint)
 */
router.get('/me', async (req, res, next) => {
    try {
        if (!req.user) {
            const error = new Error('Not authenticated');
            error.statusCode = 401;
            error.code = 'UNAUTHORIZED';
            throw error;
        }
        res.json({
            success: true,
            data: req.user,
        });
    }
    catch (err) {
        next(err);
    }
});
/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', (_req, res, _next) => {
    res.clearCookie('refreshToken');
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map