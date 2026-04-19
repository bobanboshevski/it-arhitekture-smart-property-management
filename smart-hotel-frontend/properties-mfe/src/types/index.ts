export interface Room {
    id: string;
    name: string;
    capacity: number;
    propertyId: string;
}

export interface Property {
    id: string;
    name: string;
    location: string;
    basePrice: number;
    rooms?: Room[];
}

export interface RoomAnalytics {
    roomId: string;
    name: string;
    bookingsCount: number;
    revenue: number;
    occupancyRate: number;
    adr: number;
}

export interface PropertyDashboard {
    property: {
        id: string;
        name: string;
        location: string;
    };
    analytics: {
        totalRevenue: number;
        totalBookings: number;
        averageOccupancyRate: number;
        averageAdr: number;
    };
    rooms: RoomAnalytics[];
}