import {useEffect, useState} from 'react';
import {ArrowLeft, Plus} from 'lucide-react';
import {useRooms} from '../../hooks/useRooms';
import {RoomCard} from './RoomCard';
import {RoomForm} from './RoomForm';
import type {Property, Room} from '../../types';

interface Props {
    property: Property;
    onBack: () => void;
}

export function RoomList({property, onBack}: Props) {
    const {rooms, loading, error, fetchByProperty, create, update, remove} = useRooms();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Room | null>(null);

    useEffect(() => {
        fetchByProperty(property.id);
    }, [fetchByProperty, property.id]);

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft size={18}/>
                </button>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">{property.name} — Rooms</h2>
                    <p className="text-sm text-gray-500">{rooms.length} rooms</p>
                </div>
                <button
                    onClick={() => {
                        setEditing(null);
                        setShowForm(true);
                    }}
                    className="ml-auto flex items-center gap-2 bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
                >
                    <Plus size={16}/>
                    Add room
                </button>
            </div>

            {showForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                    <h3 className="font-medium text-gray-900 mb-4">
                        {editing ? 'Edit room' : 'New room'}
                    </h3>
                    <RoomForm
                        propertyId={property.id}
                        initial={editing ?? undefined}
                        submitLabel={editing ? 'Update' : 'Create'}
                        onSubmit={async (data) => {
                            if (editing) await update(editing.id, data);
                            else await create(data);
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

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="bg-gray-100 rounded-xl h-16 animate-pulse"/>)}
                </div>
            ) : (
                <div className="space-y-3">
                    {rooms.map((r) => (
                        <RoomCard
                            key={r.id}
                            room={r}
                            onEdit={(r) => {
                                setEditing(r);
                                setShowForm(true);
                            }}
                            onDelete={remove}
                        />
                    ))}
                </div>
            )}

            {!loading && rooms.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">
                    No rooms yet for this property.
                </div>
            )}
        </div>
    );
}