import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(__dirname, '../proto/analytics.proto');

const packageDef = protoLoader.loadSync(PROTO_PATH, {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDef) as any;

const client = new proto.analytics.AnalyticsService(
    process.env.BOOKING_SERVICE_URL ?? 'localhost:50051',
    grpc.credentials.createInsecure(),
);

function call<T>(method: string, payload: object): Promise<T> {
    return new Promise((resolve, reject) => {
        client[method](payload, (err: grpc.ServiceError, response: T) => {
            if (err) return reject(err);
            resolve(response);
        });
    });
}

export const analyticsGrpcService = {
    getOccupancyRate: (roomId: string, month: string, year: string) =>
        call('getOccupancyRate', {roomId, month, year}),
};