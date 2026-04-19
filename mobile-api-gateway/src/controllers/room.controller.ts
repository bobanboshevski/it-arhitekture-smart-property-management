import {Request, Response, NextFunction} from 'express';
import {propertyHttpService} from '../services/property.http.service';
import {pricingHttpService} from '../services/pricing.http.service';
import {analyticsGrpcService} from '../services/analytics.grpc.service';

interface IdParam {
    id: string;
}

// GET /m/rooms — lean list for mobile browse screen
export async function getAllRooms(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const rooms = await propertyHttpService.getAllRooms();

        // Mobile only needs id, name, capacity — strip everything else
        const lean = rooms.map((r: any) => ({
            id: r.id,
            name: r.name,
            capacity: r.capacity,
            propertyId: r.propertyId,
        }));

        res.json(lean);
    } catch (err: any) {
        next(mapHttpError(err));
    }
}

// GET /m/rooms/:id — room detail with price merged in one call
export async function getRoomDetail(
    req: Request<IdParam>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const {id} = req.params;

        // Parallel fetch — price failure is non-fatal for mobile
        const [roomResult, pricingResult] = await Promise.allSettled([
            propertyHttpService.getRoomById(id),
            pricingHttpService.getRoomPrice(id),
        ]);

        if (roomResult.status === 'rejected') {
            const e = new Error('Room not found') as any;
            e.statusCode = 404;
            return next(e);
        }

        const room = roomResult.value;
        const pricing =
            pricingResult.status === 'fulfilled' ? pricingResult.value : null;

        // Mobile-optimised response shape
        res.json({
            id: room.id,
            name: room.name,
            capacity: room.capacity,
            price: pricing
                ? {
                    base: pricing.basePrice,
                    adjusted: pricing.adjustedPrice,
                }
                : null,
        });
    } catch (err: any) {
        next(mapHttpError(err));
    }
}

// GET /m/rooms/:id/availability
export async function getRoomAvailability(
    req: Request<IdParam>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const exists = await propertyHttpService.checkRoomExists(req.params.id);
        res.json({roomId: req.params.id, available: exists === true});
    } catch (err: any) {
        next(mapHttpError(err));
    }
}

// GET /m/properties — lean property list for mobile
export async function getProperties(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const properties = await propertyHttpService.getAllProperties();

        const lean = properties.map((p: any) => ({
            id: p.id,
            name: p.name,
            location: p.location,
        }));

        res.json(lean);
    } catch (err: any) {
        next(mapHttpError(err));
    }
}

function mapHttpError(err: any): Error & { statusCode: number } {
    const status = err?.response?.status;
    const message = err?.response?.data?.message ?? err?.message ?? 'Service error';
    const e = new Error(message) as Error & { statusCode: number };
    e.statusCode = status ?? 500;
    return e;
}