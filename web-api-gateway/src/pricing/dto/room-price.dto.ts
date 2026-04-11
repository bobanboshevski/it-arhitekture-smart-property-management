import {ApiProperty} from '@nestjs/swagger';

export class RoomPriceDto {
    @ApiProperty({example: 'room-uuid'})
    roomId: string;

    @ApiProperty({example: 120.00})
    basePrice: number;

    @ApiProperty({example: 144.00, description: 'Dynamically adjusted price'})
    adjustedPrice: number;
}