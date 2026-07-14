"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const requestLogger = (req, _res, next) => {
    const start = Date.now();
    const originalSend = _res.send;
    _res.send = function (data) {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${_res.statusCode} (${duration}ms)`);
        return originalSend.call(this, data);
    };
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=requestLogger.js.map