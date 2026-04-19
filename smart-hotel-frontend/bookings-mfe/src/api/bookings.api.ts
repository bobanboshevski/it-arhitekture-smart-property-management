import axios from "axios";
import type {Booking, CreateBookingPayload, RoomProfile} from "../types";

const http = axios.create({
    baseURL: import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:3000/api/v1',
});

export const bookingsApi = {
    create: (payload: CreateBookingPayload) =>
        http.post<Booking>('/bookings', payload).then((r) => r.data),

    getById: (id: string) =>
        http.get<Booking>(`/bookings/${id}`).then((r) => r.data),

    update: (
        id: string,
        payload: Omit<CreateBookingPayload, 'roomId'>,
    ) => http.put<Booking>(`/bookings/${id}`, payload).then((r) => r.data),

    remove: (id: string) =>
        http.delete(`/bookings/${id}`),

    getByRoom: (roomId: string) =>
        http.get<{ bookings: Booking[] }>(`/bookings/room/${roomId}`).then((r) => r.data),

    getRoomProfile: (roomId: string) =>
        http.get<RoomProfile>(`/rooms/${roomId}/profile`).then((r) => r.data),

}