import {Building2, MapPin, DollarSign, BarChart2, Pencil, Trash2} from 'lucide-react';
import type {Property} from '../../types';

interface Props {
    property: Property;
    onEdit: (p: Property) => void;
    onDelete: (id: string) => void;
    onDashboard: (p: Property) => void;
    onManageRooms: (p: Property) => void;
}

export function PropertyCard({property, onEdit, onDelete, onDashboard, onManageRooms}: Props) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="bg-brand-100 text-brand-700 p-2 rounded-lg">
                        <Building2 size={20}/>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{property.name}</h3>
                        <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                            <MapPin size={12}/>
                            <span>{property.location}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onEdit(property)}
                        className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    >
                        <Pencil size={14}/>
                    </button>
                    <button
                        onClick={() => onDelete(property.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={14}/>
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-1 text-gray-700 text-sm mb-4">
                <DollarSign size={14} className="text-green-600"/>
                <span className="font-medium">€{property.basePrice}</span>
                <span className="text-gray-400">/ night</span>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => onDashboard(property)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium bg-brand-50 text-brand-700 rounded-lg py-2 hover:bg-brand-100 transition-colors"
                >
                    <BarChart2 size={13}/>
                    Dashboard
                </button>
                <button
                    onClick={() => onManageRooms(property)}
                    className="flex-1 text-xs font-medium border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition-colors"
                >
                    Manage rooms
                </button>
            </div>
        </div>
    );
}