import {Inject, Injectable, Logger} from "@nestjs/common";
import {PricingCalculatorService} from "../../domain/services/pricing-calculator.service";
import type {RoomPriceRepository} from "../../domain/repository/room-price.repository.interface.dto";
import {BookingEventDto} from "../dto/booking-event.dto";
import {RoomPrice} from "../../domain/model/room-price.entity";

@Injectable()
export class HandleBookingEventUseCase {
    private readonly logger = new Logger(HandleBookingEventUseCase.name);

    constructor(
        private readonly pricingService: PricingCalculatorService,
        @Inject('RoomPriceRepository') // todo: why not @InjectRepository?
        private readonly repository: RoomPriceRepository,
    ) {
    }

    async execute(event: BookingEventDto): Promise<void> {

        this.logger.log(`Processing booking event for room ${event.roomId}`);

        const existing = await this.repository.findByRoomId(event.roomId);

        const basePrice = existing?.basePrice ?? event.basePrice;

        // TODO: simulated values - i need to improve it later!
        const occupancyRate = Math.random();
        const demandScore = Math.random();

        this.logger.warn(`I made occupancyRate and demandScore random!`)
        this.logger.warn(`Occupancy rate: ${occupancyRate} and demand score: ${demandScore}`)

        const newPrice = this.pricingService.calculate(
            basePrice,
            new Date(event.startDate),
            occupancyRate,
            demandScore
        );

        const roomPrice = new RoomPrice(event.roomId, basePrice, newPrice);

        await this.repository.save(roomPrice);

        this.logger.log(`Updated price for room ${event.roomId}: ${newPrice}`);
    }

}