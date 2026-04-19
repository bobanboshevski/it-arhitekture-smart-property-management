import {Request, Response, NextFunction} from 'express';
import {bookingGrpcService} from '../services/booking.grpc.service';

interface IdParam {
    id: string;
}

interface RoomIdParam {
    roomId: string;
}

// POST /m/bookings
export async function createBooking(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const {roomId, guestName, startDate, endDate} = req.body;
        const booking = await bookingGrpcService.createBooking({
            roomId,
            guestName,
            startDate,
            endDate,
        });
        res.status(201).json(booking);
    } catch (err: any) {
        next(mapGrpcError(err));
    }
}

// GET /m/bookings/:id
export async function getBooking(
    req: Request<IdParam>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const booking = await bookingGrpcService.getBooking(req.params.id);
        res.json(booking);
    } catch (err: any) {
        next(mapGrpcError(err));
    }
}

// DELETE /m/bookings/:id — cancel booking
export async function cancelBooking(
    req: Request<IdParam>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        await bookingGrpcService.deleteBooking(req.params.id);
        res.status(204).send();
    } catch (err: any) {
        next(mapGrpcError(err));
    }
}

// GET /m/bookings/room/:roomId
export async function getBookingsByRoom(
    req: Request<RoomIdParam>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const result = await bookingGrpcService.getBookingsByRoom(
            req.params.roomId,
        );
        res.json(result);
    } catch (err: any) {
        next(mapGrpcError(err));
    }
}

function mapGrpcError(err: any): Error & { statusCode: number } {
    const code = err?.code;
    const message = err?.details ?? err?.message ?? 'Service error';
    const e = new Error(message) as Error & { statusCode: number };
    e.statusCode = code === 5 ? 404 : code === 3 ? 400 : 500;
    return e;
}