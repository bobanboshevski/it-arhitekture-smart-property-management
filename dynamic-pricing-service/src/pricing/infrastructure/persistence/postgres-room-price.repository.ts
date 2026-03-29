import {Injectable} from "@nestjs/common";
import {RoomPriceRepository} from "../../domain/repository/room-price.repository.interface.dto";
import {RoomPrice} from "src/pricing/domain/model/room-price.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {RoomPriceOrmEntity} from "./entities/room-price.orm-entity";
import {Repository} from "typeorm";


@Injectable()
export class PostgresRoomPriceRepository implements RoomPriceRepository {

    constructor(
        @InjectRepository(RoomPriceOrmEntity)
        private readonly repo: Repository<RoomPriceOrmEntity>
    ) {
    }

    async findByRoomId(roomId: string): Promise<RoomPrice | null> {
        const entity = await this.repo.findOne({where: {roomId: roomId}});

        if (!entity) return null;

        return new RoomPrice(
            entity.roomId, // todo: is doing toString here ok?
            Number(entity.basePrice),
            Number(entity.adjustedPrice)
        );
    }

    async save(roomPrice: RoomPrice): Promise<void> {
        const existing = await this.repo.findOne(
            {
                where: {roomId: roomPrice.roomId}, // + converts it to number
            }
        );

        if (existing) {
            existing.basePrice = roomPrice.basePrice;
            existing.adjustedPrice = roomPrice.adjustedPrice;

            await this.repo.save(existing)
        } else {
            const entity = this.repo.create({
                roomId: roomPrice.roomId,
                basePrice: roomPrice.basePrice,
                adjustedPrice: roomPrice.adjustedPrice
            });

            await this.repo.save(entity);
        }
    }

}


