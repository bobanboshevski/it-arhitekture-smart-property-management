import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import type {RoomPriceRepository} from "../../domain/repository/room-price.repository.interface.dto";
import {RoomPriceMapper} from "../mappers/room-price.mapper";


@Injectable()
export class GetRoomPriceUseCase {
    constructor(
        @Inject('RoomPriceRepository')
        private readonly repository: RoomPriceRepository
    ) {

    }

    async execute(roomId: string) {
        const roomPrice = await this.repository.findByRoomId(roomId);

        if (!roomPrice) {
            throw new NotFoundException(`Room ${roomId} not found`);
        }

        return RoomPriceMapper.toDto(roomPrice);
    }
}