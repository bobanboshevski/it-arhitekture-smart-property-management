import {
    Injectable,
    Logger,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import axios, {AxiosInstance} from 'axios';

@Injectable()
export class PricingService {
    private readonly logger = new Logger(PricingService.name);
    private readonly http: AxiosInstance;

    constructor() {
        this.http = axios.create({
            baseURL: process.env.PRICING_SERVICE_URL ?? 'http://localhost:3002',
            timeout: 5000,
        });
    }

    async getRoomPrice(roomId: string) {
        this.logger.log(`Fetching price for room ${roomId}`);
        try {
            const {data} = await this.http.get(`/pricing/${roomId}`);
            return data;
        } catch (err) {
            this.handleHttpError(err, `Price for room ${roomId} not found`);
        }
    }

    private handleHttpError(err: any, fallbackMessage: string): never {
        const status = err?.response?.status;
        const message = err?.response?.data?.message ?? fallbackMessage;
        this.logger.error(`Pricing service error status=${status}: ${message}`);

        if (status === 404) throw new NotFoundException(message);
        throw new InternalServerErrorException('Pricing service error');
    }
}