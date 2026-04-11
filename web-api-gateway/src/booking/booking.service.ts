import {
    Inject,
    Injectable,
    OnModuleInit,
    Logger,
    NotFoundException,
    InternalServerErrorException,
    BadRequestException,
} from '@nestjs/common';
import type {ClientGrpc} from '@nestjs/microservices';
import {Observable, firstValueFrom} from 'rxjs';
import {CreateBookingDto} from './dto/create-booking.dto';
import {UpdateBookingDto} from './dto/update-booking.dto';

// Mirrors the proto definitions
interface BookingGrpcService {
    createBooking(data: {
        roomId: string;
        guestName: string;
        startDate: string;
        endDate: string;
    }): Observable<any>;

    getBooking(data: { bookingId: string }): Observable<any>;

    updateBooking(data: {
        id: string;
        guestName: string;
        startDate: string;
        endDate: string;
    }): Observable<any>;

    deleteBooking(data: { id: string }): Observable<any>;

    getBookingsByRoom(data: { roomId: string }): Observable<any>;
}

@Injectable()
export class BookingService implements OnModuleInit {
    private readonly logger = new Logger(BookingService.name);
    private grpcService: BookingGrpcService;

    constructor(@Inject('BOOKING_PACKAGE') private client: ClientGrpc) {
    }
    // todo: i need explanation how ClientGrpc works... and everything related to it (observable etc.)

    onModuleInit() {
        this.grpcService =
            this.client.getService<BookingGrpcService>('BookingService');
    }

    async createBooking(dto: CreateBookingDto) {
        this.logger.log(`Creating booking for room ${dto.roomId}`);
        try {
            return await firstValueFrom(
                this.grpcService.createBooking({
                    roomId: dto.roomId,
                    guestName: dto.guestName,
                    startDate: dto.startDate,
                    endDate: dto.endDate,
                }),
            );
        } catch (err) {
            this.handleGrpcError(err);
        }
    }

    async getBooking(bookingId: string) {
        this.logger.log(`Fetching booking ${bookingId}`);
        try {
            return await firstValueFrom(
                this.grpcService.getBooking({bookingId}),
            );
        } catch (err) {
            this.handleGrpcError(err);
        }
    }

    async updateBooking(id: string, dto: UpdateBookingDto) {
        this.logger.log(`Updating booking ${id}`);
        try {
            return await firstValueFrom(
                this.grpcService.updateBooking({
                    id,
                    guestName: dto.guestName,
                    startDate: dto.startDate,
                    endDate: dto.endDate,
                }),
            );
        } catch (err) {
            this.handleGrpcError(err);
        }
    }

    async deleteBooking(id: string) {
        this.logger.log(`Deleting booking ${id}`);
        try {
            return await firstValueFrom(this.grpcService.deleteBooking({id}));
        } catch (err) {
            this.handleGrpcError(err);
        }
    }

    async getBookingsByRoom(roomId: string) {
        this.logger.log(`Fetching bookings for room ${roomId}`);
        try {
            return await firstValueFrom(
                this.grpcService.getBookingsByRoom({roomId}),
            );
        } catch (err) {
            this.handleGrpcError(err);
        }
    }

    // Maps gRPC status codes to NestJS HTTP exceptions
    private handleGrpcError(err: any): never {
        const code = err?.code;
        const message = err?.details ?? err?.message ?? 'Unknown error';

        this.logger.error(`gRPC error code=${code}: ${message}`);

        if (code === 5) throw new NotFoundException(message);         // NOT_FOUND
        if (code === 3) throw new BadRequestException(message);       // INVALID_ARGUMENT
        throw new InternalServerErrorException('Booking service error');
    }
}