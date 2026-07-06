import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, _res: Response, next: NextFunction): void => {
  const start = Date.now();
  const originalSend = _res.send;

  _res.send = function (data: unknown) {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${_res.statusCode} (${duration}ms)`);
    return originalSend.call(this, data);
  };

  next();
};
