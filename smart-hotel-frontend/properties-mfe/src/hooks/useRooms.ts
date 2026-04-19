import {useState, useCallback} from 'react';
import {roomsApi} from '../api/rooms.api';
import type {Room} from '../types';

export function useRooms() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await roomsApi.getAll();
            setRooms(data);
        } catch {
            setError('Failed to load rooms');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchByProperty = useCallback(async (propertyId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await roomsApi.getByProperty(propertyId);
            setRooms(data);
        } catch {
            setError('Failed to load rooms');
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(async (payload: Omit<Room, 'id'>) => {
        const created = await roomsApi.create(payload);
        setRooms((prev) => [...prev, created]);
        return created;
    }, []);

    const update = useCallback(
        async (id: string, payload: Partial<Omit<Room, 'id'>>) => {
            const updated = await roomsApi.update(id, payload);
            setRooms((prev) => prev.map((r) => (r.id === id ? updated : r)));
            return updated;
        },
        [],
    );

    const remove = useCallback(async (id: string) => {
        await roomsApi.remove(id);
        setRooms((prev) => prev.filter((r) => r.id !== id));
    }, []);

    return {rooms, loading, error, fetchAll, fetchByProperty, create, update, remove};
}