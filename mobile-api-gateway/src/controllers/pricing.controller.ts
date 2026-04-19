import {Request, Response, NextFunction} from 'express';
import {pricingHttpService} from '../services/pricing.http.service';

interface RoomIdParam {
    roomId: string;
}

// GET /m/pricing/:roomId
export async function getRoomPrice(
    req: Request<RoomIdParam>,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const price = await pricingHttpService.getRoomPrice(req.params.roomId);

        // Mobile only needs the adjusted price and roomId
        res.json({
            roomId: price.roomId,
            price: price.adjustedPrice ?? price.basePrice,
        });
    } catch (err: any) {
        const status = err?.response?.status;
        const e = new Error(err?.response?.data?.message ?? 'Pricing unavailable') as any;
        e.statusCode = status ?? 500;
        next(e);
    }
}