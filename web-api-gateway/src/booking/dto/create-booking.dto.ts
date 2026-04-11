import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class CreateBookingDto {
    @ApiProperty({ example: 'room-123' })
    @IsString()
    @IsNotEmpty()
    roomId: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    guestName: string;

    @ApiProperty({ example: '2026-07-01' })
    @IsString()
    @Matches(DATE_REGEX, { message: 'startDate must be YYYY-MM-DD' })
    startDate: string;

    @ApiProperty({ example: '2026-07-05' })
    @IsString()
    @Matches(DATE_REGEX, { message: 'endDate must be YYYY-MM-DD' })
    endDate: string;
}