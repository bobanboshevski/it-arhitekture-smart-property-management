import {useEffect} from 'react';
import {ArrowLeft, BedDouble, Users, CheckCircle, XCircle, DollarSign} from 'lucide-react';
import {useRoomProfile} from '../hooks/useBookings';

interface Props {
    roomId: string;
    onBack: () => void;
}

export function RoomProfile({roomId, onBack}: Props) {
    const {profile, loading, error, fetch} = useRoomProfile();

    useEffect(() => {
        fetch(roomId);
    }, [fetch, roomId]);

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft size={18}/>
                </button>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Room profile</h2>
                    <p className="text-xs text-gray-400 font-mono">{roomId}</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                    {error}
                </div>
            )}

            {loading && (
                <div className="space-y-4">
                    <div className="bg-gray-100 rounded-xl h-32 animate-pulse"/>
                    <div className="bg-gray-100 rounded-xl h-24 animate-pulse"/>
                </div>
            )}

            {profile && (
                <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
                                <BedDouble size={22}/>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{profile.room.name}</h3>
                                <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                                    <Users size={11}/>
                                    <span>Capacity: {profile.room.capacity}</span>
                                </div>
                            </div>
                            <div className="ml-auto">
                                {profile.available ? (
                                    <div
                                        className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
                                        <CheckCircle size={13}/>
                                        Available
                                    </div>
                                ) : (
                                    <div
                                        className="flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-medium px-3 py-1.5 rounded-full">
                                        <XCircle size={13}/>
                                        Booked
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {profile.currentPrice.adjustedPrice !== null && (
                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <DollarSign size={16} className="text-green-600"/>
                                <h3 className="font-medium text-gray-900 text-sm">Current pricing</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Base price</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        €{profile.currentPrice.basePrice?.toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-emerald-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Dynamic price</p>
                                    <p className="text-lg font-semibold text-emerald-700">
                                        €{profile.currentPrice.adjustedPrice?.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}