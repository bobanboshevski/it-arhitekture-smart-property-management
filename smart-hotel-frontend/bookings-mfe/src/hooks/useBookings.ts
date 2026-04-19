import {useState, useCallback} from 'react';
import {bookingsApi} from '../api/bookings.api';
import type {Booking, CreateBookingPayload, RoomProfile} from '../types';

function extractErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as any).response;
        // Gateway wraps it as message.message
        return response?.data?.message?.message
            ?? response?.data?.message
            ?? response?.data?.error
            ?? 'Something went wrong';
    }
    return 'Something went wrong';
}

export function useBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchByRoom = useCallback(async (roomId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await bookingsApi.getByRoom(roomId);
            setBookings(data.bookings ?? []);
        } catch {
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(async (payload: CreateBookingPayload) => {
        try {
            const created = await bookingsApi.create(payload);
            setBookings((prev) => [...prev, created]);
            return created;
        } catch (err) {
            // Re-throw a clean string so the form can display it
            throw new Error(extractErrorMessage(err));
        }
    }, []);

    const update = useCallback(
        async (id: string, payload: Omit<CreateBookingPayload, 'roomId'>) => {
            try {
                const updated = await bookingsApi.update(id, payload);
                setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
                return updated;
            } catch (err) {
                throw new Error(extractErrorMessage(err));
            }
        },
        [],
    );

    const remove = useCallback(async (id: string) => {
        await bookingsApi.remove(id);
        setBookings((prev) => prev.filter((b) => b.id !== id));
    }, []);

    return {bookings, loading, error, fetchByRoom, create, update, remove};
}

export function useRoomProfile() {
    const [profile, setProfile] = useState<RoomProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async (roomId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await bookingsApi.getRoomProfile(roomId);
            setProfile(data);
        } catch {
            setError('Room profile not available');
        } finally {
            setLoading(false);
        }
    }, []);

    return {profile, loading, error, fetch};
}