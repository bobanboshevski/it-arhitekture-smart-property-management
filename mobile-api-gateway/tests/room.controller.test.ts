import * as request from 'supertest';
import {createApp} from '../src/server';
import {propertyHttpService} from '../src/services/property.http.service';
import {pricingHttpService} from '../src/services/pricing.http.service';

jest.mock('../src/services/property.http.service');
jest.mock('../src/services/pricing.http.service');

const app = createApp();

const mockRooms = [
    {id: 'room-1', name: 'Room 101', capacity: 2, propertyId: 'prop-1'},
    {id: 'room-2', name: 'Room 102', capacity: 3, propertyId: 'prop-1'},
];

describe('GET /m/rooms', () => {
    it('returns lean room list', async () => {
        (propertyHttpService.getAllRooms as jest.Mock).mockResolvedValue(mockRooms);

        const res = await request(app).get('/m/rooms');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0]).toEqual({
            id: 'room-1',
            name: 'Room 101',
            capacity: 2,
            propertyId: 'prop-1',
        });
    });
});

describe('GET /m/rooms/:id', () => {
    it('returns room detail with price merged', async () => {
        (propertyHttpService.getRoomById as jest.Mock).mockResolvedValue(mockRooms[0]);
        (pricingHttpService.getRoomPrice as jest.Mock).mockResolvedValue({
            roomId: 'room-1',
            basePrice: 100,
            adjustedPrice: 120,
        });

        const res = await request(app).get('/m/rooms/room-1');
        expect(res.status).toBe(200);
        expect(res.body.price.adjusted).toBe(120);
    });

    it('returns room without price when pricing service fails', async () => {
        (propertyHttpService.getRoomById as jest.Mock).mockResolvedValue(mockRooms[0]);
        (pricingHttpService.getRoomPrice as jest.Mock).mockRejectedValue(new Error('unavailable'));

        const res = await request(app).get('/m/rooms/room-1');
        expect(res.status).toBe(200);
        expect(res.body.price).toBeNull();
    });

    it('returns 404 when room does not exist', async () => {
        const err: any = new Error('not found');
        err.response = {status: 404};
        (propertyHttpService.getRoomById as jest.Mock).mockRejectedValue(err);

        const res = await request(app).get('/m/rooms/nonexistent');
        expect(res.status).toBe(404);
    });
});

describe('GET /m/rooms/:id/availability', () => {
    it('returns available true when room exists', async () => {
        (propertyHttpService.checkRoomExists as jest.Mock).mockResolvedValue(true);

        const res = await request(app).get('/m/rooms/room-1/availability');
        expect(res.status).toBe(200);
        expect(res.body.available).toBe(true);
    });
});