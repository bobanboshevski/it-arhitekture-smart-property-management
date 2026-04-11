import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'BOOKING_PACKAGE',
                transport: Transport.GRPC,
                options: {
                    url: process.env.BOOKING_SERVICE_URL ?? 'localhost:50051',
                    package: 'booking',
                    protoPath: join(__dirname, '../../proto/booking.proto'),
                },
            },
        ]),
    ],
    controllers: [BookingController],
    providers: [BookingService],
})
export class BookingModule {}