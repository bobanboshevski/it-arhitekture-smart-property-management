import {Router} from 'express';
import {body, param} from 'express-validator';
import {validate} from '../middleware/validate.middleware';
import {
    createBooking,
    getBooking,
    cancelBooking,
    getBookingsByRoom,
} from '../controllers/booking.controller';

export function bookingRoutes(): Router {
    const router = Router();

    // POST /m/bookings
    router.post(
        '/',
        [
            body('roomId').isString().notEmpty().withMessage('roomId is required'),
            body('guestName').isString().notEmpty().withMessage('guestName is required'),
            body('startDate')
                .matches(/^\d{4}-\d{2}-\d{2}$/)
                .withMessage('startDate must be YYYY-MM-DD'),
            body('endDate')
                .matches(/^\d{4}-\d{2}-\d{2}$/)
                .withMessage('endDate must be YYYY-MM-DD'),
        ],
        validate,
        createBooking,
    );

    // GET /m/bookings/room/:roomId — must come before /:id
    router.get('/room/:roomId', getBookingsByRoom);

    // GET /m/bookings/:id
    router.get('/:id', getBooking);

    // DELETE /m/bookings/:id
    router.delete('/:id', cancelBooking);

    return router;
}