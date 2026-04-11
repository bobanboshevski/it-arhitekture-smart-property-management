import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Post, Put, Query} from '@nestjs/common';
import {ApiOperation, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
import {PropertyService} from './property.service';
import {UpdatePropertyDto} from "./dto/update-property.dto";
import {CreatePropertyDto} from "./dto/create-property.dto";
import {AnalyticsService} from "../analytics/analytics.service";
import {PropertyDashboardDto} from "./dto/property-dashboard.dto";
import {RoomService} from "../room/room.service";

@ApiTags('Properties')
@Controller('properties')
export class PropertyController {
    private readonly logger = new Logger(PropertyController.name);

    constructor(
        private readonly propertyService: PropertyService,
        private readonly analyticsService: AnalyticsService, // injected
        private readonly roomService: RoomService,
    ) {
    }

    // todo: i can enhance here, by adding another endpoint that returns property
    //  and all the rooms that belong to it!

    @Post()
    @ApiOperation({summary: 'Create a new property'})
    @ApiResponse({status: 201, description: 'Property created'})
    @ApiResponse({status: 400, description: 'Invalid input'})
    async create(@Body() dto: CreatePropertyDto) {
        return this.propertyService.createProperty(dto);
    }

    @Get()
    @ApiOperation({summary: 'Get all properties'})
    @ApiResponse({status: 200, description: 'List of all properties'})
    async getAll() {
        return this.propertyService.getAllProperties();
    }

    @Get(':id/dashboard')
    @ApiOperation({
        summary: 'Get property dashboard — aggregated analytics for all rooms from property + analytics services',
    })
    @ApiQuery({name: 'month', example: '7', description: 'Month number (1-12)'})
    @ApiQuery({name: 'year', example: '2026', description: 'Four digit year'})
    @ApiResponse({status: 200, description: 'Dashboard returned', type: PropertyDashboardDto})
    @ApiResponse({status: 404, description: 'Property not found'})
    async getDashboard(
        @Param('id') id: string,
        @Query('month') month: string,
        @Query('year') year: string,
    ) {
        return this.propertyService.getPropertyDashboard(
            id,
            month,
            year,
            this.analyticsService, // pass through so service can call it
            this.roomService,
        );
    }

    @Get(':id')
    @ApiOperation({summary: 'Get a property by ID'})
    @ApiResponse({status: 200, description: 'Property found'})
    @ApiResponse({status: 404, description: 'Property not found'})
    async getOne(@Param('id') id: string) {
        return this.propertyService.getPropertyById(id);
    }

    @Put(':id')
    @ApiOperation({summary: 'Update a property'})
    @ApiResponse({status: 200, description: 'Property updated'})
    @ApiResponse({status: 404, description: 'Property not found'})
    async update(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
        return this.propertyService.updateProperty(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({summary: 'Delete a property'})
    @ApiResponse({status: 204, description: 'Property deleted'})
    @ApiResponse({status: 404, description: 'Property not found'})
    async remove(@Param('id') id: string) {
        return this.propertyService.deleteProperty(id);
    }


}