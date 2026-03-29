import {RoomPrice} from "../model/room-price.entity";

export interface RoomPriceRepository {

    findByRoomId(roomId: string): Promise<RoomPrice | null>;
    save(roomPrice: RoomPrice): Promise<void>;
}