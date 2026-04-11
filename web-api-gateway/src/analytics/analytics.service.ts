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

interface AnalyticsGrpcService {
    getMonthlyReport(data: {
        roomId: string;
        month: string;
        year: string;
    }): Observable<any>;

    getKpi(data: {
        roomId: string;
        month: string;
        year: string;
    }): Observable<any>;

    getOccupancyRate(data: {
        roomId: string;
        month: string;
        year: string;
    }): Observable<any>;
}

@Injectable()
export class AnalyticsService implements OnModuleInit {
    private readonly logger = new Logger(AnalyticsService.name);
    private grpcService: AnalyticsGrpcService;

    constructor(@Inject('ANALYTICS_PACKAGE') private client: ClientGrpc) {
    }

    onModuleInit() {
        this.grpcService =
            this.client.getService<AnalyticsGrpcService>('AnalyticsService');
    }

    async getMonthlyReport(roomId: string, month: string, year: string) {
        const paddedMonth = this.padMonth(month);
        this.logger.log(`Fetching monthly report for room=${roomId} ${paddedMonth}/${year}`);
        try {
            return await firstValueFrom(
                this.grpcService.getMonthlyReport({roomId, month: paddedMonth, year}),
            );
        } catch (err) {
            this.handleGrpcError(err);
        }
    }

    async getKpi(roomId: string, month: string, year: string) {
        const paddedMonth = this.padMonth(month);
        this.logger.log(`Fetching KPIs for room=${roomId} ${paddedMonth}/${year}`);
        try {
            return await firstValueFrom(
                this.grpcService.getKpi({roomId, month: paddedMonth, year}),
            );
        } catch (err) {
            this.handleGrpcError(err);
        }
    }

    async getOccupancyRate(roomId: string, month: string, year: string) {
        const paddedMonth = this.padMonth(month);
        this.logger.log(`Fetching occupancy rate for room=${roomId} ${paddedMonth}/${year}`);
        try {
            return await firstValueFrom(
                this.grpcService.getOccupancyRate({roomId, month: paddedMonth, year}),
            );
        } catch (err) {
            this.handleGrpcError(err);
        }
    }

    private handleGrpcError(err: any): never {
        const code = err?.code;
        const message = err?.details ?? err?.message ?? 'Unknown error';
        this.logger.error(`gRPC error code=${code}: ${message}`);

        if (code === 5) throw new NotFoundException(message);
        if (code === 3) throw new BadRequestException(message);
        throw new InternalServerErrorException('Analytics service error');
    }

    private padMonth(month: string): string {
        return month.padStart(2, '0'); // "7" → "07", "12" → "12"
    }
}