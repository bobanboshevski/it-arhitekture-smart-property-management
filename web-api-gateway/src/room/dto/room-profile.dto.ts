import {ApiProperty} from "@nestjs/swagger";

export class RoomDetailDto {
    @ApiProperty({example: 'room-uuid'})
    id: string;

    @ApiProperty({example: 'Room 101'})
    name: string;

    @ApiProperty({example: 2})
    capacity: number;

    @ApiProperty({example: 'property-uuid'})
    propertyId: string;
}

export class CurrentPriceDto {
    @ApiProperty({example: 120.00})
    basePrice: number | null;

    @ApiProperty({example: 144.00})
    adjustedPrice: number | null;
}

export class RoomProfileDto {
    @ApiProperty({type: RoomDetailDto})
    room: RoomDetailDto;

    @ApiProperty({type: CurrentPriceDto})
    currentPrice: CurrentPriceDto;

    @ApiProperty({example: true, description: 'True if room has no active bookings'})
    available: boolean;
}