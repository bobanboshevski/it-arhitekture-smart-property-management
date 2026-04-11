import {
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    Param,
    Post,
    Put,
} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {BookingService} from './booking.service';
import {CreateBookingDto} from './dto/create-booking.dto';
import {UpdateBookingDto} from './dto/update-booking.dto';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingController {
    private readonly logger = new Logger(BookingController.name);

    constructor(private readonly bookingService: BookingService) {
    }

    @Post()
    @ApiOperation({summary: 'Create a new booking'})
    @ApiResponse({status: 201, description: 'Booking created'})
    @ApiResponse({status: 400, description: 'Invalid input'})
    async create(@Body() dto: CreateBookingDto) {
        return this.bookingService.createBooking(dto);
    }

    @Get(':id')
    @ApiOperation({summary: 'Get a booking by ID'})
    @ApiResponse({status: 200, description: 'Booking found'})
    @ApiResponse({status: 404, description: 'Booking not found'})
    async getOne(@Param('id') id: string) {
        return this.bookingService.getBooking(id);
    }

    @Put(':id')
    @ApiOperation({summary: 'Update a booking'})
    @ApiResponse({status: 200, description: 'Booking updated'})
    async update(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
        return this.bookingService.updateBooking(id, dto);
    }

    @Delete(':id')
    @ApiOperation({summary: 'Delete a booking'})
    @ApiResponse({status: 200, description: 'Booking deleted'})
    async remove(@Param('id') id: string) {
        return this.bookingService.deleteBooking(id);
    }

    @Get('room/:roomId')
    @ApiOperation({summary: 'Get all bookings for a room'})
    @ApiResponse({status: 200, description: 'List of bookings'})
    async getByRoom(@Param('roomId') roomId: string) {
        return this.bookingService.getBookingsByRoom(roomId);
    }
}