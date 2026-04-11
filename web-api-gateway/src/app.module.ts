import { Module } from '@nestjs/common';
import { BookingModule } from './booking/booking.module';
import { PropertyModule } from './property/property.module';
import { PricingModule } from './pricing/pricing.module';
import {AnalyticsModule} from "./analytics/analytics.module";
import {RoomModule} from "./room/room.module";

@Module({
    imports: [BookingModule, PropertyModule, PricingModule, AnalyticsModule, RoomModule],
})
export class AppModule {}