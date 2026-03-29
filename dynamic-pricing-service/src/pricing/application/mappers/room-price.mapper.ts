import {RoomPrice} from "../../domain/model/room-price.entity";
import {RoomPriceResponseDto} from "../dto/room-price.response.dto";

export class RoomPriceMapper {

    static toDto(entity: RoomPrice): RoomPriceResponseDto {
        return new RoomPriceResponseDto(
            entity.roomId,
            entity.basePrice,
            entity.adjustedPrice
        );
    }
}