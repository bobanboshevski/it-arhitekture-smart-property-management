import {Controller, Get, Param} from "@nestjs/common";
import {PricingCalculatorService} from "../../domain/services/pricing-calculator.service";
import {GetRoomPriceUseCase} from "../../application/use-cases/get-room-price.use-case";
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {RoomPriceResponseDto} from "../../application/dto/room-price.response.dto";


@Controller('pricing')
export class DynamicPricingController {
    constructor(
        private readonly getRoomPriceUseCase: GetRoomPriceUseCase
    ) {
    }

    // @Get(':roomId')
    // async getPrice(@Param('roomId') roomId: string){
    //
    //     // - - WRONG - -
    //     // mixes domain logic with application orchestration
    //     return this.pricingService.getCurrectPrice(roomId);
    //     // TODO: The correct approach is use case
    // }

    @Get(':roomId')
    @ApiOperation({summary: 'Get price for a room'})
    @ApiResponse({
        status: 200,
        description: 'Room price returned',
        type: RoomPriceResponseDto
    })
    @ApiResponse({
        status: 404,
        description: 'Room not found'
    })
    async getPrice(@Param('roomId') roomId: string) {
        return this.getRoomPriceUseCase.execute(roomId);
    }

    @Get()
    @ApiOperation({summary: 'Heath check if the app is working as expected'})
    @ApiResponse({status: 200, description: 'The service works!'})

    async healthCheck() {
        return "It runs!";
    }
}