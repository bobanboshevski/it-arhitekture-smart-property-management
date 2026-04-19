import axios from 'axios';
import type {RoomPrice} from '../types';

const http = axios.create({
    baseURL: import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:3000/api/v1',
});

export const pricingApi = {
    getRoomPrice: (roomId: string) =>
        http.get<RoomPrice>(`/pricing/${roomId}`).then((r) => r.data),
};