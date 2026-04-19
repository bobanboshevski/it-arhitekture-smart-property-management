import {useState} from 'react';
import {Search} from 'lucide-react';
import {usePricing} from '../hooks/usePricing';
import {PriceCard} from './PriceCard';

export function PricingLookup() {
    const {price, loading, error, fetchPrice} = usePricing();
    const [roomId, setRoomId] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!roomId.trim()) return;
        await fetchPrice(roomId.trim());
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Dynamic pricing</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                    Look up the current adjusted price for any room
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input
                        className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="Enter room ID…"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-brand-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Loading…' : 'Get price'}
                </button>
            </form>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                    {error}
                </div>
            )}

            {price && <PriceCard price={price}/>}

            {!price && !loading && !error && (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-sm">Enter a room ID to see its current dynamic price.</p>
                </div>
            )}
        </div>
    );
}