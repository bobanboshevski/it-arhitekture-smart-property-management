import {Injectable, Logger, OnModuleInit} from "@nestjs/common";
import {BookingEventDto} from "../../application/dto/booking-event.dto";
import * as amqp from 'amqplib'
import {HandleBookingEventUseCase} from "../../application/use-cases/handle-booking-event.use-case";

@Injectable()
export class BookingConsumer implements OnModuleInit {

    // TODO: Update this to use the AppLogger
    private readonly logger = new Logger(BookingConsumer.name)


    async onModuleInit() {

        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue('booking-events');

        channel.consume('booking-events', async (msg) => {
            if (!msg) {
                return;
            }

            const event = JSON.parse(msg.content.toString());

            try {
                await this.handleBooking(event);
                channel.ack(msg);
            } catch (err) {
                this.logger.error('Failed to process message', err);
                channel.nack(msg);
            }


        });

        // await this.rabbitMQService.consume('booking-events', async(msg) => {
        //     const content: BookingEventDto = JSON.parse(msg.content.toString());
        //
        //     this.logger.log(`Received booking event for room ${content.roomId}`);
        //
        //     try {
        //         await this.pricingService.handleBookingEvent(content);
        //         this.rabbitMQService.ack(msg);
        //     } catch (err) {
        //         this.logger.error(`Failed to handle booking event`, err);
        //         this.rabbitMQService.nack(msg, false, true); // requeue for retry
        //     }
        // });
    }

    constructor(
        private readonly useCase: HandleBookingEventUseCase
    ) {
    }

    private async handleBooking(event: any) {
        await this.useCase.execute(event);
    }

}









