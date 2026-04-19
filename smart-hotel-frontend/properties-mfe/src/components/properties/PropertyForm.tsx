import type {Property} from "../../types";
import {useState} from "react";

interface Props {
    initial?: Partial<Property>; // Partial means all fields are optional
    onSubmit: (data: Omit<Property, 'id' | 'rooms'>) => Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
}

// i think this is called controlled form with optional initial state ! !
// destructuring props used in the function
export function PropertyForm({initial, onSubmit, onCancel, submitLabel = 'Save'}: Props) {

    const [name, setName] = useState(initial?.name ?? '');
    const [location, setLocation] = useState(initial?.location ?? '');
    const [basePrice, setBasePrice] = useState(String(initial?.basePrice ?? ''));
    const [saving, setSaving] = useState(false);

    // e: React.FormEvent<HTMLFormElement>
    async function handleSubmit(e: React.FormEvent) { // todo: check this because it's deprecated
        e.preventDefault();
        setSaving(true);
        try {
            await onSubmit({name, location, basePrice: Number(basePrice)});
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property name</label>
                <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Grand Hotel Ljubljana"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ljubljana, Slovenia"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base price (€/night)</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="120.00"
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