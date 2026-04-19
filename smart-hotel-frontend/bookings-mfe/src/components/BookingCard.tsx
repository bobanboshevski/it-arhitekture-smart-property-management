import {CalendarDays, BedDouble, Pencil, Trash2} from 'lucide-react';
import type {Booking} from '../types';

interface Props {
    booking: Booking;
    onEdit: (b: Booking) => void;
    onDelete: (id: string) => void;
}

export function BookingCard({booking, onEdit, onDelete}: Props) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                        <CalendarDays size={16}/>
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 text-sm">{booking.guestName}</p>
                        <p className="text-xs text-gray-400 font-mono">{booking.id}</p>
                        {/*.slice(0, 8)}...*/}
                    </div>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => onEdit(booking)}
                        className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    >
                        <Pencil size={14}/>
                    </button>
                    <button
                        onClick={() => onDelete(booking.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={14}/>
                    </button>
                </div>
            </div>
            <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <BedDouble size={12}/>
                    <span className="font-mono">{booking.roomId}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CalendarDays size={12}/>
                    <span>{booking.startDate} → {booking.endDate}</span>
                </div>
            </div>
        </div>
    );
}