import {Router} from 'express';
import {
    getAllRooms,
    getRoomDetail,
    getRoomAvailability,
    getProperties,
} from '../controllers/room.controller';

export function roomRoutes(): Router {
    const router = Router();

    // GET /m/rooms
    router.get('/', getAllRooms);

    // GET /m/rooms/properties — browse properties on mobile
    router.get('/properties', getProperties);

    // GET /m/rooms/:id/availability — specific before :id catch-all
    router.get('/:id/availability', getRoomAvailability);

    // GET /m/rooms/:id — detail with price merged
    router.get('/:id', getRoomDetail);

    return router;
}