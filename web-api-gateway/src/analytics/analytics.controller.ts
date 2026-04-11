import {Controller, Get, Logger, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
import {AnalyticsService} from './analytics.service';
import {MonthlyReportDto} from "./dto/monthly-report.dto";
import {KpiDto} from "./dto/kpi.dto";
import {OccupancyRateDto} from "./dto/occupancy-rate.dto";

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
    private readonly logger = new Logger(AnalyticsController.name);

    constructor(private readonly analyticsService: AnalyticsService) {
    }

    @Get(':roomId/monthly-report')
    @ApiOperation({summary: 'Get monthly booking report for a room'})
    @ApiQuery({name: 'month', example: '7', description: 'Month number (1-12)'})
    @ApiQuery({name: 'year', example: '2026', description: 'Four digit year'})
    @ApiResponse({status: 200, description: 'Monthly report returned', type: MonthlyReportDto})
    @ApiResponse({status: 404, description: 'No data found'})
    async getMonthlyReport(
        @Param('roomId') roomId: string,
        @Query('month') month: string,
        @Query('year') year: string,
    ) {
        return this.analyticsService.getMonthlyReport(roomId, month, year);
    }

    @Get(':roomId/kpi')
    @ApiOperation({summary: 'Get KPIs (ADR and RevPAR) for a room'})
    @ApiQuery({name: 'month', example: '7', description: 'Month number (1-12)'})
    @ApiQuery({name: 'year', example: '2026', description: 'Four digit year'})
    @ApiResponse({status: 200, description: 'KPI data returned', type: KpiDto})
    @ApiResponse({status: 404, description: 'No data found'})
    async getKpi(
        @Param('roomId') roomId: string,
        @Query('month') month: string,
        @Query('year') year: string,
    ) {
        return this.analyticsService.getKpi(roomId, month, year);
    }

    @Get(':roomId/occupancy')
    @ApiOperation({summary: 'Get occupancy rate for a room'})
    @ApiQuery({name: 'month', example: '7', description: 'Month number (1-12)'})
    @ApiQuery({name: 'year', example: '2026', description: 'Four digit year'})
    @ApiResponse({status: 200, description: 'Occupancy rate returned', type: OccupancyRateDto})
    @ApiResponse({status: 404, description: 'No data found'})
    async getOccupancyRate(
        @Param('roomId') roomId: string,
        @Query('month') month: string,
        @Query('year') year: string,
    ) {
        return this.analyticsService.getOccupancyRate(roomId, month, year);
    }
}