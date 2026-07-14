"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const lead_routes_1 = __importDefault(require("./routes/lead.routes"));
const comment_routes_1 = __importDefault(require("./routes/comment.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const bulk_routes_1 = __importDefault(require("./routes/bulk.routes"));
const education_loan_routes_1 = __importDefault(require("./routes/education-loan.routes"));
const document_routes_1 = __importDefault(require("./routes/document.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
    dotenv_1.default.config({ path: '.env.production' });
}
else {
    dotenv_1.default.config();
}
const app = (0, express_1.default)();
exports.app = app;
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
const PORT = process.env.PORT || 3000;
// CORS Configuration
const corsOptions = {
    origin: ['https://zolve-cross-sales-staging.web.app', 'http://localhost:5173', process.env.FRONTEND_URL].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
// Allow all origins in production (Vercel serverless)
if (process.env.VERCEL === '1') {
    corsOptions.origin = '*';
}
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(requestLogger_1.requestLogger);
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/leads', lead_routes_1.default);
app.use('/api/leads', comment_routes_1.default);
app.use('/api/leads', product_routes_1.default);
app.use('/api/leads', bulk_routes_1.default);
app.use('/api/comments', comment_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/loans', education_loan_routes_1.default);
app.use('/api', document_routes_1.default);
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Endpoint not found',
        },
    });
});
// Error handler (must be last)
app.use(errorHandler_1.errorHandler);
// Start server only if not in Vercel/serverless environment
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
    const server = app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    // Graceful shutdown
    process.on('SIGTERM', async () => {
        console.log('SIGTERM received, shutting down gracefully');
        server.close(() => {
            console.log('Server closed');
        });
        await prisma.$disconnect();
        process.exit(0);
    });
    process.on('SIGINT', async () => {
        console.log('SIGINT received, shutting down gracefully');
        server.close(() => {
            console.log('Server closed');
        });
        await prisma.$disconnect();
        process.exit(0);
    });
}
//# sourceMappingURL=index.js.map