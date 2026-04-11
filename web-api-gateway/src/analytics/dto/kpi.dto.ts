import {ApiProperty} from '@nestjs/swagger';

export class KpiDto {
    @ApiProperty({example: 180.00, description: 'Average Daily Rate'})
    adr: number;

    @ApiProperty({example: 120.00, description: 'Revenue per Available Room'})
    revpar: number;
}