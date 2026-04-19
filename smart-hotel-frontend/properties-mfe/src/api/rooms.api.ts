import axios from "axios";
import type {Room} from "../types";


const http = axios.create({
    baseURL: import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:3000/api/v1',
});

export const roomsApi = {
    getAll: () => {
        return http.get<Room[]>('/rooms').then((r) => r.data);
    },

    getById: (id: string) =>
        http.get<Room>(`/rooms/${id}`).then((r) => r.data),

    getByProperty: (propertyId: string) =>
        http.get<Room[]>(`/rooms/property/${propertyId}`).then((r) => r.data),

    create: (payload: Omit<Room, 'id'>) =>
        http.post<Room>('/rooms', payload).then((r) => r.data),

    update: (id: string, payload: Partial<Omit<Room, 'id'>>) =>
        http.put<Room>(`/rooms/${id}`, payload).then((r) => r.data),

    remove: (id: string) =>
        http.delete(`/rooms/${id}`),

    checkExists: (id: string) =>
        http.get<boolean>(`/rooms/${id}/exists`).then((r) => r.data),

};