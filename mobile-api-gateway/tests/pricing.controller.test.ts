import * as request from 'supertest';
import {createApp} from '../src/server';
import {pricingHttpService} from '../src/services/pricing.http.service';

jest.mock('../src/services/pricing.http.service');

const app = createApp();

describe('GET /m/pricing/:roomId', () => {
    it('returns lean price for mobile', async () => {
        (pricingHttpService.getRoomPrice as jest.Mock).mockResolvedValue({
            roomId: 'room-1',
            basePrice: 100,
            adjustedPrice: 144,
        });

        const res = await request(app).get('/m/pricing/room-1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({roomId: 'room-1', price: 144});
    });

    it('returns 404 when room price not found', async () => {
        const err: any = new Error('not found');
        err.response = {status: 404, data: {message: 'not found'}};
        (pricingHttpService.getRoomPrice as jest.Mock).mockRejectedValue(err);

        const res = await request(app).get('/m/pricing/nonexistent');
        expect(res.status).toBe(404);
    });
});