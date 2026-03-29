import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {DynamicPricingController} from "./pricing/interfaces/rest/pricing.controller";
import {PricingCalculatorService} from "./pricing/domain/services/pricing-calculator.service";
import {HandleBookingEventUseCase} from "./pricing/application/use-cases/handle-booking-event.use-case";
import {GetRoomPriceUseCase} from "./pricing/application/use-cases/get-room-price.use-case";
import {BookingConsumer} from "./pricing/infrastructure/messaging/rabbitmq.consumer";
import {PostgresRoomPriceRepository} from "./pricing/infrastructure/persistence/postgres-room-price.repository";
import {ConfigModule} from "@nestjs/config";
import {RoomPriceOrmEntity} from "./pricing/infrastructure/persistence/entities/room-price.orm-entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AppLogger} from "./shared/logger/logger.service";
import {RoomPrice} from "./pricing/domain/model/room-price.entity";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            // envFilePath: '.env.local',
            envFilePath: process.env.NODE_ENV === 'docker' ? '.env.docker' : '.env.local',
        }),

        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRES_PORT), // not the best fix
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD ?? 'postgres',
            database: process.env.POSTGRES_DB,
            entities: [
                RoomPriceOrmEntity
            ],
            synchronize: true
        }),

        TypeOrmModule.forFeature([RoomPriceOrmEntity]),
    ],
    controllers: [DynamicPricingController],
    providers: [
        // Domain
        PricingCalculatorService,

        // shared
        AppLogger,

        // use case
        HandleBookingEventUseCase,
        GetRoomPriceUseCase,

        // messaging
        BookingConsumer,

        // interface -> implementation binding
        {
            provide: 'RoomPriceRepository',
            useClass: PostgresRoomPriceRepository,
        }
    ],
})
export class AppModule {
}


// @Module({
//     imports: [
//         ConfigModule.forRoot({ isGlobal: true }),
//
//         TypeOrmModule.forRoot({
//             type: 'postgres',
//             host: process.env.POSTGRES_HOST,
//             port: Number(process.env.POSTGRES_PORT),
//             username: process.env.POSTGRES_USER,
//             password: process.env.POSTGRES_PASSWORD,
//             database: process.env.POSTGRES_DB,
//             entities: [RoomPriceOrmEntity],
//             synchronize: true,
//         }),
//
//         TypeOrmModule.forFeature([RoomPriceOrmEntity]),
//     ],
//
//     controllers: [PricingController],
//
//     providers: [
//         // DOMAIN
//         PricingCalculatorService,
//
//         // USE CASES
//         HandleBookingEventUseCase,
//         GetRoomPriceUseCase,
//
//         // INFRASTRUCTURE
//         RabbitMQConsumer,
//
//         // 🔥 THIS LINE IS CRITICAL
//         PostgresRoomPriceRepository,
//
//         // 🔥 Interface binding
//         {
//             provide: 'RoomPriceRepository',
//             useExisting: PostgresRoomPriceRepository,
//         },
//     ],
// })
// export class AppModule {}