export interface Booking {
    id: string;
    roomId: string;
    guestName: string;
    startDate: string;
    endDate: string;
}

export interface RoomProfile {
    room: {
        id: string;
        name: string;
        capacity: number;
        propertyId: string;
    };
    currentPrice: {
        basePrice: number | null;
        adjustedPrice: number | null;
    };
    available: boolean;
}

export interface CreateBookingPayload {
    roomId: string;
    guestName: string;
    startDate: string;
    endDate: string;
}