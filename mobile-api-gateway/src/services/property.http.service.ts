import axios, {AxiosInstance} from 'axios';

const http: AxiosInstance = axios.create({
    baseURL: process.env.PROPERTY_SERVICE_URL ?? 'http://localhost:8080',
    timeout: 5000,
});

export const propertyHttpService = {
    getAllRooms: async () => {
        const {data} = await http.get('/api/rooms');
        return data;
    },

    getRoomById: async (id: string) => {
        const {data} = await http.get(`/api/rooms/${id}`);
        return data;
    },

    checkRoomExists: async (id: string) => {
        const {data} = await http.get(`/api/rooms/${id}/exists`);
        return data;
    },

    getAllProperties: async () => {
        const {data} = await http.get('/api/properties');
        return data;
    },

    getRoomsByProperty: async (propertyId: string) => {
        const {data} = await http.get(`/api/rooms/property/${propertyId}`);
        return data;
    },
};