import {Controller, Get} from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckResult,
    HealthCheckService,
    TypeOrmHealthIndicator,
    MemoryHealthIndicator,
    HealthIndicatorResult,
} from '@nestjs/terminus';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {Logger} from '@nestjs/common';
import * as amqplib from 'amqplib';

@Controller('health')
export class HealthController {
    private readonly logger = new Logger(HealthController.name);

    constructor(
        private readonly health: HealthCheckService,
        private readonly db: TypeOrmHealthIndicator,
        private readonly memory: MemoryHealthIndicator,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {
    }

    @Get()
    @HealthCheck()
    async check(): Promise<HealthCheckResult> {
        return this.health.check([
            // Database — verifies TypeORM can reach Postgres
            () => this.db.pingCheck('database', {timeout: 2000}),

            // Memory — alerts if heap exceeds 512 MB (prevents OOM crashes)
            () => this.memory.checkHeap('memory_heap', 512 * 1024 * 1024),

            // RabbitMQ — verifies the message broker is reachable
            () => this.checkRabbitMQ(),
        ]);
    }

    /**
     * Checks RabbitMQ connectivity by opening a short-lived connection.
     * The connection is closed immediately after — this is a probe only.
     */
    private async checkRabbitMQ(): Promise<HealthIndicatorResult> {
        const key = 'rabbitmq';
        const url = process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672';

        try {
            const connection = await Promise.race([
                amqplib.connect(url),
                // Reject if connection takes longer than 3 seconds
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('RabbitMQ connection timeout')), 3000),
                ),
            ]);

            await (connection as amqplib.Connection).close();

            return {[key]: {status: 'up'}};
        } catch (err: any) {
            this.logger.error('RabbitMQ health check failed', err?.message);
            // Terminus catches this and marks the check as down
            throw new Error(`RabbitMQ unreachable: ${err?.message}`);
        }
    }
}