import {
    Injectable,
    Logger,
    NotFoundException,
    InternalServerErrorException, BadRequestException,
} from '@nestjs/common';
import axios, {AxiosInstance} from 'axios';
import {UpdatePropertyDto} from "./dto/update-property.dto";
import {CreatePropertyDto} from "./dto/create-property.dto";
import {PropertyDashboardDto} from "./dto/property-dashboard.dto";

@Injectable()
export class PropertyService {
    private readonly logger = new Logger(PropertyService.name);
    private readonly http: AxiosInstance;
    private readonly analyticsHttp: AxiosInstance;

    constructor() {
        this.http = axios.create({
            baseURL: process.env.PROPERTY_SERVICE_URL ?? 'http://localhost:8080',
            timeout: 5000,
        });

        // Analytics is gRPC, but we reach it through the gateway's own
        // AnalyticsService — we inject it via a direct service call instead
        // of HTTP. See getDashboard() below.
    }

    async createProperty(dto: CreatePropertyDto) {
        this.logger.log(`Creating property: ${dto.name}`);
        try {
            const {data} = await this.http.post('/api/properties', dto);
            return data;
        } catch (err) {
            this.handleHttpError(err, 'Failed to create property');
        }
    }

    async getAllProperties() {
        this.logger.log('Fetching all properties');
        try {
            const {data} = await this.http.get('/api/properties');
            return data;
        } catch (err) {
            this.handleHttpError(err, 'Failed to fetch properties');
        }
    }

    async getPropertyById(id: string) {
        this.logger.log(`Fetching property ${id}`);
        try {
            const {data} = await this.http.get(`/api/properties/${id}`);
            return data;
        } catch (err) {
            this.handleHttpError(err, `Property ${id} not found`);
        }
    }

    async updateProperty(id: string, dto: UpdatePropertyDto) {
        this.logger.log(`Updating property ${id}`);
        try {
            const {data} = await this.http.put(`/api/properties/${id}`, dto);
            return data;
        } catch (err) {
            this.handleHttpError(err, `Failed to update property ${id}`);
        }
    }

    async deleteProperty(id: string) {
        this.logger.log(`Deleting property ${id}`);
        try {
            await this.http.delete(`/api/properties/${id}`);
        } catch (err) {
            this.handleHttpError(err, `Failed to delete property ${id}`);
        }
    }

    // --- Property dashboard ---
    async getPropertyDashboard(
        propertyId: string,
        month: string,
        year: string,
        analyticsService: any, // inject from controller
        roomService: any, // injected from the controller
    ): Promise<PropertyDashboardDto> {
        this.logger.log(`Building dashboard for property ${propertyId} ${month}/${year}`);

        // Step 1 — fetch property and its rooms in parallel
        const [propertyResult, roomsResult] = await Promise.allSettled([
            this.getPropertyById(propertyId),
            roomService.getRoomsByProperty(propertyId),
        ]);

        if (propertyResult.status === 'rejected') {
            const status = (propertyResult.reason as any)?.response?.status;
            if (status === 404) {
                throw new NotFoundException(`Property ${propertyId} not found`);
            }
            throw new InternalServerErrorException('Failed to fetch property');
        }

        const property = propertyResult.value;
        const rooms: any[] =
            roomsResult.status === 'fulfilled' ? roomsResult.value : [];

        if (roomsResult.status === 'rejected') {
            this.logger.warn(`Could not fetch rooms for property ${propertyId}`);
        }

        // Step 2 — fan out analytics for every room in parallel
        const roomAnalyticsResults = await Promise.allSettled(
            rooms.map(async (room: any) => {
                const paddedMonth = month.padStart(2, '0');

                const [reportResult, occupancyResult, kpiResult] =
                    await Promise.allSettled([
                        analyticsService.getMonthlyReport(room.id, paddedMonth, year),
                        analyticsService.getOccupancyRate(room.id, paddedMonth, year),
                        analyticsService.getKpi(room.id, paddedMonth, year),
                    ]);

                const report =
                    reportResult.status === 'fulfilled' ? reportResult.value : null;
                const occupancy =
                    occupancyResult.status === 'fulfilled' ? occupancyResult.value : null;
                const kpi =
                    kpiResult.status === 'fulfilled' ? kpiResult.value : null;

                return {
                    roomId: room.id,
                    name: room.name,
                    bookingsCount: report?.bookingsCount ?? 0,
                    revenue: report?.revenue ?? 0,
                    occupancyRate: occupancy?.occupancyRate ?? 0,
                    adr: kpi?.adr ?? 0,
                };
            }),
        );

        // Step 3 — collect successful room results
        const roomSummaries = roomAnalyticsResults
            .filter((r) => r.status === 'fulfilled')
            .map((r: any) => r.value);

        // Step 4 — aggregate
        const totalRevenue = roomSummaries.reduce((sum, r) => sum + r.revenue, 0);
        const totalBookings = roomSummaries.reduce((sum, r) => sum + r.bookingsCount, 0);
        const averageOccupancyRate =
            roomSummaries.length > 0
                ? roomSummaries.reduce((sum, r) => sum + r.occupancyRate, 0) /
                roomSummaries.length
                : 0;
        const averageAdr =
            roomSummaries.length > 0
                ? roomSummaries.reduce((sum, r) => sum + r.adr, 0) / roomSummaries.length
                : 0;

        return {
            property: {
                id: property.id,
                name: property.name,
                location: property.location,
            },
            analytics: {
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalBookings,
                averageOccupancyRate: Math.round(averageOccupancyRate * 100) / 100,
                averageAdr: Math.round(averageAdr * 100) / 100,
            },
            rooms: roomSummaries,
        };
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