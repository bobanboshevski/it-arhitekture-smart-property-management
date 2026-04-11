import {Controller, Get, Logger, Param} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {PricingService} from './pricing.service';
import {RoomPriceDto} from "./dto/room-price.dto";

@ApiTags('Pricing')
@Controller('pricing')
export class PricingController {
    private readonly logger = new Logger(PricingController.name);

    constructor(private readonly pricingService: PricingService) {
    }

    @Get(':roomId')
    @ApiOperation({summary: 'Get current dynamic price for a room'})
    @ApiResponse({status: 200, description: 'Room price returned', type: RoomPriceDto})
    @ApiResponse({status: 404, description: 'Room price not found'})
    async getPrice(@Param('roomId') roomId: string) {
        return this.pricingService.getRoomPrice(roomId);
    }
}