import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsInt, IsOptional, IsString, Min} from 'class-validator';

export class UpdateRoomDto {
    @ApiPropertyOptional({example: 'Room 102'})
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({example: 3})
    @IsOptional()
    @IsInt()
    @Min(1)
    capacity?: number;

    @ApiPropertyOptional({example: 'a1b2c3d4-...'})
    @IsOptional()
    @IsString()
    propertyId?: string;
}