import axios from 'axios';
import type {Property, PropertyDashboard} from "../types";

const http = axios.create({
    baseURL: import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:3000/api/v1',
});

export const propertiesApi = {
    getAll: () => {
        return http.get<Property[]>('/properties').then((r) => r.data);
    },

    // getAll: async () => {
    //     const r = await http.get<Property[]>('/properties');
    //     return r.data;
    // },

    // implicit return
    getById: (id: string) =>
        http.get<Property>(`/properties/${id}`).then((r) => r.data),

    create: (payload: Omit<Property, 'id' | 'rooms'>) =>
        http.post<Property>('/properties', payload).then((r) => r.data),

    update: (id: string, payload: Partial<Omit<Property, 'id' | 'rooms'>>) =>
        http.put<Property>(`/properties/${id}`, payload).then((r) => r.data),

    remove: (id: string) =>
        http.delete(`/properties/${id}`),

    getDashboard: (id: string, month: string, year: string) => {
        return http.get<PropertyDashboard>(`/properties/${id}/dashboard`, {
            params: {month, year},
        }).then((r) => r.data);
    }
}


