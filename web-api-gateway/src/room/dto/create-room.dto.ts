import {ApiProperty} from '@nestjs/swagger';
import {IsInt, IsNotEmpty, IsString, IsUUID, Min} from 'class-validator';

export class CreateRoomDto {
    @ApiProperty({example: 'Room 101'})
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({example: 2})
    @IsInt()
    @Min(1)
    capacity: number;

    @ApiProperty({example: 'a1b2c3d4-...'})
    @IsString()
    @IsNotEmpty()
    propertyId: string;
}