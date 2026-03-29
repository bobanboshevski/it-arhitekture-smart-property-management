// todo: i need to npm isntall typeorm
import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity('room_prices')
export class RoomPriceOrmEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    roomId: string;

    @Column('decimal', {precision: 10, scale: 2})
    basePrice: number;

    @Column('decimal', {precision: 10, scale: 2})
    adjustedPrice: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}