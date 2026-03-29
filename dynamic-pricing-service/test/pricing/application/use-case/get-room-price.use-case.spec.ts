
import { NotFoundException } from '@nestjs/common';
import {GetRoomPriceUseCase} from "../../../../src/pricing/application/use-cases/get-room-price.use-case";
import {RoomPriceRepository} from "../../../../src/pricing/domain/repository/room-price.repository.interface.dto";
import {RoomPrice} from "../../../../src/pricing/domain/model/room-price.entity";

describe('GetRoomPriceUseCase', () => {
    let useCase: GetRoomPriceUseCase;
    let mockRepository: jest.Mocked<RoomPriceRepository>;

    beforeEach(() => {
        mockRepository = {
            findByRoomId: jest.fn(),
            save: jest.fn(),
        };

        useCase = new GetRoomPriceUseCase(mockRepository);
    });

    it('returns a mapped DTO when room exists', async () => {
        mockRepository.findByRoomId.mockResolvedValue(
            new RoomPrice('room-1', 100, 130),
        );

        const result = await useCase.execute('room-1');

        expect(result).toEqual({
            roomId: 'room-1',
            basePrice: 100,
            adjustedPrice: 130,
        });
    });

    it('throws NotFoundException when room does not exist', async () => {
        mockRepository.findByRoomId.mockResolvedValue(null);

        await expect(useCase.execute('nonexistent-room')).rejects.toThrow(
            NotFoundException,
        );
    });

    it('throws NotFoundException with a message containing the roomId', async () => {
        mockRepository.findByRoomId.mockResolvedValue(null);

        await expect(useCase.execute('room-99')).rejects.toThrow('room-99');
    });

    it('calls repository with the correct roomId', async () => {
        mockRepository.findByRoomId.mockResolvedValue(
            new RoomPrice('room-1', 100, 130),
        );

        await useCase.execute('room-1');

        expect(mockRepository.findByRoomId).toHaveBeenCalledWith('room-1');
    });
});