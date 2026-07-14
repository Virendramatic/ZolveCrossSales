import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    code?: string;
    details?: Record<string, string>;
}
export declare const errorHandler: (err: AppError, _req: Request, res: Response, _next: NextFunction) => Response;
//# sourceMappingURL=errorHandler.d.ts.map