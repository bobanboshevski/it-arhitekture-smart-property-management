import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(__dirname, '../proto/booking.proto');

const packageDef = protoLoader.loadSync(PROTO_PATH, {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDef) as any;

const client = new proto.booking.BookingService(
    process.env.BOOKING_SERVICE_URL ?? 'localhost:50051',
    grpc.credentials.createInsecure(),
);

// Wraps gRPC callback style into a Promise
function call<T>(method: string, payload: object): Promise<T> {
    return new Promise((resolve, reject) => {
        client[method](payload, (err: grpc.ServiceError, response: T) => {
            if (err) return reject(err);
            resolve(response);
        });
    });
}

// todo: analyze the structure of this

export const bookingGrpcService = {
    createBooking: (data: {
        roomId: string;
        guestName: string;
        startDate: string;
        endDate: string;
    }) => call('createBooking', data),

    getBooking: (bookingId: string) =>
        call('getBooking', {bookingId}),

    deleteBooking: (id: string) =>
        call('deleteBooking', {id}),

    getBookingsByRoom: (roomId: string) =>
        call('getBookingsByRoom', {roomId}),
};
