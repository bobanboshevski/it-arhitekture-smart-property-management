import {Module} from '@nestjs/common';
import {PropertyController} from './property.controller';
import {PropertyService} from './property.service';
import {AnalyticsModule} from "../analytics/analytics.module";
import {RoomModule} from "../room/room.module";

@Module({
    imports: [AnalyticsModule, RoomModule], // gives access to analyticsService
    controllers: [PropertyController],
    providers: [PropertyService],
})
export class PropertyModule {
}