"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const index_1 = require("../index");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
class AuthService {
    static async login(email, password) {
        // Find user by email
        const user = await index_1.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                passwordHash: true,
            },
        });
        if (!user) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            error.code = 'INVALID_CREDENTIALS';
            throw error;
        }
        // Check user status
        if (user.status !== 'ACTIVE') {
            const error = new Error('User account is not active');
            error.statusCode = 403;
            error.code = 'ACCOUNT_INACTIVE';
            throw error;
        }
        // Verify password
        const isPasswordValid = await (0, password_1.comparePassword)(password, user.passwordHash);
        if (!isPasswordValid) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            error.code = 'INVALID_CREDENTIALS';
            throw error;
        }
        // Generate tokens
        const accessToken = (0, jwt_1.generateAccessToken)({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        const refreshToken = (0, jwt_1.generateRefreshToken)({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        // Update last login
        await index_1.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map