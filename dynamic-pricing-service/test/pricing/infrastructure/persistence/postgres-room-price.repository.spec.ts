import {Repository} from 'typeorm';

import {RoomPriceOrmEntity} from "../../../../src/pricing/infrastructure/persistence/entities/room-price.orm-entity";

import {
    PostgresRoomPriceRepository
} from "../../../../src/pricing/infrastructure/persistence/postgres-room-price.repository";
import {RoomPrice} from "../../../../src/pricing/domain/model/room-price.entity";


describe('PostgresRoomPriceRepository', () => {
    let repository: PostgresRoomPriceRepository;
    let mockOrmRepo: jest.Mocked<Repository<RoomPriceOrmEntity>>;

    beforeEach(() => {
        mockOrmRepo = {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
        } as any;

        repository = new PostgresRoomPriceRepository(mockOrmRepo);
    });

    // ── findByRoomId ──────────────────────────────────────────────────────────

    it('returns a RoomPrice domain object when entity exists', async () => {
        const entity = new RoomPriceOrmEntity();
        entity.roomId = 'room-1';
        entity.basePrice = 100;
        entity.adjustedPrice = 130;
        mockOrmRepo.findOne.mockResolvedValue(entity);

        const result = await repository.findByRoomId('room-1');

        expect(result).toBeInstanceOf(RoomPrice);
        expect(result?.roomId).toBe('room-1');
        expect(result?.basePrice).toBe(100);
        expect(result?.adjustedPrice).toBe(130);
    });

    it('returns null when entity does not exist', async () => {
        mockOrmRepo.findOne.mockResolvedValue(null);

        const result = await repository.findByRoomId('nonexistent');

        expect(result).toBeNull();
    });

    it('queries by the correct roomId', async () => {
        mockOrmRepo.findOne.mockResolvedValue(null);

        await repository.findByRoomId('room-42');

        expect(mockOrmRepo.findOne).toHaveBeenCalledWith({
            where: {roomId: 'room-42'},
        });
    });

    // ── save (insert path) ────────────────────────────────────────────────────

    it('creates and saves a new entity when room does not exist yet', async () => {
        mockOrmRepo.findOne.mockResolvedValue(null);
        const createdEntity = new RoomPriceOrmEntity();
        mockOrmRepo.create.mockReturnValue(createdEntity);

        await repository.save(new RoomPrice('room-1', 100, 130));

        expect(mockOrmRepo.create).toHaveBeenCalledWith({
            roomId: 'room-1',
            basePrice: 100,
            adjustedPrice: 130,
        });
        expect(mockOrmRepo.save).toHaveBeenCalledWith(createdEntity);
    });

    // ── save (update path) ────────────────────────────────────────────────────

    it('updates the existing entity when room already has a record', async () => {
        const existing = new RoomPriceOrmEntity();
        existing.roomId = 'room-1';
        existing.basePrice = 100;
        existing.adjustedPrice = 120;
        mockOrmRepo.findOne.mockResolvedValue(existing);

        await repository.save(new RoomPrice('room-1', 100, 150));

        // Should NOT create a new entity
        expect(mockOrmRepo.create).not.toHaveBeenCalled();

        // Should save the mutated existing entity
        expect(existing.adjustedPrice).toBe(150);
        expect(mockOrmRepo.save).toHaveBeenCalledWith(existing);
    });
});