import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Logger,
    Param,
    Post,
    Put,
} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {RoomService} from './room.service';
import {CreateRoomDto} from './dto/create-room.dto';
import {UpdateRoomDto} from './dto/update-room.dto';
import {RoomProfileDto} from "./dto/room-profile.dto";

@ApiTags('Rooms')
@Controller('rooms')
export class RoomController {
    private readonly logger = new Logger(RoomController.name);

    constructor(private readonly roomService: RoomService) {
    }

    @Post()
    @ApiOperation({summary: 'Create a new room'})
    @ApiResponse({status: 201, description: 'Room created'})
    @ApiResponse({status: 400, description: 'Invalid input'})
    async create(@Body() dto: CreateRoomDto) {
        return this.roomService.createRoom(dto);
    }

    @Get()
    @ApiOperation({summary: 'Get all rooms'})
    @ApiResponse({status: 200, description: 'List of all rooms'})
    async getAll() {
        return this.roomService.getAllRooms();
    }

    // ! ! ! specific routes MUST come before :id to avoid NestJS matching
    // "profile" or "exists" as the :id parameter

    @Get(':id/profile')
    @ApiOperation({
        summary: 'Get full room profile — room details, current price and availability aggregated from all services',
    })
    @ApiResponse({status: 200, description: 'Room profile returned', type: RoomProfileDto})
    @ApiResponse({status: 404, description: 'Room not found'})
    async getProfile(@Param('id') id: string) {
        return this.roomService.getRoomProfile(id);
    }

    @Get(':id/exists')
    @ApiOperation({summary: 'Check if a room exists'})
    @ApiResponse({status: 200, description: 'Boolean — true if room exists'})
    async checkExists(@Param('id') id: string) {
        return this.roomService.checkRoomExists(id);
    }

    @Get(':id/base-price')
    @ApiOperation({summary: 'Get base price for a room'})
    @ApiResponse({status: 200, description: 'Base price returned'})
    @ApiResponse({status: 404, description: 'Room not found'})
    async getBasePrice(@Param('id') id: string) {
        return this.roomService.getRoomBasePrice(id);
    }

    @Get('property/:propertyId')
    @ApiOperation({summary: 'Get all rooms for a specific property'})
    @ApiResponse({status: 200, description: 'List of rooms for the property'})
    @ApiResponse({status: 404, description: 'Property not found'})
    async getByProperty(@Param('propertyId') propertyId: string) {
        return this.roomService.getRoomsByProperty(propertyId);
    }
    
    @Get(':id')
    @ApiOperation({summary: 'Get a room by ID'})
    @ApiResponse({status: 200, description: 'Room found'})
    @ApiResponse({status: 404, description: 'Room not found'})
    async getOne(@Param('id') id: string) {
        return this.roomService.getRoomById(id);
    }

    @Put(':id')
    @ApiOperation({summary: 'Update a room'})
    @ApiResponse({status: 200, description: 'Room updated'})
    @ApiResponse({status: 404, description: 'Room not found'})
    async update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
        return this.roomService.updateRoom(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({summary: 'Delete a room'})
    @ApiResponse({status: 204, description: 'Room deleted'})
    @ApiResponse({status: 404, description: 'Room not found'})
    async remove(@Param('id') id: string) {
        return this.roomService.deleteRoom(id);
    }
}