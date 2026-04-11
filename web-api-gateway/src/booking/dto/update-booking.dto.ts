import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class UpdateBookingDto {
    @ApiProperty({ example: 'John Doe' }) // todo: what about the id?
    @IsString()
    @IsNotEmpty()
    guestName: string;

    @ApiProperty({ example: '2026-08-01' })
    @IsString()
    @Matches(DATE_REGEX, { message: 'startDate must be YYYY-MM-DD' })
    startDate: string;

    @ApiProperty({ example: '2026-08-05' })
    @IsString()
    @Matches(DATE_REGEX, { message: 'endDate must be YYYY-MM-DD' })
    endDate: string;
}