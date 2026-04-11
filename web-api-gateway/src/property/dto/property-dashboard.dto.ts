import { ApiProperty } from '@nestjs/swagger';

export class PropertySummaryDto {
    @ApiProperty({ example: 'property-uuid' })
    id: string;

    @ApiProperty({ example: 'Grand Hotel Ljubljana' })
    name: string;

    @ApiProperty({ example: 'Ljubljana, Slovenia' })
    location: string;
}

export class AggregatedAnalyticsDto {
    @ApiProperty({ example: 2400.00 })
    totalRevenue: number;

    @ApiProperty({ example: 8 })
    totalBookings: number;

    @ApiProperty({ example: 67.5 })
    averageOccupancyRate: number;

    @ApiProperty({ example: 180.00 })
    averageAdr: number;
}

export class RoomAnalyticsSummaryDto {
    @ApiProperty({ example: 'room-uuid' })
    roomId: string;

    @ApiProperty({ example: 'Room 101' })
    name: string;

    @ApiProperty({ example: 3 })
    bookingsCount: number;

    @ApiProperty({ example: 900.00 })
    revenue: number;

    @ApiProperty({ example: 75.0 })
    occupancyRate: number;
}

export class PropertyDashboardDto {
    @ApiProperty({ type: PropertySummaryDto })
    property: PropertySummaryDto;

    @ApiProperty({ type: AggregatedAnalyticsDto })
    analytics: AggregatedAnalyticsDto;

    @ApiProperty({ type: [RoomAnalyticsSummaryDto] })
    rooms: RoomAnalyticsSummaryDto[];
}