import {Router} from 'express';
import {getRoomPrice} from '../controllers/pricing.controller';

export function pricingRoutes(): Router {
    const router = Router();

    // GET /m/pricing/:roomId
    router.get('/:roomId', getRoomPrice);

    return router;
}