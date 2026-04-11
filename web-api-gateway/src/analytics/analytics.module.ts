import {Module} from '@nestjs/common';
import {ClientsModule, Transport} from '@nestjs/microservices';
import {join} from 'path';
import {AnalyticsController} from './analytics.controller';
import {AnalyticsService} from './analytics.service';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'ANALYTICS_PACKAGE',
                transport: Transport.GRPC,
                options: {
                    // Same service, same port — booking and analytics live in one binary
                    url: process.env.BOOKING_SERVICE_URL ?? 'localhost:50051',
                    package: 'analytics',
                    protoPath: join(__dirname, '../../proto/analytics.proto'),
                },
            },
        ]),
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
    exports: [AnalyticsService] // exported so propertyModule can use it
})
export class AnalyticsModule {
}