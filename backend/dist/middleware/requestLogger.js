"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const requestLogger = (req, _res, next) => {
    const start = Date.now();
    const originalSend = _res.send;
    console.log(`[REQUEST] ${req.method} ${req.url} (path: ${req.path}, originalUrl: ${req.originalUrl})`);
    _res.send = function (data) {
        const duration = Date.now() - start;
        console.log(`[RESPONSE] ${req.method} ${req.path} - ${_res.statusCode} (${duration}ms)`);
        return originalSend.call(this, data);
    };
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=requestLogger.js.map