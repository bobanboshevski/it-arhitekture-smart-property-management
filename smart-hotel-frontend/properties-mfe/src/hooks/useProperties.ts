import {useCallback, useState} from "react";
import type {Property, PropertyDashboard} from "../types";
import {propertiesApi} from "../api/properties.api.ts";


export function useProperties() {

    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await propertiesApi.getAll();
            setProperties(data);
        } catch {
            setError('Failed to load properties');
        } finally {
            setLoading(false);
        }
    }, []);

    // with Omit we reuse the same interface
    const create = useCallback(
        async (payload: Omit<Property, 'id' | 'rooms'>) => {
            const created = await propertiesApi.create(payload);
            setProperties((prev) => [...prev, created]);
            return created;
        },
        [],
    );
    const update = useCallback(
        async (id: string, payload: Partial<Omit<Property, 'id' | 'rooms'>>) => {
            const updated = await propertiesApi.update(id, payload);
            setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)));
            return updated;
        },
        [],
    );

    const remove = useCallback(async (id: string) => {
        await propertiesApi.remove(id);
        setProperties((prev) => prev.filter((p) => p.id !== id));
    }, []);

    return {properties, loading, error, fetchAll, create, update, remove};

}

export function useDashboard() {
    const [dashboard, setDashboard] = useState<PropertyDashboard | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(
        async (id: string, month: string, year: string) => {
            setLoading(true);
            setError(null);
            try {
                const data = await propertiesApi.getDashboard(id, month, year);
                setDashboard(data);
            } catch {
                setError('Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    return { dashboard, loading, error, fetch };
}