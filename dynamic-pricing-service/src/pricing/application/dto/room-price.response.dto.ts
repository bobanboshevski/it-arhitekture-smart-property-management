import {ApiProperty} from "@nestjs/swagger";

export class RoomPriceResponseDto {

    @ApiProperty({example: 'room-123'})
    roomId: string;

    @ApiProperty({example: 100})
    basePrice: number;

    @ApiProperty({example: 135})
    adjustedPrice: number;

    constructor(roomId: string, basePrice: number, adjustedPrice: number) {
        this.roomId = roomId;
        this.basePrice = basePrice;
        this.adjustedPrice = adjustedPrice;
    }
}