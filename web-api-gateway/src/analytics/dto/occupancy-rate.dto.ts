import {ApiProperty} from '@nestjs/swagger';

export class OccupancyRateDto {
    @ApiProperty({example: 0.75, description: 'Occupancy rate as a decimal (0.0 - 1.0)'})
    occupancyRate: number;
}