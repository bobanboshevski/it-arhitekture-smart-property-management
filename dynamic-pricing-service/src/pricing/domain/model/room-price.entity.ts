export class RoomPrice {
    constructor(
        public roomId: string,
        public basePrice: number, // todo:  maybe i wont need this
        public adjustedPrice: number,
    ) {
    }
}