import {HandleBookingEventUseCase} from "../../../../src/pricing/application/use-cases/handle-booking-event.use-case";
import {RoomPriceRepository} from "../../../../src/pricing/domain/repository/room-price.repository.interface.dto";
import {PricingCalculatorService} from "../../../../src/pricing/domain/services/pricing-calculator.service";
import {BookingEventDto} from "../../../../src/pricing/application/dto/booking-event.dto";
import {RoomPrice} from "../../../../src/pricing/domain/model/room-price.entity";

describe('HandleBookingEventUseCase', () => {
    let useCase: HandleBookingEventUseCase;
    let mockRepository: jest.Mocked<RoomPriceRepository>;
    let mockPricingService: jest.Mocked<PricingCalculatorService>;

    const baseEvent: BookingEventDto = {
        roomId: 'room-1',
        startDate: '2026-07-01',
        endDate: '2026-07-05',
        guestName: 'Boban',
        basePrice: 100,
    };

    beforeEach(() => {
        mockRepository = {
            findByRoomId: jest.fn(),
            save: jest.fn(),
        };

        mockPricingService = {
            calculate: jest.fn().mockReturnValue(130),
        } as any;

        useCase = new HandleBookingEventUseCase(mockPricingService, mockRepository);
    });

    it('uses basePrice from event when room has no existing price record', async () => {
        mockRepository.findByRoomId.mockResolvedValue(null);

        await useCase.execute(baseEvent);

        // calculate should be called with the event's basePrice
        expect(mockPricingService.calculate).toHaveBeenCalledWith(
            100,
            expect.any(Date),
            expect.any(Number),
            expect.any(Number),
        );
    });

    it('uses existing basePrice from repository when record exists', async () => {
        const existing = new RoomPrice('room-1', 150, 180);
        mockRepository.findByRoomId.mockResolvedValue(existing);

        await useCase.execute(baseEvent);

        expect(mockPricingService.calculate).toHaveBeenCalledWith(
            150, // from existing record, not event
            expect.any(Date),
            expect.any(Number),
            expect.any(Number),
        );
    });

    it('saves the new RoomPrice to the repository', async () => {
        mockRepository.findByRoomId.mockResolvedValue(null);
        mockPricingService.calculate.mockReturnValue(130);

        await useCase.execute(baseEvent);

        expect(mockRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
                roomId: 'room-1',
                adjustedPrice: 130,
            }),
        );
    });

    it('calls findByRoomId with the correct roomId', async () => {
        mockRepository.findByRoomId.mockResolvedValue(null);

        await useCase.execute(baseEvent);

        expect(mockRepository.findByRoomId).toHaveBeenCalledWith('room-1');
    });
});