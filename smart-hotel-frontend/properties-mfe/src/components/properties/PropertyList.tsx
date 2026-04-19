import {useEffect, useState} from 'react';
import {Plus, RefreshCw} from 'lucide-react';
import {useProperties} from '../../hooks/useProperties';
import {PropertyCard} from './PropertyCard';
import {PropertyForm} from './PropertyForm';
import {PropertyDashboard} from './PropertyDashboard';
import {RoomList} from '../rooms/RoomList';
import type {Property} from '../../types';

type View = 'list' | 'dashboard' | 'rooms';

export function PropertyList() {
    const {properties, loading, error, fetchAll, create, update, remove} = useProperties();
    const [view, setView] = useState<View>('list');
    const [selected, setSelected] = useState<Property | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Property | null>(null);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    if (view === 'dashboard' && selected) {
        return <PropertyDashboard property={selected} onBack={() => setView('list')}/>;
    }

    if (view === 'rooms' && selected) {
        return <RoomList property={selected} onBack={() => setView('list')}/>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{properties.length} total</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchAll}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <RefreshCw size={16}/>
                    </button>
                    <button
                        onClick={() => {
                            setEditing(null);
                            setShowForm(true);
                        }}
                        className="flex items-center gap-2 bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
                    >
                        <Plus size={16}/>
                        Add property
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                    <h3 className="font-medium text-gray-900 mb-4">
                        {editing ? 'Edit property' : 'New property'}
                    </h3>
                    <PropertyForm
                        initial={editing ?? undefined}
                        submitLabel={editing ? 'Update' : 'Create'}
                        onSubmit={async (data) => {
                            if (editing) {
                                await update(editing.id, data);
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

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-100 rounded-xl h-44 animate-pulse"/>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {properties.map((p) => (
                        <PropertyCard
                            key={p.id}
                            property={p}
                            onEdit={(p) => {
                                setEditing(p);
                                setShowForm(true);
                            }}
                            onDelete={remove}
                            onDashboard={(p) => {
                                setSelected(p);
                                setView('dashboard');
                            }}
                            onManageRooms={(p) => {
                                setSelected(p);
                                setView('rooms');
                            }}
                        />
                    ))}
                </div>
            )}

            {!loading && properties.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-sm">No properties yet. Add your first one.</p>
                </div>
            )}
        </div>
    );
}