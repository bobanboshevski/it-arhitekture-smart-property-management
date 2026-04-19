import * as request from 'supertest';
import {createApp} from '../src/server';
import {bookingGrpcService} from '../src/services/booking.grpc.service';

jest.mock('../src/services/booking.grpc.service');

const app = createApp();

const mockBooking = {
    id: 'booking-uuid',
    roomId: 'room-uuid',
    guestName: 'Boban',
    startDate: '2026-07-01',
    endDate: '2026-07-05',
};

describe('POST /m/bookings', () => {
    it('returns 201 and booking on success', async () => {
        (bookingGrpcService.createBooking as jest.Mock).mockResolvedValue(mockBooking);

        const res = await request(app).post('/m/bookings').send({
            roomId: 'room-uuid',
            guestName: 'Boban',
            startDate: '2026-07-01',
            endDate: '2026-07-05',
        });

        expect(res.status).toBe(201);
        expect(res.body.guestName).toBe('Boban');
    });

    it('returns 400 when required fields are missing', async () => {
        const res = await request(app).post('/m/bookings').send({
            guestName: 'Boban',
        });
        expect(res.status).toBe(400);
    });

    it('returns 400 when date format is wrong', async () => {
        const res = await request(app).post('/m/bookings').send({
            roomId: 'room-uuid',
            guestName: 'Boban',
            startDate: 'not-a-date',
            endDate: '2026-07-05',
        });
        expect(res.status).toBe(400);
    });
});

describe('GET /m/bookings/:id', () => {
    it('returns 200 with booking', async () => {
        (bookingGrpcService.getBooking as jest.Mock).mockResolvedValue(mockBooking);

        const res = await request(app).get('/m/bookings/booking-uuid');
        expect(res.status).toBe(200);
        expect(res.body.id).toBe('booking-uuid');
    });

    it('returns 404 when booking not found', async () => {
        const err: any = new Error('not found');
        err.code = 5;
        (bookingGrpcService.getBooking as jest.Mock).mockRejectedValue(err);

        const res = await request(app).get('/m/bookings/nonexistent');
        expect(res.status).toBe(404);
    });
});

describe('DELETE /m/bookings/:id', () => {
    it('returns 204 on successful cancellation', async () => {
        (bookingGrpcService.deleteBooking as jest.Mock).mockResolvedValue({});

        const res = await request(app).delete('/m/bookings/booking-uuid');
        expect(res.status).toBe(204);
    });
});