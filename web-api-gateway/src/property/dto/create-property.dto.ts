import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePropertyDto {
    @ApiProperty({ example: 'Grand Hotel' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Ljubljana, Slovenia' })
    @IsString()
    @IsNotEmpty()
    location: string;

    @ApiProperty({ example: 120.00 })
    @IsNumber()
    @Min(0)
    basePrice: number;
}