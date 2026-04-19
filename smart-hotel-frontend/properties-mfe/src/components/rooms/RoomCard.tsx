import {BedDouble, Users, Pencil, Trash2} from 'lucide-react';
import type {Room} from '../../types';

interface Props {
    room: Room;
    onEdit: (r: Room) => void;
    onDelete: (id: string) => void;
}

export function RoomCard({room, onEdit, onDelete}: Props) {
    return (
        <div
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
                    <BedDouble size={18}/>
                </div>
                <div>
                    <p className="font-medium text-gray-900 text-sm">{room.name}</p>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                        <Users size={11}/>
                        <span>{room.capacity} guests</span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-1 select-all">
                        {room.id}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onEdit(room)}
                    className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                >
                    <Pencil size={14}/>
                </button>
                <button
                    onClick={() => onDelete(room.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <Trash2 size={14}/>
                </button>
            </div>
        </div>
    );
}