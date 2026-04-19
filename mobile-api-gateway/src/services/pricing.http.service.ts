import axios, {AxiosInstance} from 'axios';

const http: AxiosInstance = axios.create({
    baseURL: process.env.PRICING_SERVICE_URL ?? 'http://localhost:3002',
    timeout: 5000,
});

export const pricingHttpService = {
    getRoomPrice: async (roomId: string) => {
        const {data} = await http.get(`/pricing/${roomId}`);
        return data;
    },
};