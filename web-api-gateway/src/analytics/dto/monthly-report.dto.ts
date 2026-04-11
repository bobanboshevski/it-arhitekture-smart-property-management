import {ApiProperty} from '@nestjs/swagger';

export class MonthlyReportDto {
    @ApiProperty({example: 'room-uuid'})
    roomId: string;

    @ApiProperty({example: 3})
    bookingsCount: number;

    @ApiProperty({example: 540.00})
    revenue: number;
}