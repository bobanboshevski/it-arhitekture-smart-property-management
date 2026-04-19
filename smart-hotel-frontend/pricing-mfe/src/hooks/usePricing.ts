import {useState, useCallback} from 'react';
import {pricingApi} from '../api/pricing.api';
import type {RoomPrice} from '../types';

export function usePricing() {
    const [price, setPrice] = useState<RoomPrice | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPrice = useCallback(async (roomId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await pricingApi.getRoomPrice(roomId);
            setPrice(data);
        } catch {
            setError('Price not available for this room');
        } finally {
            setLoading(false);
        }
    }, []);

    return {price, loading, error, fetchPrice};
}