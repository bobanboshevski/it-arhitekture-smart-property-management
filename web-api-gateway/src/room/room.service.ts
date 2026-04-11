import {
    Injectable,
    Logger,
    NotFoundException,
    InternalServerErrorException,
    BadRequestException,
} from '@nestjs/common';
import axios, {AxiosInstance} from 'axios';
import {CreateRoomDto} from './dto/create-room.dto';
import {UpdateRoomDto} from './dto/update-room.dto';
import {RoomProfileDto} from "./dto/room-profile.dto";

@Injectable()
export class RoomService {
    private readonly logger = new Logger(RoomService.name);
    private readonly http: AxiosInstance;
    private readonly pricingHttp: AxiosInstance;
    private readonly bookingServiceUrl: string;

    constructor() {
        this.http = axios.create({
            baseURL: process.env.PROPERTY_SERVICE_URL ?? 'http://localhost:8080',
            timeout: 5000,
        });

        this.pricingHttp = axios.create({
            baseURL: process.env.PRICING_SERVICE_URL ?? 'http://localhost:3002',
            timeout: 5000,
        });

        this.bookingServiceUrl =
            process.env.BOOKING_HTTP_URL ?? 'http://localhost:50051';
    }

    async createRoom(dto: CreateRoomDto) {
        this.logger.log(`Creating room: ${dto.name}`);
        try {
            const {data} = await this.http.post('/api/rooms', dto);
            return data;
        } catch (err) {
            this.handleHttpError(err, 'Failed to create room');
        }
    }

    async getAllRooms() {
        this.logger.log('Fetching all rooms');
        try {
            const {data} = await this.http.get('/api/rooms');
            return data;
        } catch (err) {
            this.handleHttpError(err, 'Failed to fetch rooms');
        }
    }

    async getRoomById(id: string) {
        this.logger.log(`Fetching room ${id}`);
        try {
            const {data} = await this.http.get(`/api/rooms/${id}`);
            return data;
        } catch (err) {
            this.handleHttpError(err, `Room ${id} not found`);
        }
    }

    async updateRoom(id: string, dto: UpdateRoomDto) {
        this.logger.log(`Updating room ${id}`);
        try {
            const {data} = await this.http.put(`/api/rooms/${id}`, dto);
            return data;
        } catch (err) {
            this.handleHttpError(err, `Failed to update room ${id}`);
        }
    }

    async deleteRoom(id: string) {
        this.logger.log(`Deleting room ${id}`);
        try {
            await this.http.delete(`/api/rooms/${id}`);
        } catch (err) {
            this.handleHttpError(err, `Failed to delete room ${id}`);
        }
    }

    async checkRoomExists(roomId: string) {
        this.logger.log(`Checking existence of room ${roomId}`);
        try {
            const {data} = await this.http.get(`/api/rooms/${roomId}/exists`);
            return data;
        } catch (err) {
            this.handleHttpError(err, `Failed to check room ${roomId} existence`);
        }
    }

    async getRoomBasePrice(roomId: string) {
        this.logger.log(`Fetching base price for room ${roomId}`);
        try {
            const {data} = await this.http.get(`/api/rooms/${roomId}/basePrice`);
            return data;
        } catch (err) {
            this.handleHttpError(err, `Base price for room ${roomId} not found`);
        }
    }

    // ── aggregated room profile ───
    async getRoomProfile(roomId: string): Promise<RoomProfileDto> {
        this.logger.log(`Building profile for room ${roomId}`);

        // Fan out to all three sources in parallel
        const [roomResult, pricingResult, bookingsResult] =
            await Promise.allSettled([
                this.http.get(`/api/rooms/${roomId}`),
                this.pricingHttp.get(`/pricing/${roomId}`),
                this.http.get(`/api/rooms/${roomId}/exists`),
            ]);

        // Room is mandatory — fail fast if it doesn't exist
        if (roomResult.status === 'rejected') {
            const status = roomResult.reason?.response?.status;
            if (status === 404)
                throw new NotFoundException(`Room ${roomId} not found`);

            throw new InternalServerErrorException('Failed to fetch room details');
        }

        const room = roomResult.value.data;

        // Pricing is optional — room may not have been booked yet
        let currentPrice = {
            basePrice: null,
            adjustedPrice: null
        };

        if (pricingResult.status === 'fulfilled') {
            currentPrice = pricingResult.value.data;
        } else {
            this.logger.warn(`Pricing not available for room ${roomId}`);
        }

        // Availability — default to true if bookings call fails
        let available = true;
        if (bookingsResult.status === 'fulfilled') {
            available = bookingsResult.value.data === true;
        } else {
            this.logger.warn(`Could not determine availability for room ${roomId}`);
        }

        return {
            room: {
                id: room.id,
                name: room.name,
                capacity: room.capacity,
                propertyId: room.propertyId
            },
            currentPrice,
            available,
        }
    }

    async getRoomsByProperty(propertyId: string) {
        this.logger.log(`Fetching rooms for property ${propertyId}`);
        try {
            const {data} = await this.http.get(`/api/rooms/property/${propertyId}`);
            return data;
        } catch (err) {
            this.handleHttpError(err, `Failed to fetch rooms for property ${propertyId}`);
        }
    }

    private handleHttpError(err: any, fallbackMessage: string): never {
        const status = err?.response?.status;
        const message = err?.response?.data?.message ?? fallbackMessage;
        this.logger.error(`Property service error status=${status}: ${message}`);

        if (status === 404) throw new NotFoundException(message);
        if (status === 400) throw new BadRequestException(message);
        throw new InternalServerErrorException('Property service error');
    }
}