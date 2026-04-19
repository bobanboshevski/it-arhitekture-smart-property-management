import {useState} from 'react';
import type {CreateBookingPayload} from '../types';

interface Props {
    initial?: Partial<CreateBookingPayload & { id: string }>;
    onSubmit: (data: CreateBookingPayload) => Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
}

export function BookingForm({initial, onSubmit, onCancel, submitLabel = 'Save'}: Props) {
    const [roomId, setRoomId] = useState(initial?.roomId ?? '');
    const [guestName, setGuestName] = useState(initial?.guestName ?? '');
    const [startDate, setStartDate] = useState(initial?.startDate ?? '');
    const [endDate, setEndDate] = useState(initial?.endDate ?? '');
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null); // ← NEW

    async function handleSubmit(e: React.FormEvent) {

        e.preventDefault();
        setSaving(true);
        setFormError(null); // ← clear previous error
        try {
            await onSubmit({roomId, guestName, startDate, endDate});
        } catch (err: any) {
            // ← catch the error thrown from the hook and display it
            setFormError(err?.message ?? 'Something went wrong');
        } finally {
            setSaving(false);
        }

        e.preventDefault();
        setSaving(true);
        try {
            await onSubmit({roomId, guestName, startDate, endDate});
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {!initial?.id && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room ID</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="room-uuid"
                        required
                    />
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guest name</label>
                <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="John Doe"
                    required
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                    <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                    <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                    />
                </div>
            </div>

            {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                    {formError}
                </div>
            )}

            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-brand-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
                >
                    {saving ? 'Saving…' : submitLabel}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}