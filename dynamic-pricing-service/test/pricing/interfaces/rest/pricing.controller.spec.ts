import { Test, TestingModule } from '@nestjs/testing';

import { NotFoundException } from '@nestjs/common';
import {DynamicPricingController} from "../../../../src/pricing/interfaces/rest/pricing.controller";
import {GetRoomPriceUseCase} from "../../../../src/pricing/application/use-cases/get-room-price.use-case";
import {RoomPriceResponseDto} from "../../../../src/pricing/application/dto/room-price.response.dto";


describe('DynamicPricingController', () => {
    let controller: DynamicPricingController;
    let mockGetRoomPriceUseCase: jest.Mocked<GetRoomPriceUseCase>;

    beforeEach(async () => {
        mockGetRoomPriceUseCase = {
            execute: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            controllers: [DynamicPricingController],
            providers: [
                {
                    provide: GetRoomPriceUseCase,
                    useValue: mockGetRoomPriceUseCase,
                },
            ],
        }).compile();

        controller = module.get<DynamicPricingController>(DynamicPricingController);
    });

    // ── GET /pricing/:roomId ──────────────────────────────────────────────────

    it('returns the room price DTO for a valid roomId', async () => {
        const dto = new RoomPriceResponseDto('room-1', 100, 130);
        mockGetRoomPriceUseCase.execute.mockResolvedValue(dto);

        const result = await controller.getPrice('room-1');

        expect(result).toEqual(dto);
        expect(mockGetRoomPriceUseCase.execute).toHaveBeenCalledWith('room-1');
    });

    it('propagates NotFoundException when room does not exist', async () => {
        mockGetRoomPriceUseCase.execute.mockRejectedValue(
            new NotFoundException('Room room-99 not found'),
        );

        await expect(controller.getPrice('room-99')).rejects.toThrow(
            NotFoundException,
        );
    });

    it('calls use case with the exact roomId from the route param', async () => {
        const dto = new RoomPriceResponseDto('room-abc', 200, 240);
        mockGetRoomPriceUseCase.execute.mockResolvedValue(dto);

        await controller.getPrice('room-abc');

        expect(mockGetRoomPriceUseCase.execute).toHaveBeenCalledWith('room-abc');
    });

    // ── GET /pricing (health check) ───────────────────────────────────────────

    it('health check returns expected string', async () => {
        const result = await controller.healthCheck();
        expect(result).toBe('It runs!');
    });
});