import {useState} from 'react';
import {Search, Plus} from 'lucide-react';
import {useBookings} from '../hooks/useBookings';
import {BookingCard} from './BookingCard';
import {BookingForm} from './BookingForm';
import {RoomProfile} from './RoomProfile';
import type {Booking} from '../types';

export function BookingList() {
    const {bookings, loading, error, fetchByRoom, create, update, remove} = useBookings();
    const [roomIdSearch, setRoomIdSearch] = useState('');
    const [searched, setSearched] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Booking | null>(null);
    const [profileRoomId, setProfileRoomId] = useState<string | null>(null);

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!roomIdSearch.trim()) return;
        await fetchByRoom(roomIdSearch.trim());
        setSearched(true);
    }

    if (profileRoomId) {
        return <RoomProfile roomId={profileRoomId} onBack={() => setProfileRoomId(null)}/>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Bookings</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Search by room or create a new booking</p>
                </div>
                <button
                    onClick={() => {
                        setEditing(null);
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
                >
                    <Plus size={16}/>
                    New booking
                </button>
            </div>

            {showForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                    <h3 className="font-medium text-gray-900 mb-4">
                        {editing ? 'Update booking' : 'New booking'}
                    </h3>
                    <BookingForm
                        initial={editing ?? undefined}
                        submitLabel={editing ? 'Update' : 'Create'}
                        onSubmit={async (data) => {
                            if (editing) {
                                await update(editing.id, {
                                    guestName: data.guestName,
                                    startDate: data.startDate,
                                    endDate: data.endDate
                                });
                            } else {
                                await create(data);
                            }
                            setShowForm(false);
                            setEditing(null);
                        }}
                        onCancel={() => {
                            setShowForm(false);
                            setEditing(null);
                        }}
                    />
                </div>
            )}

            <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input
                        className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        value={roomIdSearch}
                        onChange={(e) => setRoomIdSearch(e.target.value)}
                        placeholder="Enter room ID to search bookings…"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Search
                </button>
                {roomIdSearch && (
                    <button
                        type="button"
                        onClick={() => setProfileRoomId(roomIdSearch)}
                        className="border border-gray-300 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Room profile
                    </button>
                )}
            </form>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                    {error}
                </div>
            )}

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="bg-gray-100 rounded-xl h-28 animate-pulse"/>)}
                </div>
            )}

            {searched && !loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bookings.map((b) => (
                        <BookingCard
                            key={b.id}
                            booking={b}
                            onEdit={(b) => {
                                setEditing(b);
                                setShowForm(true);
                            }}
                            onDelete={remove}
                        />
                    ))}
                    {bookings.length === 0 && (
                        <div className="col-span-2 text-center py-12 text-gray-400 text-sm">
                            No bookings found for this room.
                        </div>
                    )}
                </div>
            )}

            {!searched && !loading && (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-sm">Enter a room ID above to view its bookings.</p>
                </div>
            )}
        </div>
    );
}