import {useState} from 'react';
import type {Room} from '../../types';

interface Props {
    propertyId: string;
    initial?: Partial<Room>;
    onSubmit: (data: Omit<Room, 'id'>) => Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
}

export function RoomForm({propertyId, initial, onSubmit, onCancel, submitLabel = 'Save'}: Props) {
    const [name, setName] = useState(initial?.name ?? '');
    const [capacity, setCapacity] = useState(String(initial?.capacity ?? '1'));
    const [saving, setSaving] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            await onSubmit({name, capacity: Number(capacity), propertyId});
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room name</label>
                <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Room 101"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                    type="number"
                    min="1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                />
            </div>
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