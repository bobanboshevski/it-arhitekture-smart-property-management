import express, {Application} from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import {bookingRoutes} from './routes/booking.routes';
import {roomRoutes} from './routes/room.routes';
import {pricingRoutes} from './routes/pricing.routes';
import {errorMiddleware} from './middleware/error.middleware';

export function createApp(): Application {
    const app = express();

    // Security & parsing
    app.use(helmet());
    app.use(cors());
    app.use(express.json());

    // Logging
    app.use(morgan('[:date[iso]] :method :url :status :response-time ms'));

    // Health check
    app.get('/health', (_req, res) => {
        res.json({status: 'ok', gateway: 'mobile', timestamp: new Date().toISOString()});
    });

    // Mobile routes — all prefixed with /m
    app.use('/m/bookings', bookingRoutes());
    app.use('/m/rooms', roomRoutes());
    app.use('/m/pricing', pricingRoutes());

    // Global error handler
    app.use(errorMiddleware);

    return app;
}