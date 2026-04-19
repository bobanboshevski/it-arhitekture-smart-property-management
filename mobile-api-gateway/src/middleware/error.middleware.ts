import {Request, Response, NextFunction} from 'express';

export interface AppError extends Error {
    statusCode?: number;
}

export function errorMiddleware(
    err: AppError,
    req: Request,
    res: Response,
    _next: NextFunction,
): void {
    const status = err.statusCode ?? 500;
    const message = err.message ?? 'Internal Server Error';

    console.error(`[ERROR] ${req.method} ${req.url} → ${status}: ${message}`);

    res.status(status).json({
        statusCode: status,
        message,
        path: req.url,
        timestamp: new Date().toISOString(),
    });
}