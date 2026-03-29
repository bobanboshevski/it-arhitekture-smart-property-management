import {IsNumber, IsString} from "class-validator";

export class BookingEventDto {

    @IsString()
    roomId: string;

    @IsString()
    startDate: string;

    @IsString()
    endDate: string;

    @IsString()
    guestName: string;

    @IsNumber()
    basePrice: number;
}