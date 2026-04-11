import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsNumber, IsOptional, IsString, Min} from 'class-validator';

export class UpdatePropertyDto {
    @ApiPropertyOptional({example: 'Grand Hotel Updated'})
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({example: 'Maribor, Slovenia'})
    @IsOptional()
    @IsString()
    location?: string;

    @ApiPropertyOptional({example: 150.00})
    @IsOptional()
    @IsNumber()
    @Min(0)
    basePrice?: number;
}